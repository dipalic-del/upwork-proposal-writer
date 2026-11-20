"""
Supabase PostgreSQL & Vector Storage Service.

Manages profile records and vector similarity matching using Supabase with pgvector.
Maintains a file-backed in-memory fallback for offline development and testing.
The file cache is shared across all uvicorn worker processes so data persists
even when Supabase is not yet configured.
"""

import logging
import uuid
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.database import get_supabase
from app.models import ProfileCreate, ProfileUpdate, ProfileResponse
from app.services.embedding_service import calculate_cosine_similarity

logger = logging.getLogger(__name__)

# ── File-backed local cache (shared across all uvicorn worker processes) ──────
_CACHE_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "local_profiles_cache.json")
_CACHE_FILE = os.path.normpath(_CACHE_FILE)

_local_profiles_cache: Dict[str, Dict[str, Any]] = {}


def _load_cache_from_disk() -> None:
    """Load profiles from JSON file into the in-memory dict on startup."""
    global _local_profiles_cache
    try:
        if os.path.exists(_CACHE_FILE):
            with open(_CACHE_FILE, "r", encoding="utf-8") as f:
                _local_profiles_cache = json.load(f)
            logger.info(f"Local cache loaded: {len(_local_profiles_cache)} profiles from {_CACHE_FILE}")
    except Exception as e:
        logger.warning(f"Could not load local cache from disk: {e}")
        _local_profiles_cache = {}


def _save_cache_to_disk() -> None:
    """Persist the in-memory cache to disk so all workers can read it."""
    try:
        with open(_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(_local_profiles_cache, f, default=str, indent=2)
    except Exception as e:
        logger.warning(f"Could not save local cache to disk: {e}")


# Load on module import (each worker loads the shared file on startup)
_load_cache_from_disk()


def _parse_vector(raw_vector: Any) -> Optional[List[float]]:
    """
    Safely converts vector formats (PostgreSQL string, JSON string, or list) into a list of floats.

    Args:
        raw_vector (Any): Raw vector data from Supabase or memory.

    Returns:
        Optional[List[float]]: Parsed list of floats or None if invalid.
    """
    if raw_vector is None:
        return None
    if isinstance(raw_vector, list):
        return [float(x) for x in raw_vector]
    if isinstance(raw_vector, str):
        cleaned = raw_vector.strip()
        try:
            parsed = json.loads(cleaned)
            if isinstance(parsed, list):
                return [float(x) for x in parsed]
        except Exception:
            pass
        # Handle string like '[0.123, -0.456, ...]'
        if cleaned.startswith("[") and cleaned.endswith("]"):
            elements = cleaned[1:-1].split(",")
            return [float(x.strip()) for x in elements if x.strip()]
    return None


def create_profile(profile_in: ProfileCreate, embedding: List[float]) -> ProfileResponse:
    """
    Creates a new freelancer profile and stores its metadata and embedding in Supabase.
    Deduplicates candidates by name: if a profile with the same name already exists,
    updates that record instead of adding a duplicate row.

    Args:
        profile_in (ProfileCreate): Validated profile input data.
        embedding (List[float]): 384-dimensional vector embedding.

    Returns:
        ProfileResponse: Persisted profile object with generated ID and timestamps.
    """
    _load_cache_from_disk()

    # Deduplication guard: check if candidate with this name already exists
    target_name = profile_in.name.strip().lower()
    for pid, pdata in _local_profiles_cache.items():
        if pdata.get("name", "").strip().lower() == target_name:
            # Update the existing profile record with latest attributes and embedding
            update_data = ProfileUpdate(**profile_in.dict())
            updated = update_profile(pid, update_data, embedding)
            if updated:
                return updated

    profile_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat()

    record: Dict[str, Any] = {
        "id": profile_id,
        "name": profile_in.name,
        "title": profile_in.title,
        "hourly_rate": profile_in.hourly_rate,
        "bio": profile_in.bio,
        "skills": profile_in.skills,
        "experience_summary": profile_in.experience_summary,
        "portfolio_items": profile_in.portfolio_items or [],
        "past_proposals": profile_in.past_proposals or [],
        "location": profile_in.location or "",
        "agency": profile_in.agency or "",
        "job_success_score": profile_in.job_success_score or "",
        "total_earnings": profile_in.total_earnings or "",
        "total_jobs": profile_in.total_jobs or 0,
        "total_hours": profile_in.total_hours or "",
        "availability": profile_in.availability or "",
        "response_time": profile_in.response_time or "",
        "languages": profile_in.languages or [],
        "working_style": profile_in.working_style or [],
        "badges": profile_in.badges or [],
        "education": profile_in.education or [],
        "certifications": profile_in.certifications or [],
        "work_history": profile_in.work_history or [],
        "testimonials": profile_in.testimonials or [],
        "embedding": embedding,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    supabase = get_supabase()
    if supabase is not None:
        try:
            res = supabase.table("profiles").insert(record).execute()
            if res.data and len(res.data) > 0:
                saved = res.data[0]
                _local_profiles_cache[profile_id] = saved
                _save_cache_to_disk()
                return ProfileResponse(**{k: v for k, v in saved.items() if k != "embedding"})
        except Exception as e:
            logger.warning(f"Supabase insert failed ({e}). Storing in local cache.")

    # Local file-backed fallback
    _local_profiles_cache[profile_id] = record
    _save_cache_to_disk()
    return ProfileResponse(**{k: v for k, v in record.items() if k != "embedding"})


def list_profiles() -> List[ProfileResponse]:
    """
    Retrieves all registered freelancer profiles, ensuring no duplicate candidates by name.

    Returns:
        List[ProfileResponse]: Deduplicated collection of profile objects.
    """
    supabase = get_supabase()
    if supabase is not None:
        try:
            res = supabase.table("profiles").select("*").order("created_at", desc=True).execute()
            if res.data is not None:
                seen_names = set()
                unique_remote = []
                for item in res.data:
                    n_key = item.get("name", "").strip().lower()
                    if n_key and n_key not in seen_names:
                        seen_names.add(n_key)
                        unique_remote.append(ProfileResponse(**{k: v for k, v in item.items() if k != "embedding"}))
                return unique_remote
        except Exception as e:
            logger.warning(f"Supabase profile listing failed ({e}). Falling back to local cache.")

    # Reload from disk so all worker processes see the latest data
    _load_cache_from_disk()
    seen_names = set()
    unique_local = []
    # Sort newest first
    for item in sorted(_local_profiles_cache.values(), key=lambda x: x.get("updated_at", x.get("created_at", "")), reverse=True):
        n_key = item.get("name", "").strip().lower()
        if n_key and n_key not in seen_names:
            seen_names.add(n_key)
            unique_local.append(ProfileResponse(**{k: v for k, v in item.items() if k != "embedding"}))

    return unique_local


def get_profile_by_id(profile_id: str) -> Optional[ProfileResponse]:
    """
    Retrieves a single profile by its unique identifier.

    Args:
        profile_id (str): UUID of the profile.

    Returns:
        Optional[ProfileResponse]: Found profile or None if non-existent.
    """
    supabase = get_supabase()
    if supabase is not None:
        try:
            res = supabase.table("profiles").select("*").eq("id", profile_id).single().execute()
            if res.data:
                return ProfileResponse(**{k: v for k, v in res.data.items() if k != "embedding"})
        except Exception as e:
            logger.warning(f"Supabase fetch by ID failed for {profile_id}: {e}")

    # Reload from disk — another worker process may have written this profile
    _load_cache_from_disk()
    if profile_id in _local_profiles_cache:
        return ProfileResponse(**{k: v for k, v in _local_profiles_cache[profile_id].items() if k != "embedding"})
    return None


def update_profile(
    profile_id: str,
    profile_update: ProfileUpdate,
    embedding: Optional[List[float]] = None
) -> Optional[ProfileResponse]:
    """
    Updates profile fields and optionally recalculates the embedding vector.

    Args:
        profile_id (str): Target profile UUID.
        profile_update (ProfileUpdate): Partial fields to update.
        embedding (Optional[List[float]]): New embedding vector if bio/skills changed.

    Returns:
        Optional[ProfileResponse]: Updated profile object.
    """
    update_data = {k: v for k, v in profile_update.dict(exclude_unset=True).items()}
    if embedding is not None:
        update_data["embedding"] = embedding
    update_data["updated_at"] = datetime.utcnow().isoformat()

    supabase = get_supabase()
    if supabase is not None:
        try:
            res = supabase.table("profiles").update(update_data).eq("id", profile_id).execute()
            if res.data and len(res.data) > 0:
                updated = res.data[0]
                _local_profiles_cache[profile_id] = updated
                _save_cache_to_disk()
                return ProfileResponse(**{k: v for k, v in updated.items() if k != "embedding"})
        except Exception as e:
            logger.warning(f"Supabase update failed for {profile_id}: {e}")

    _load_cache_from_disk()
    if profile_id in _local_profiles_cache:
        _local_profiles_cache[profile_id].update(update_data)
        _save_cache_to_disk()
        return ProfileResponse(**{k: v for k, v in _local_profiles_cache[profile_id].items() if k != "embedding"})
    return None


def delete_profile(profile_id: str) -> bool:
    """
    Deletes a profile by ID from Supabase and the local cache.

    Args:
        profile_id (str): Profile UUID.

    Returns:
        bool: True if deletion succeeded, False otherwise.
    """
    deleted = False
    supabase = get_supabase()
    if supabase is not None:
        try:
            supabase.table("profiles").delete().eq("id", profile_id).execute()
            deleted = True
        except Exception as e:
            logger.warning(f"Supabase delete failed for {profile_id}: {e}")

    _load_cache_from_disk()
    if profile_id in _local_profiles_cache:
        del _local_profiles_cache[profile_id]
        _save_cache_to_disk()
        deleted = True

    return deleted


def search_matching_profiles(
    query_embedding: List[float],
    match_count: int = 5,
    match_threshold: float = 0.0
) -> List[Dict[str, Any]]:
    """
    Performs nearest-neighbor vector similarity matching.
    Attempts Supabase stored procedure `match_profiles` first,
    falling back to Python in-memory cosine similarity calculation.

    Args:
        query_embedding (List[float]): Dense query vector.
        match_count (int): Maximum number of top candidates to return.
        match_threshold (float): Minimum similarity threshold (0.0 to 1.0).

    Returns:
        List[Dict[str, Any]]: Sorted candidate dictionaries with 'similarity' key.
    """
    supabase = get_supabase()
    if supabase is not None:
        try:
            rpc_res = supabase.rpc("match_profiles", {
                "query_embedding": query_embedding,
                "match_threshold": match_threshold,
                "match_count": match_count
            }).execute()
            if rpc_res.data:
                return rpc_res.data
        except Exception as rpc_err:
            logger.info(f"Supabase RPC match_profiles not available ({rpc_err}); calculating client-side.")
            try:
                # Query profiles and compute similarity client-side
                res = supabase.table("profiles").select("*").execute()
                if res.data:
                    scored = []
                    for row in res.data:
                        emb = _parse_vector(row.get("embedding"))
                        if emb:
                            sim = calculate_cosine_similarity(query_embedding, emb)
                            scored.append({**row, "similarity": sim})
                    scored.sort(key=lambda x: x["similarity"], reverse=True)
                    return scored[:match_count]
            except Exception as query_err:
                logger.error(f"Supabase client-side search failed: {query_err}")

    # Local file-backed vector search fallback — reload so all workers see fresh data
    _load_cache_from_disk()
    scored = []
    for item in _local_profiles_cache.values():
        emb = _parse_vector(item.get("embedding"))
        if emb:
            sim = calculate_cosine_similarity(query_embedding, emb)
            scored.append({**item, "similarity": sim})

    scored.sort(key=lambda x: x["similarity"], reverse=True)
    return scored[:match_count]

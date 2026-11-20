"""
Semantic Job Matcher Router.

Handles embedding generation of incoming Upwork job requirements,
vector similarity search against registered profiles in Supabase pgvector,
and synthesis of match explanations.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from app.models import (
    JobRequirementInput,
    MatchResponse,
    ProfileMatchResult,
    ProfileResponse
)
from app.services import embedding_service, supabase_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/match", tags=["Semantic Matcher"])


def _build_match_reasons(matched_skills: List[str], similarity_pct: float) -> List[str]:
    """Helper to synthesize human-readable justification for the candidate match."""
    reasons: List[str] = []
    if matched_skills:
        reasons.append(f"Direct alignment on target skills: {', '.join(matched_skills[:4])}")

    if similarity_pct >= 75.0:
        reasons.append("High semantic alignment between past project experience and job scope")
    elif similarity_pct >= 50.0:
        reasons.append("Moderate domain overlap with technical requirements")
    else:
        reasons.append("Partial capability match")

    return reasons


@router.post(
    "",
    response_model=MatchResponse,
    summary="Match job requirements against profiles",
    description="Vectorizes the job title, description, and required skills, then performs a cosine similarity query in Supabase pgvector."
)
def match_job_requirements(job_input: JobRequirementInput) -> MatchResponse:
    """
    Vectorizes the Upwork job requirement and matches against existing freelancer
    profiles in Supabase pgvector using cosine similarity.
    """
    try:
        # Step 1: Synthesize query text and vectorize
        query_text = embedding_service.build_job_text(
            job_title=job_input.job_title,
            job_description=job_input.job_description,
            required_skills=job_input.required_skills
        )
        query_vector = embedding_service.generate_embedding(query_text)

        # Step 2: Query Supabase pgvector (with automatic fallback)
        raw_matches = supabase_service.search_matching_profiles(
            query_embedding=query_vector,
            match_count=job_input.match_count,
            match_threshold=0.0
        )

        job_full_text = f"{job_input.job_title} {job_input.job_description}".lower()

        # Step 3: Format and rank matches
        match_results: List[ProfileMatchResult] = []
        for match in raw_matches:
            raw_sim = match.get("similarity", 0.0)
            sim_pct = max(0.0, min(100.0, round(float(raw_sim) * 100.0, 1)))

            skills = match.get("skills") or []
            matched_skills = [s for s in skills if s.lower() in job_full_text]
            reasons = _build_match_reasons(matched_skills, sim_pct)

            profile_obj = ProfileResponse(
                id=str(match.get("id")),
                name=match.get("name", "Unknown"),
                title=match.get("title", ""),
                hourly_rate=float(match.get("hourly_rate") or 0.0),
                bio=match.get("bio", ""),
                skills=match.get("skills") or [],
                experience_summary=match.get("experience_summary", ""),
                portfolio_items=match.get("portfolio_items") or [],
                past_proposals=match.get("past_proposals") or [],
                location=match.get("location", ""),
                agency=match.get("agency", ""),
                job_success_score=match.get("job_success_score", ""),
                total_earnings=match.get("total_earnings", ""),
                total_jobs=match.get("total_jobs", 0),
                total_hours=match.get("total_hours", ""),
                availability=match.get("availability", ""),
                response_time=match.get("response_time", ""),
                languages=match.get("languages") or [],
                working_style=match.get("working_style") or [],
                badges=match.get("badges") or [],
                education=match.get("education") or [],
                certifications=match.get("certifications") or [],
                work_history=match.get("work_history") or [],
                testimonials=match.get("testimonials") or [],
                created_at=match.get("created_at"),
                updated_at=match.get("updated_at")
            )

            match_results.append(ProfileMatchResult(
                profile=profile_obj,
                similarity_percentage=sim_pct,
                matched_skills=matched_skills,
                match_reasons=reasons
            ))

        return MatchResponse(
            total_profiles=len(match_results),
            matches=match_results
        )

    except Exception as e:
        logger.error(f"Error matching job requirements: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic matching failed: {str(e)}"
        )

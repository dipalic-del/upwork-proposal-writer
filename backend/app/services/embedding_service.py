"""
Hugging Face Embedding Service.

Provides vector embedding generation using the free Sentence-Transformers model
('sentence-transformers/all-MiniLM-L6-v2') locally on CPU, with fallback
to the Hugging Face serverless Inference API.
"""

from typing import List, Optional
import numpy as np
import logging
from app.config import settings
from app.models import ProfileBase

logger = logging.getLogger(__name__)

# Constants
EMBEDDING_DIM: int = 384
DEFAULT_ZERO_VECTOR: List[float] = [0.0] * EMBEDDING_DIM

_model = None


def get_embedding_model():
    """
    Lazy-loads and returns the singleton SentenceTransformer model.
    Loads locally to avoid per-request latency and external API costs.
    """
    global _model
    if _model is not None:
        return _model

    try:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading local SentenceTransformer model: {settings.EMBEDDING_MODEL_NAME}")
        # Try local cache first for sub-second offline initialization
        try:
            _model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME, local_files_only=True)
        except Exception:
            _model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
        logger.info("SentenceTransformer model successfully initialized.")
        return _model
    except Exception as e:
        logger.error(f"Failed to load local SentenceTransformer: {e}")
        return None


def generate_embedding(text: str) -> List[float]:
    """
    Generates a 384-dimensional dense vector embedding for the input text.

    Args:
        text (str): Input text string to vectorize.

    Returns:
        List[float]: Normalized 384-dimensional floating point vector.
    """
    clean_text = text.strip() if text else ""
    if not clean_text:
        return DEFAULT_ZERO_VECTOR.copy()

    # Strategy 1: Local Sentence-Transformers execution
    model = get_embedding_model()
    if model is not None:
        try:
            vector = model.encode(clean_text, normalize_embeddings=True)
            return vector.tolist()
        except Exception as encode_err:
            logger.error(f"Local encoding failed: {encode_err}. Attempting fallback.")

    # Strategy 2: Hugging Face Inference API if HF_TOKEN is configured
    if settings.HF_TOKEN:
        try:
            import httpx
            headers = {"Authorization": f"Bearer {settings.HF_TOKEN}"}
            api_url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{settings.EMBEDDING_MODEL_NAME}"
            with httpx.Client(timeout=12.0) as client:
                response = client.post(api_url, headers=headers, json={"inputs": clean_text})
                if response.status_code == 200:
                    emb = response.json()
                    if isinstance(emb, list) and len(emb) > 0:
                        if isinstance(emb[0], list):
                            emb = emb[0]
                        # Ensure exactly EMBEDDING_DIM length
                        if len(emb) >= EMBEDDING_DIM:
                            return [float(x) for x in emb[:EMBEDDING_DIM]]
                        return [float(x) for x in emb] + [0.0] * (EMBEDDING_DIM - len(emb))
        except Exception as api_err:
            logger.error(f"Hugging Face Inference API embedding failed: {api_err}")

    # Strategy 3: Safe zero-vector fallback for offline/isolated startup
    logger.warning("All embedding strategies unavailable; returning zero-vector.")
    return DEFAULT_ZERO_VECTOR.copy()


def build_profile_text(profile: ProfileBase) -> str:
    """
    Builds a structured semantic representation of a freelancer profile
    for generating domain-dense vector embeddings.

    Args:
        profile (ProfileBase): The candidate profile object.

    Returns:
        str: Multi-line aggregated text chunk.
    """
    skills_formatted = ", ".join(profile.skills) if profile.skills else "General Software Development"
    lines = [
        f"Professional Headline: {profile.title}",
        f"Core Technical Competencies: {skills_formatted}",
        f"Executive Bio: {profile.bio}",
    ]

    if getattr(profile, "agency", None):
        agency_info = f"Agency Affiliation: {profile.agency}"
        if getattr(profile, "job_success_score", None):
            agency_info += f" ({profile.job_success_score})"
        lines.append(agency_info)

    if getattr(profile, "experience_summary", None):
        lines.append(f"Domain & Experience Summary: {profile.experience_summary}")

    if getattr(profile, "working_style", None):
        lines.append(f"Working Style: {', '.join(profile.working_style)}")

    if getattr(profile, "certifications", None):
        cert_names = [c.get("name", "") for c in profile.certifications if isinstance(c, dict) and c.get("name")]
        if cert_names:
            lines.append(f"Certifications: {', '.join(cert_names)}")

    if getattr(profile, "work_history", None):
        history_titles = [h.get("title", "") for h in profile.work_history if isinstance(h, dict) and h.get("title")]
        if history_titles:
            lines.append(f"Past Upwork Projects: {' | '.join(history_titles)}")

    if getattr(profile, "testimonials", None):
        quotes = [t.get("quote", "") for t in profile.testimonials if isinstance(t, dict) and t.get("quote")]
        if quotes:
            lines.append(f"Client Endorsement Highlights: {' '.join(quotes[:2])}")

    if profile.portfolio_items:
        project_entries = []
        for p in profile.portfolio_items:
            title = p.get("title", "Project")
            desc = p.get("description", "")
            tech = ", ".join(p.get("tech_stack", []))
            project_entries.append(f"{title}: {desc} (Technologies: {tech})")
        lines.append(f"Portfolio Evidence: {' | '.join(project_entries)}")

    return "\n".join(lines)


def build_job_text(job_title: str, job_description: str, required_skills: Optional[List[str]] = None) -> str:
    """
    Builds a semantic query text representation from an Upwork job post.

    Args:
        job_title (str): Title of the job posting.
        job_description (str): Full text of the requirements.
        required_skills (Optional[List[str]]): Tagged required skills.

    Returns:
        str: Structured query text for vector search.
    """
    sections = [
        f"Job Title: {job_title}",
        f"Job Scope & Description: {job_description}",
    ]
    if required_skills:
        sections.append(f"Required Skills: {', '.join(required_skills)}")
    return "\n".join(sections)


def calculate_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """
    Computes cosine similarity between two vector lists.

    Args:
        vec_a (List[float]): First embedding vector.
        vec_b (List[float]): Second embedding vector.

    Returns:
        float: Cosine similarity score between -1.0 and 1.0 (typically 0.0 to 1.0).
    """
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0

    a = np.asarray(vec_a, dtype=np.float32)
    b = np.asarray(vec_b, dtype=np.float32)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return float(np.dot(a, b) / (norm_a * norm_b))

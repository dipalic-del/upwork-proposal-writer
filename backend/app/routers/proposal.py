"""
Proposal Generator Router.

Synthesizes matched profile attributes and job requirements into an Upwork-ready
proposal with custom hook, problem solution, portfolio citations, and screening question answers.
"""

from fastapi import APIRouter, HTTPException, status
from app.models import (
    ProposalGenerateRequest,
    ProposalGenerateResponse,
    ProfileBase
)
from app.services import supabase_service, proposal_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/proposal", tags=["Proposal Generator"])


@router.post(
    "/generate",
    response_model=ProposalGenerateResponse,
    summary="Generate a tailored Upwork proposal",
    description="Synthesizes candidate background with job specifications to generate an interview-winning Upwork cover letter."
)
def generate_proposal(req: ProposalGenerateRequest) -> ProposalGenerateResponse:
    """
    Synthesizes the selected profile's skills and case studies with the Upwork job description
    to produce a tailored Upwork proposal and screening question answers.
    """
    try:
        # Look up profile from storage by profile_id
        fetched = supabase_service.get_profile_by_id(req.profile_id)
        if not fetched:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Selected profile '{req.profile_id}' not found. Make sure profiles are loaded first."
            )

        profile_data = ProfileBase(
            name=fetched.name,
            title=fetched.title,
            hourly_rate=fetched.hourly_rate,
            bio=fetched.bio,
            skills=fetched.skills,
            experience_summary=fetched.experience_summary or "",
            portfolio_items=fetched.portfolio_items or [],
            past_proposals=fetched.past_proposals or [],
            location=fetched.location or "",
            agency=fetched.agency or "",
            job_success_score=fetched.job_success_score or "",
            total_earnings=fetched.total_earnings or "",
            total_jobs=fetched.total_jobs or 0,
            total_hours=fetched.total_hours or "",
            availability=fetched.availability or "",
            response_time=fetched.response_time or "",
            languages=fetched.languages or [],
            working_style=fetched.working_style or [],
            badges=fetched.badges or [],
            education=fetched.education or [],
            certifications=fetched.certifications or [],
            work_history=fetched.work_history or [],
            testimonials=fetched.testimonials or [],
        )

        return proposal_service.generate_upwork_proposal(req, profile_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating proposal: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Proposal generation failed: {str(e)}"
        )

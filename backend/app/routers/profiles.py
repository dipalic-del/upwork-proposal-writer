"""
Profiles API Router.

Provides endpoints to manage freelancer and agency profiles,
including creation with automated vectorization, updates, deletion,
and seeding of demo profiles.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from app.models import ProfileCreate, ProfileUpdate, ProfileResponse, RawUpworkProfileRequest
from app.services import supabase_service, embedding_service
from app.services.upwork_parser_service import parse_raw_upwork_profile
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/profiles", tags=["Profiles"])


@router.post(
    "/parse-raw-upwork",
    response_model=ProfileCreate,
    summary="Parse raw Upwork profile text",
    description="Extracts structured fields (name, rate, bio, skills, agency, location, badges, testimonials, etc.) from raw text copied directly from an Upwork profile."
)
def parse_raw_upwork_text(payload: RawUpworkProfileRequest) -> ProfileCreate:
    """Parse raw unformatted Upwork profile text into a clean ProfileCreate object."""
    try:
        data = parse_raw_upwork_profile(payload.raw_text)
        return ProfileCreate(**data)
    except Exception as e:
        logger.error(f"Error parsing raw Upwork profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse Upwork profile text: {str(e)}"
        )


@router.get(
    "",
    response_model=List[ProfileResponse],
    summary="List all freelancer profiles",
    description="Returns all profiles stored in Supabase (or the local cache) ordered by creation date."
)
def get_all_profiles() -> List[ProfileResponse]:
    """Retrieve all freelancer profiles."""
    try:
        return supabase_service.list_profiles()
    except Exception as e:
        logger.error(f"Error fetching profiles: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profiles from storage."
        )


@router.post(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new profile with vector embedding",
    description="Registers a profile and automatically computes its 384-dimensional vector embedding."
)
def add_profile(profile: ProfileCreate) -> ProfileResponse:
    """Add a new freelancer profile and generate its vector embedding."""
    try:
        profile_text = embedding_service.build_profile_text(profile)
        embedding = embedding_service.generate_embedding(profile_text)
        created = supabase_service.create_profile(profile, embedding)
        return created
    except Exception as e:
        logger.error(f"Error adding profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create profile: {str(e)}"
        )


@router.get(
    "/{profile_id}",
    response_model=ProfileResponse,
    summary="Get profile by ID"
)
def get_profile(profile_id: str) -> ProfileResponse:
    """Retrieve a single profile by its unique ID."""
    profile = supabase_service.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile with ID '{profile_id}' not found."
        )
    return profile


@router.put(
    "/{profile_id}",
    response_model=ProfileResponse,
    summary="Update existing profile"
)
def update_profile(profile_id: str, profile_update: ProfileUpdate) -> ProfileResponse:
    """Update profile attributes and re-calculate embedding if core attributes changed."""
    existing = supabase_service.get_profile_by_id(profile_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile with ID '{profile_id}' not found."
        )

    embedding = None
    # If skills, bio, title, agency, or experience are modified, recalculate embedding
    if any([
        profile_update.bio is not None,
        profile_update.skills is not None,
        profile_update.title is not None,
        profile_update.agency is not None,
        profile_update.experience_summary is not None,
    ]):
        existing_dict = existing.model_dump() if hasattr(existing, "model_dump") else existing.dict()
        update_dict = profile_update.model_dump(exclude_unset=True) if hasattr(profile_update, "model_dump") else profile_update.dict(exclude_unset=True)
        merged_dict = {**existing_dict, **update_dict}
        # Filter out id, created_at, updated_at for ProfileCreate
        merged_dict.pop("id", None)
        merged_dict.pop("created_at", None)
        merged_dict.pop("updated_at", None)
        merged_profile = ProfileCreate(**merged_dict)
        text = embedding_service.build_profile_text(merged_profile)
        embedding = embedding_service.generate_embedding(text)

    updated = supabase_service.update_profile(profile_id, profile_update, embedding)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile record."
        )
    return updated


@router.delete(
    "/{profile_id}",
    summary="Delete a profile",
    responses={
        200: {"description": "Profile successfully deleted"},
        404: {"description": "Profile not found"}
    }
)
def delete_profile(profile_id: str) -> Dict[str, str]:
    """Remove a profile from Supabase and the local cache."""
    success = supabase_service.delete_profile(profile_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile with ID '{profile_id}' not found or deletion failed."
        )
    return {"status": "success", "message": f"Profile '{profile_id}' successfully deleted."}


@router.post(
    "/seed",
    response_model=List[ProfileResponse],
    summary="Seed sample profiles",
    description="Seeds 3 realistic freelancer profiles with embeddings for instant application testing."
)
def seed_sample_profiles() -> List[ProfileResponse]:
    """Seed realistic freelancer profiles with vector embeddings, including agency specialist Pooja K."""
    sample_profiles = [
        ProfileCreate(
            name="Pooja K.",
            title="AI Automation Engineer | Business Process Automation | n8n & Make",
            hourly_rate=15.0,
            location="Sangli, India",
            agency="SiGa Systems",
            job_success_score="100% Job Success",
            total_earnings="$100+",
            total_jobs=1,
            total_hours="26,330 agency hours",
            availability="More than 30 hrs/week",
            response_time="0-4 hours",
            languages=["English: Native or Bilingual", "Marathi: Native or Bilingual", "Hindi: Fluent"],
            working_style=["Clear Communicator", "Detail Oriented"],
            badges=["Top Rated Plus", "ID Verified"],
            bio=(
                "I help businesses and agencies automate repetitive work, integrate AI into their operations, "
                "and build scalable automation systems that save hours every week. Whether it's AI agents, "
                "workflow automation, lead generation, document processing, CRM integrations, or custom API solutions, "
                "I build reliable systems that work 24/7—so your team can focus on growing the business instead of repetitive tasks. "
                "Specialized in: CrewAI, LangChain, n8n, Make.com, Python, FastAPI, and PostgreSQL."
            ),
            skills=[
                "n8n", "Make.com", "Python", "Artificial Intelligence", "LLM Prompt Engineering",
                "FastAPI", "CrewAI", "LangChain", "Zapier", "HighLevel", "API Integrations", "PostgreSQL"
            ],
            experience_summary="AI Automation Engineer at SiGa Systems building high-impact workflows with n8n, Make.com, and Python microservices.",
            certifications=[
                {"name": "n8n Beginner", "provider": "Udemy", "issued": "February 2026"}
            ],
            work_history=[
                {
                    "title": "Make.com Automation for Property Management",
                    "period": "May 30, 2026 - Present",
                    "amount": "$125.00",
                    "skills": ["Make.com", "Build Automation", "CRM Automation", "n8n"]
                }
            ],
            testimonials=[
                {
                    "client_name": "Sneha M.",
                    "date": "Apr 2026",
                    "quote": "Working with her has been a great experience. She helped me build automation workflows using n8n that significantly reduced my manual work and improved efficiency. Her understanding of AI integrations and workflow design is impressive."
                },
                {
                    "client_name": "Akanksha S.",
                    "date": "Apr 2026",
                    "quote": "Thank you for helping me, Pooja. I was stuck on an automation task related to one of my projects, and you helped correct the workflow and added email integration so that emails are sent automatically to clients."
                }
            ],
            portfolio_items=[
                {
                    "title": "Social Media Content Ingestion Automation",
                    "description": "Multi-platform automated ingestion, summarization, and scheduled syndication pipeline built with n8n and REST APIs.",
                    "tech_stack": ["n8n", "Make.com", "REST API", "OpenAI"]
                },
                {
                    "title": "Lead Generation & Bulk Email Automation System",
                    "description": "Automated B2B lead enrichment pipeline with personalized cold outreach triggers and CRM synchronization.",
                    "tech_stack": ["Python", "Make.com", "Zapier", "HighLevel"]
                },
                {
                    "title": "AI Knowledge Base Chatbot API",
                    "description": "FastAPI backend integrating LangChain and vector retrieval for instant internal document Q&A.",
                    "tech_stack": ["Python", "FastAPI", "LangChain"]
                }
            ],
            past_proposals=[
                "Hi! I saw your post for workflow automation and can build this cleanly with n8n or Make.com..."
            ]
        ),
        ProfileCreate(
            name="Alex Chen",
            title="Senior AI Agent & Full-Stack Python Engineer",
            hourly_rate=75.0,
            bio=(
                "Full-Stack Python & AI Specialist with 7+ years of experience building autonomous agents, "
                "RAG systems, FastAPI microservices, and vector search pipelines using Supabase (pgvector), "
                "Chroma, LangChain, and modern React."
            ),
            skills=["Python", "FastAPI", "Supabase", "pgvector", "LangChain", "React", "PostgreSQL", "Docker", "Tailwind CSS"],
            experience_summary="Built 15+ production AI workflows and autonomous agents for US-based startups.",
            portfolio_items=[
                {
                    "title": "Enterprise Knowledge RAG Engine",
                    "description": "Architected an end-to-end vector search application using Supabase pgvector and FastAPI, indexing 2M+ docs with sub-second retrieval.",
                    "tech_stack": ["FastAPI", "Supabase", "pgvector", "React"]
                },
                {
                    "title": "Autonomous Upwork & CRM Lead Qualifier",
                    "description": "Engineered automated scraper and LLM semantic matcher to score incoming leads against agency ICP, increasing response rate by 4x.",
                    "tech_stack": ["Python", "FastAPI", "React", "Tailwind CSS"]
                }
            ],
            past_proposals=[
                "I reviewed your job requirement for an AI & FastAPI developer—I have built this exact architecture twice before..."
            ]
        ),
        ProfileCreate(
            name="Elena Rostova",
            title="Full-Stack React & Next.js Frontend Architect",
            hourly_rate=65.0,
            bio=(
                "Frontend-heavy Full-Stack developer crafting sleek, ultra-responsive web applications "
                "with React, Next.js, Tailwind CSS, TypeScript, and Python/Node backend integrations. "
                "6+ years shipping high-converting client apps."
            ),
            skills=["React", "TypeScript", "Next.js", "Tailwind CSS", "REST APIs", "Zustand", "HTML5/CSS3", "UI/UX Design"],
            experience_summary="Specialized in building modern dashboards, SaaS web apps, and single-page applications.",
            portfolio_items=[
                {
                    "title": "SaaS Analytics & AI Command Center",
                    "description": "Designed and developed unified single-page React analytics workspace with real-time updates and customizable widgets.",
                    "tech_stack": ["React", "TypeScript", "Tailwind CSS", "Chart.js"]
                }
            ]
        ),
        ProfileCreate(
            name="Marcus Vance",
            title="Python Data Engineer & Web Scraping Specialist",
            hourly_rate=55.0,
            bio=(
                "Expert in Python data pipelines, automated web scraping (Playwright, Scrapy, Selenium), "
                "database optimization, and cloud deployments on AWS and Supabase."
            ),
            skills=["Python", "Playwright", "Scrapy", "PostgreSQL", "ETL Pipelines", "Docker", "FastAPI", "Pandas"],
            experience_summary="Scraped and processed over 50 million records from complex dynamic websites.",
            portfolio_items=[
                {
                    "title": "Real-time Job Board Ingestion Pipeline",
                    "description": "Automated pipeline aggregating 100k+ job listings daily into PostgreSQL with automated deduping and categorization.",
                    "tech_stack": ["Python", "Playwright", "PostgreSQL", "Docker"]
                }
            ]
        )
    ]

    for item in sample_profiles:
        text = embedding_service.build_profile_text(item)
        embedding = embedding_service.generate_embedding(text)
        supabase_service.create_profile(item, embedding)

    return supabase_service.list_profiles()

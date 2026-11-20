"""
Data models and schemas for Upwork AI Matcher & Proposal Studio.

Defines Pydantic schemas for data validation, serialization,
and OpenAPI schema generation across API endpoints.
Includes full parameters matching native Upwork freelancer profiles.
"""

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import uuid


class PortfolioItem(BaseModel):
    """Schema representing an individual portfolio project highlight."""
    title: str = Field(..., min_length=1, max_length=200, description="Title of the project")
    description: str = Field(..., min_length=1, description="Brief summary of challenges solved and results")
    tech_stack: List[str] = Field(default_factory=list, description="Technologies and libraries used")
    link: Optional[str] = Field(default=None, description="Optional live demo or repository URL")


class ProfileBase(BaseModel):
    """Base schema containing shared attributes for freelancer profiles."""
    name: str = Field(..., min_length=1, max_length=120, description="Full name of the freelancer")
    title: str = Field(..., min_length=1, max_length=200, description="Upwork professional headline")
    hourly_rate: float = Field(default=0.0, ge=0.0, description="Hourly rate in USD")
    bio: str = Field(..., min_length=10, description="Full professional overview/bio")
    skills: List[str] = Field(default_factory=list, description="List of technical and domain skills")
    
    # ── Real Upwork Profile Parameters ───────────────────────────────────────
    location: Optional[str] = Field(default="", description="City, Country (e.g. Sangli, India)")
    agency: Optional[str] = Field(default="", description="Associated Agency (e.g. SiGa Systems)")
    job_success_score: Optional[str] = Field(default="", description="Job Success Score (e.g. 100% Job Success)")
    total_earnings: Optional[str] = Field(default="", description="Total Upwork earnings (e.g. $100+)")
    total_jobs: Optional[int] = Field(default=0, description="Total completed Upwork jobs")
    total_hours: Optional[str] = Field(default="", description="Total hours worked on Upwork")
    availability: Optional[str] = Field(default="", description="Availability (e.g. More than 30 hrs/week)")
    response_time: Optional[str] = Field(default="", description="Average response time (e.g. 0-4 hours)")
    languages: List[str] = Field(default_factory=list, description="Languages spoken and proficiency")
    working_style: List[str] = Field(default_factory=list, description="Working style tags (e.g. Clear Communicator)")
    badges: List[str] = Field(default_factory=list, description="Profile badges (e.g. Top Rated Plus, ID Verified)")
    education: List[Dict[str, Any]] = Field(default_factory=list, description="Education history")
    certifications: List[Dict[str, Any]] = Field(default_factory=list, description="Verified certifications")
    work_history: List[Dict[str, Any]] = Field(default_factory=list, description="Upwork project work history")
    testimonials: List[Dict[str, Any]] = Field(default_factory=list, description="Client endorsements and testimonials")
    portfolio_items: List[Dict[str, Any]] = Field(default_factory=list, description="Portfolio projects")
    past_proposals: List[str] = Field(default_factory=list, description="Past winning proposals for style adaptation")
    experience_summary: Optional[str] = Field(default="", description="Summary of past experience and domain depth")

    @field_validator("skills", mode="before")
    @classmethod
    def clean_skills(cls, v: Any) -> List[str]:
        """Ensures skills are trimmed and non-empty strings."""
        if isinstance(v, list):
            return [str(s).strip() for s in v if str(s).strip()]
        return []


class ProfileCreate(ProfileBase):
    """Schema for registering a new freelancer profile."""
    pass


class ProfileUpdate(BaseModel):
    """Schema for updating an existing profile. All fields are optional."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    hourly_rate: Optional[float] = Field(default=None, ge=0.0)
    bio: Optional[str] = Field(default=None, min_length=10)
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    agency: Optional[str] = None
    job_success_score: Optional[str] = None
    total_earnings: Optional[str] = None
    total_jobs: Optional[int] = None
    total_hours: Optional[str] = None
    availability: Optional[str] = None
    response_time: Optional[str] = None
    languages: Optional[List[str]] = None
    working_style: Optional[List[str]] = None
    badges: Optional[List[str]] = None
    education: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    work_history: Optional[List[Dict[str, Any]]] = None
    testimonials: Optional[List[Dict[str, Any]]] = None
    portfolio_items: Optional[List[Dict[str, Any]]] = None
    past_proposals: Optional[List[str]] = None
    experience_summary: Optional[str] = None


class ProfileResponse(ProfileBase):
    """Schema for returning profile details including persistent database metadata."""
    id: str = Field(..., description="Unique profile UUID")
    created_at: Optional[datetime] = Field(default=None, description="Timestamp of profile creation")
    updated_at: Optional[datetime] = Field(default=None, description="Timestamp of latest modification")


# ── Aliases for backward compatibility with matcher.py ───────────────────────
class ProfileMatchResult(BaseModel):
    """Ranked candidate with similarity score and match explanation."""
    profile: "ProfileResponse"
    similarity_percentage: float = Field(..., description="Cosine similarity as percentage")
    matched_skills: List[str] = Field(default_factory=list)
    match_reasons: List[str] = Field(default_factory=list)


class MatchResponse(BaseModel):
    """Response containing all ranked matches for a job query."""
    total_profiles: int
    matches: List[ProfileMatchResult]


# JobRequirementInput is the old name used in matcher.py; maps to JobMatchRequest fields
class JobRequirementInput(BaseModel):
    """Request payload for semantic matching (legacy alias)."""
    job_title: str = Field(..., min_length=3, max_length=200)
    job_description: str = Field(..., min_length=10)
    required_skills: List[str] = Field(default_factory=list)
    budget_or_rate: Optional[str] = Field(default=None)
    match_count: int = Field(default=5, ge=1, le=20)


class RawUpworkProfileRequest(BaseModel):
    """Schema for parsing raw unformatted text copied from an Upwork profile."""
    raw_text: str = Field(..., min_length=20, description="Raw text copied directly from an Upwork profile page")


class JobMatchRequest(BaseModel):
    """Request payload for matching an Upwork job against stored freelancer profiles."""
    job_title: str = Field(..., min_length=3, max_length=200, description="Upwork job posting title")
    job_description: str = Field(..., min_length=10, description="Full description and client requirements")
    required_skills: List[str] = Field(default_factory=list, description="Explicit skills mentioned in job post")
    budget_or_rate: Optional[str] = Field(default=None, description="Stated budget or hourly range")
    screening_questions: List[str] = Field(default_factory=list, description="Client screening questions")
    match_count: int = Field(default=5, ge=1, le=20, description="Maximum number of candidates to return")


class CandidateMatch(BaseModel):
    """Schema representing a single ranked candidate with similarity score and rationale."""
    profile: ProfileResponse
    similarity_score: float = Field(..., description="Cosine similarity score between 0.0 and 1.0")
    similarity_percentage: int = Field(..., description="Cosine similarity percentage (0 - 100)")
    matched_skills: List[str] = Field(default_factory=list, description="Directly intersecting skills")
    match_reasons: List[str] = Field(default_factory=list, description="Explanation for candidate suitability")


class JobMatchResponse(BaseModel):
    """Response payload containing ranked candidates for a given job requirement."""
    job_title: str
    total_candidates_searched: int
    matches: List[CandidateMatch]


class ProposalGenerateRequest(BaseModel):
    """Payload for generating an Upwork proposal for a specific candidate and job."""
    profile_id: str = Field(..., description="UUID of the selected candidate profile")
    job_title: str = Field(..., min_length=3, max_length=200, description="Job title")
    job_description: str = Field(..., min_length=10, description="Full job requirements")
    screening_questions: List[str] = Field(default_factory=list, description="Questions asked by client")
    tone: Optional[str] = Field(default="confident", description="Tone: confident, consultative, concise, technical, casual")


class ScreeningAnswer(BaseModel):
    """Schema representing a structured answer to a client screening question."""
    question: str
    answer: str


class ProposalGenerateResponse(BaseModel):
    """Response containing the synthesized proposal and metadata."""
    proposal: str = Field(..., description="Complete tailored cover letter text")
    hook: str = Field(..., description="Opening 1-2 lines optimized for Upwork inbox preview")
    solution_summary: Optional[str] = Field(default=None, description="Brief summary of proposed solution")
    call_to_action: Optional[str] = Field(default=None, description="Closing call to action")
    screening_answers: List[ScreeningAnswer] = Field(default_factory=list, description="Answers to client questions")
    model_used: Optional[str] = Field(default=None, description="Identifier of the copywriting model used")


class SystemHealthResponse(BaseModel):
    """Response schema for the /api/health endpoint."""
    status: str = Field(..., description="Overall system status")
    supabase_connected: bool = Field(..., description="Whether Supabase is reachable")
    supabase_url_configured: bool = Field(..., description="Whether SUPABASE_URL is set in environment")
    hf_token_configured: bool = Field(..., description="Whether HF_TOKEN is set in environment")
    embedding_model: str = Field(..., description="Active embedding model name")
    generation_model: str = Field(..., description="Active LLM generation model name")
    total_profiles_loaded: int = Field(..., description="Number of profiles currently in storage")
    timestamp: str = Field(..., description="UTC timestamp of this health check")

"""
Main FastAPI Application Entrypoint.

Initializes middleware, global exception handlers, and mounts API routers
for Profiles, Semantic Matching, and Proposal Generation.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging

from app.config import settings
from app.database import is_supabase_configured, get_supabase
from app.services import supabase_service
from app.routers import profiles, matcher, proposal
from app.models import SystemHealthResponse

# Configure root logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("upwork_writer")

app = FastAPI(
    title="Upwork AI Matcher & Proposal Studio API",
    description=(
        "Full-Stack Python & React engine for storing freelancer profiles, "
        "vectorizing credentials with Hugging Face models into Supabase pgvector, "
        "and generating high-converting Upwork proposals."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend clients (React / Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catches unhandled exceptions and returns a structured JSON payload."""
    logger.exception(f"Unhandled error processing {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "Internal server error occurred.",
            "detail": str(exc),
            "timestamp": datetime.utcnow().isoformat(),
            "path": request.url.path
        }
    )


# Register modular routers
app.include_router(profiles.router)
app.include_router(matcher.router)
app.include_router(proposal.router)


@app.get(
    "/api/health",
    response_model=SystemHealthResponse,
    tags=["System"],
    summary="Health check & connectivity status"
)
def health_check() -> SystemHealthResponse:
    """Returns runtime connectivity status for Supabase and Hugging Face."""
    supabase_ok = is_supabase_configured() and (get_supabase() is not None)
    profile_count = len(supabase_service.list_profiles())
    return SystemHealthResponse(
        status="healthy",
        supabase_connected=supabase_ok,
        supabase_url_configured=bool(settings.SUPABASE_URL),
        hf_token_configured=bool(settings.HF_TOKEN),
        embedding_model=settings.EMBEDDING_MODEL_NAME,
        generation_model=settings.HF_GENERATION_MODEL,
        total_profiles_loaded=profile_count,
        timestamp=datetime.utcnow().isoformat()
    )


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}")
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

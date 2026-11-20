from typing import Optional
from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger(__name__)

supabase_client: Optional[Client] = None

def get_supabase() -> Optional[Client]:
    global supabase_client
    if supabase_client is not None:
        return supabase_client
    
    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        try:
            supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info("Supabase client initialized successfully.")
            return supabase_client
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            return None
    else:
        logger.warning("SUPABASE_URL and SUPABASE_KEY not configured in .env.")
        return None

def is_supabase_configured() -> bool:
    return bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)


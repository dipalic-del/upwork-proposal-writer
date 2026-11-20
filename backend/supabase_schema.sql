-- =========================================================================
-- Supabase Schema: Upwork AI Matcher & Proposal Studio
-- Run this ENTIRE script in: Supabase Dashboard > SQL Editor > New Query
-- =========================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Drop old table if re-running (safe to remove this line after first run)
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Create profiles table with full Upwork profile parameters
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core profile fields
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    hourly_rate NUMERIC DEFAULT 0,
    bio TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    experience_summary TEXT DEFAULT '',
    portfolio_items JSONB DEFAULT '[]'::jsonb,
    past_proposals JSONB DEFAULT '[]'::jsonb,

    -- Upwork-native profile parameters
    location TEXT DEFAULT '',
    agency TEXT DEFAULT '',
    job_success_score TEXT DEFAULT '',
    total_earnings TEXT DEFAULT '',
    total_jobs INTEGER DEFAULT 0,
    total_hours TEXT DEFAULT '',
    availability TEXT DEFAULT '',
    response_time TEXT DEFAULT '',
    languages TEXT[] DEFAULT '{}',
    working_style TEXT[] DEFAULT '{}',
    badges TEXT[] DEFAULT '{}',
    education JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    work_history JSONB DEFAULT '[]'::jsonb,
    testimonials JSONB DEFAULT '[]'::jsonb,

    -- Vector embedding (384 dimensions for all-MiniLM-L6-v2)
    embedding VECTOR(384),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Grant full access to service_role (used by your backend SUPABASE_KEY)
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 5. Disable Row Level Security (simplest fix for service_role 403 errors)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 6. Create IVFFlat index for fast cosine similarity search
DROP INDEX IF EXISTS profiles_embedding_idx;
CREATE INDEX profiles_embedding_idx
ON profiles
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 7. Stored procedure for server-side vector similarity search
CREATE OR REPLACE FUNCTION match_profiles (
  query_embedding VECTOR(384),
  match_threshold FLOAT DEFAULT 0.0,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  title TEXT,
  hourly_rate NUMERIC,
  bio TEXT,
  skills TEXT[],
  experience_summary TEXT,
  portfolio_items JSONB,
  past_proposals JSONB,
  location TEXT,
  agency TEXT,
  job_success_score TEXT,
  total_earnings TEXT,
  total_jobs INTEGER,
  total_hours TEXT,
  availability TEXT,
  response_time TEXT,
  languages TEXT[],
  working_style TEXT[],
  badges TEXT[],
  education JSONB,
  certifications JSONB,
  work_history JSONB,
  testimonials JSONB,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    p.id, p.name, p.title, p.hourly_rate, p.bio, p.skills,
    p.experience_summary, p.portfolio_items, p.past_proposals,
    p.location, p.agency, p.job_success_score, p.total_earnings,
    p.total_jobs, p.total_hours, p.availability, p.response_time,
    p.languages, p.working_style, p.badges,
    p.education, p.certifications, p.work_history, p.testimonials,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM profiles p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) >= match_threshold
  ORDER BY p.embedding <=> query_embedding ASC
  LIMIT match_count;
$$;

-- Grant execute on the function too
GRANT EXECUTE ON FUNCTION match_profiles TO service_role;
GRANT EXECUTE ON FUNCTION match_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION match_profiles TO anon;

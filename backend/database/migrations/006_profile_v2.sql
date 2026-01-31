-- ============================================================================
-- PROFILE V2 SCHEMA - CLEAN SLATE
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Drop existing profiles table (dev/test data only)
DROP TABLE IF EXISTS profiles CASCADE;

-- Step 2: Create new profiles table
CREATE TABLE profiles (
    -- ========== IDENTITY (Required) ==========
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ========== BASIC INFO (Optional) ==========
    last_name TEXT,
    email TEXT,
    phone TEXT,
    grade INTEGER CHECK (grade >= 9 AND grade <= 12),
    graduation_year INTEGER CHECK (graduation_year >= 2024 AND graduation_year <= 2032),
    school_name TEXT,
    school_type TEXT CHECK (school_type IN ('public', 'private', 'charter', 'homeschool', 'international')),
    location_state TEXT,
    location_country TEXT DEFAULT 'USA',

    -- ========== ACADEMIC (Flat, Indexed) ==========
    gpa DECIMAL(3,2) CHECK (gpa >= 0 AND gpa <= 4.0),
    gpa_scale DECIMAL(3,1) DEFAULT 4.0,
    gpa_weighted DECIMAL(3,2),
    sat_score INTEGER CHECK (sat_score >= 400 AND sat_score <= 1600),
    act_score INTEGER CHECK (act_score >= 1 AND act_score <= 36),
    class_rank INTEGER,
    class_size INTEGER,

    -- ========== TARGETS (JSONB) ==========
    -- Structure: {dream: string[], reach: string[], target: string[], safety: string[]}
    target_schools JSONB DEFAULT '{"dream": [], "reach": [], "target": [], "safety": []}'::jsonb,
    target_majors TEXT[] DEFAULT '{}',

    -- ========== IDENTITY SYNTHESIS (JSONB) - Core for Narrative ==========
    -- Structure: {archetype: {id, name, confidence}, spike: string, pillars: {...}, brand_statement: string}
    identity_synthesis JSONB DEFAULT '{}'::jsonb,

    -- ========== PORTFOLIO (JSONB Arrays) ==========
    -- These start empty for underclassmen - that's normal!
    activities JSONB DEFAULT '[]'::jsonb,
    awards JSONB DEFAULT '[]'::jsonb,
    programs JSONB DEFAULT '[]'::jsonb,
    courses JSONB DEFAULT '[]'::jsonb,

    -- ========== ASSESSMENT PRIMITIVES (JSONB) ==========
    -- Raw inputs from assessment frames - used by agents
    interests JSONB DEFAULT '[]'::jsonb,
    values JSONB DEFAULT '[]'::jsonb,
    goals JSONB DEFAULT '{}'::jsonb,
    strengths JSONB DEFAULT '[]'::jsonb,
    challenges JSONB DEFAULT '[]'::jsonb,

    -- ========== FOUR PILLARS (JSONB) ==========
    -- Structure: {identity: {...}, aptitude: {...}, passion: {...}, service: {...}}
    four_pillars JSONB DEFAULT '{}'::jsonb,

    -- ========== AGENT WORKSPACES (JSONB) ==========
    -- Each agent writes to its own namespace to prevent conflicts
    -- Structure: {ec: {...}, awards: {...}, programs: {...}, assessment: {...}, gameplan: {...}}
    agent_outputs JSONB DEFAULT '{}'::jsonb,

    -- ========== COMPUTED SCORES (Flat, Indexed) ==========
    ivy_score DECIMAL(5,2) CHECK (ivy_score >= 0 AND ivy_score <= 100),
    narrative_score DECIMAL(5,2) CHECK (narrative_score >= 0 AND narrative_score <= 100),
    portfolio_score DECIMAL(5,2) CHECK (portfolio_score >= 0 AND portfolio_score <= 100),
    readiness_level TEXT CHECK (readiness_level IN ('emerging', 'developing', 'competitive', 'exceptional')),

    -- ========== METADATA ==========
    updated_at TIMESTAMPTZ DEFAULT now(),
    assessment_completed_at TIMESTAMPTZ,
    onboarding_step INTEGER DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT false,

    -- ========== CONSTRAINTS ==========
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Step 3: Create indexes for common queries
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_grade ON profiles(grade);
CREATE INDEX idx_profiles_graduation_year ON profiles(graduation_year);
CREATE INDEX idx_profiles_ivy_score ON profiles(ivy_score);
CREATE INDEX idx_profiles_gpa ON profiles(gpa);
CREATE INDEX idx_profiles_sat_score ON profiles(sat_score);

-- GIN indexes for JSONB array searches
CREATE INDEX idx_profiles_target_schools ON profiles USING GIN (target_schools);
CREATE INDEX idx_profiles_interests ON profiles USING GIN (interests);
CREATE INDEX idx_profiles_identity_synthesis ON profiles USING GIN (identity_synthesis);

-- Step 4: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role can do anything (for backend agents)
CREATE POLICY "Service role full access"
    ON profiles FOR ALL
    USING (auth.role() = 'service_role');

-- Step 6: Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Helper function to upsert profile
CREATE OR REPLACE FUNCTION upsert_profile(
    p_user_id UUID,
    p_data JSONB
)
RETURNS profiles AS $$
DECLARE
    result profiles;
BEGIN
    INSERT INTO profiles (user_id, first_name)
    VALUES (p_user_id, COALESCE(p_data->>'first_name', 'Student'))
    ON CONFLICT (user_id)
    DO UPDATE SET
        first_name = COALESCE(p_data->>'first_name', profiles.first_name),
        last_name = COALESCE(p_data->>'last_name', profiles.last_name),
        grade = COALESCE((p_data->>'grade')::INTEGER, profiles.grade),
        graduation_year = COALESCE((p_data->>'graduation_year')::INTEGER, profiles.graduation_year),
        gpa = COALESCE((p_data->>'gpa')::DECIMAL, profiles.gpa),
        sat_score = COALESCE((p_data->>'sat_score')::INTEGER, profiles.sat_score),
        act_score = COALESCE((p_data->>'act_score')::INTEGER, profiles.act_score),
        target_schools = COALESCE(p_data->'target_schools', profiles.target_schools),
        target_majors = COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(p_data->'target_majors')),
            profiles.target_majors
        ),
        identity_synthesis = COALESCE(p_data->'identity_synthesis', profiles.identity_synthesis),
        activities = COALESCE(p_data->'activities', profiles.activities),
        awards = COALESCE(p_data->'awards', profiles.awards),
        programs = COALESCE(p_data->'programs', profiles.programs),
        interests = COALESCE(p_data->'interests', profiles.interests),
        values = COALESCE(p_data->'values', profiles.values),
        goals = COALESCE(p_data->'goals', profiles.goals),
        four_pillars = COALESCE(p_data->'four_pillars', profiles.four_pillars),
        updated_at = now()
    RETURNING * INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CONSTRAINT RELAXATION MIGRATION
--
-- Purpose: Make the database more flexible to handle edge cases
-- Philosophy: Validate in application, store permissively
--
-- Run this in Supabase SQL Editor after 006_profile_v2.sql
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP OVERLY RESTRICTIVE CONSTRAINTS
-- ============================================================================

-- Grade: Allow 6-13 (middle school through gap year)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_grade_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_grade_check CHECK (grade IS NULL OR (grade >= 6 AND grade <= 13));

-- Graduation Year: Allow wider range and make dynamic-friendly
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_graduation_year_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_graduation_year_check CHECK (graduation_year IS NULL OR (graduation_year >= 2015 AND graduation_year <= 2040));

-- GPA: Allow weighted GPAs up to 5.5
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_gpa_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_gpa_check CHECK (gpa IS NULL OR (gpa >= 0 AND gpa <= 5.5));

-- School Type: Add 'other' option for edge cases
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_school_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_school_type_check
  CHECK (school_type IS NULL OR school_type IN ('public', 'private', 'charter', 'homeschool', 'international', 'other'));

-- ============================================================================
-- STEP 2: ADD NEW COLUMNS FOR RICHER DATA (Non-breaking additions)
-- ============================================================================

-- Add gpa_weighted column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'gpa_weighted') THEN
        ALTER TABLE profiles ADD COLUMN gpa_weighted DECIMAL(3,2)
          CHECK (gpa_weighted IS NULL OR (gpa_weighted >= 0 AND gpa_weighted <= 5.5));
    END IF;
END $$;

-- Add data_confidence column to track profile quality
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'data_confidence') THEN
        ALTER TABLE profiles ADD COLUMN data_confidence DECIMAL(3,2) DEFAULT 1.0
          CHECK (data_confidence IS NULL OR (data_confidence >= 0 AND data_confidence <= 1.0));
    END IF;
END $$;

-- Add validation_adjustments to track what was auto-corrected
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'validation_adjustments') THEN
        ALTER TABLE profiles ADD COLUMN validation_adjustments JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- ============================================================================
-- STEP 3: UPDATE RLS POLICIES (Ensure service role can always write)
-- ============================================================================

-- Drop and recreate service role policy to ensure it's comprehensive
DROP POLICY IF EXISTS "Service role full access" ON profiles;

CREATE POLICY "Service role full access"
    ON profiles FOR ALL
    USING (
        auth.role() = 'service_role' OR
        auth.jwt()->>'role' = 'service_role'
    );

-- ============================================================================
-- STEP 4: HELPER FUNCTIONS FOR VALIDATION
-- ============================================================================

-- Function to safely coerce GPA to valid range
CREATE OR REPLACE FUNCTION safe_gpa(value DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    IF value IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN LEAST(GREATEST(value, 0), 5.5);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to normalize school type
CREATE OR REPLACE FUNCTION normalize_school_type(value TEXT)
RETURNS TEXT AS $$
DECLARE
    normalized TEXT;
BEGIN
    IF value IS NULL THEN
        RETURN NULL;
    END IF;

    normalized := LOWER(TRIM(value));

    -- Map common variations
    CASE normalized
        WHEN 'public school', 'state', 'magnet' THEN RETURN 'public';
        WHEN 'private school', 'independent', 'boarding', 'parochial', 'catholic', 'religious' THEN RETURN 'private';
        WHEN 'charter school' THEN RETURN 'charter';
        WHEN 'home school', 'homeschooled', 'home schooled' THEN RETURN 'homeschool';
        WHEN 'intl', 'ib' THEN RETURN 'international';
        WHEN 'online', 'virtual' THEN RETURN 'other';
        ELSE
            -- Check if it's already a valid type
            IF normalized IN ('public', 'private', 'charter', 'homeschool', 'international', 'other') THEN
                RETURN normalized;
            ELSE
                RETURN 'other';
            END IF;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- STEP 5: CREATE TRIGGER FOR AUTO-NORMALIZATION (Optional Safety Net)
-- ============================================================================

CREATE OR REPLACE FUNCTION normalize_profile_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalize school_type
    IF NEW.school_type IS NOT NULL THEN
        NEW.school_type := normalize_school_type(NEW.school_type);
    END IF;

    -- Ensure first_name is never empty
    IF NEW.first_name IS NULL OR TRIM(NEW.first_name) = '' THEN
        NEW.first_name := 'Student';
    END IF;

    -- Cap GPA if somehow exceeds limit
    IF NEW.gpa IS NOT NULL AND NEW.gpa > 5.5 THEN
        NEW.gpa := 5.5;
    END IF;

    IF NEW.gpa_weighted IS NOT NULL AND NEW.gpa_weighted > 5.5 THEN
        NEW.gpa_weighted := 5.5;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger
DROP TRIGGER IF EXISTS normalize_profile_before_save ON profiles;

CREATE TRIGGER normalize_profile_before_save
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION normalize_profile_data();

-- ============================================================================
-- STEP 6: INDEX FOR NEW COLUMNS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_data_confidence ON profiles(data_confidence);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify constraints are correctly set
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.check_constraints
    WHERE constraint_name LIKE 'profiles_%';

    RAISE NOTICE 'Profile table has % check constraints', constraint_count;
END $$;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- After running this migration:
-- 1. GPA can be 0-5.5 (supports weighted GPAs)
-- 2. Grade can be 6-13 (middle school through gap year)
-- 3. Graduation year range is 2015-2040
-- 4. School type includes 'other' for edge cases
-- 5. Database trigger auto-normalizes common issues
-- 6. Application-side validation is still the primary safeguard
--
-- The philosophy is: validate strictly in the application,
-- store permissively in the database. This prevents data loss
-- while still maintaining data quality through the Universal Validator.
-- ============================================================================

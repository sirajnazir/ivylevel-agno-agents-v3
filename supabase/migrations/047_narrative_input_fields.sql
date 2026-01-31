-- Narrative Input Fields Migration
-- Date: 2026-01-31
-- Purpose: Document new fields for narrative synthesis input (click-based cards)
--
-- These fields are stored within the profile JSONB column:
-- - profile.passion.interest_areas: string[] (2-4 interests like 'AI_ML', 'BIOTECH')
-- - profile.community.causes: string[] (1-3 causes like 'MENTAL_HEALTH', 'EDUCATION_ACCESS')
-- - profile.operating.core_values: string[] (3-5 values like 'CURIOSITY', 'IMPACT')
--
-- No schema changes needed - these are nested within existing JSONB structures.
-- This migration serves as documentation and ensures the migration history is tracked.

-- Add a comment to document the new structure
COMMENT ON TABLE profiles IS 'Student profiles with assessment data. JSONB profile column includes:
  - passion.interest_areas: string[] for narrative synthesis (2-4 interests)
  - community.causes: string[] for service narrative (1-3 causes)
  - operating.core_values: string[] for identity narrative (3-5 values)
  Added in v1.0.6 for click-based narrative input cards.';

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 047: Added narrative input fields (interest_areas, causes, core_values) to JSONB profile structure';
END $$;

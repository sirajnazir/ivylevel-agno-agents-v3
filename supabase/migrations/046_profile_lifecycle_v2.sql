-- Profile Lifecycle v2.0 Migration
-- IMPLEMENTS: SPEC_PROFILE_LIFECYCLE_V2.md
-- Adds columns for robust assessment progress tracking and resume capability

-- 1. Add profile_status column for explicit state tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_status TEXT
  DEFAULT 'none'
  CHECK (profile_status IN ('none', 'onboarding', 'in_progress', 'completed', 'error'));

-- 2. Add assessment_progress JSONB for frame-level tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS assessment_progress JSONB
  DEFAULT '{"current_frame": 1, "current_card": 0, "frame_progress": {}, "last_saved_at": null}'::jsonb;

-- 3. Add last_activity_at for session tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ
  DEFAULT NOW();

-- 4. Backfill existing profiles based on completion status
UPDATE profiles
SET profile_status = CASE
  WHEN assessment_completed_at IS NOT NULL THEN 'completed'
  WHEN onboarding_completed = true THEN 'completed'
  ELSE 'onboarding'
END
WHERE profile_status IS NULL OR profile_status = 'none';

-- 5. Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(profile_status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON profiles(last_activity_at);

-- 6. Add comment for documentation
COMMENT ON COLUMN profiles.profile_status IS 'Profile lifecycle state: none, onboarding, in_progress, completed, error';
COMMENT ON COLUMN profiles.assessment_progress IS 'Assessment progress tracking: current_frame, current_card, frame_progress, last_saved_at';
COMMENT ON COLUMN profiles.last_activity_at IS 'Last user activity timestamp for session tracking';

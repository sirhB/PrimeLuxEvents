-- Update user_profiles to track individual tour steps
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS completed_tour_steps INTEGER[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS readiness_completed BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN user_profiles.completed_tour_steps IS 'Array of indices representing completed tour steps';

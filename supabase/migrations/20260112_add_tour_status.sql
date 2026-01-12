-- Add has_completed_tour column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS has_completed_tour BOOLEAN DEFAULT false;

-- Update existing user profiles (optional, as default is false)
UPDATE user_profiles SET has_completed_tour = false WHERE has_completed_tour IS NULL;

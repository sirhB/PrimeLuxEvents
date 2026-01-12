-- Migration to add specific launch readiness items to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS readiness_items JSONB DEFAULT '{
  "settings_reviewed": false,
  "stripe_verified": false,
  "products_verified": false,
  "team_invited": false
}';

-- Update existing records if they don't have the key
UPDATE user_profiles 
SET readiness_items = '{
  "settings_reviewed": false,
  "stripe_verified": false,
  "products_verified": false,
  "team_invited": false
}'
WHERE readiness_items IS NULL;

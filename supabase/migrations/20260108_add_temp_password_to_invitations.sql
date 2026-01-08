-- Migration: Add temp_password to user_invitations
ALTER TABLE user_invitations ADD COLUMN IF NOT EXISTS temp_password text;

COMMENT ON COLUMN user_invitations.temp_password IS 'Temporary password set by admin, potentially used to verify identity during invitation acceptance';

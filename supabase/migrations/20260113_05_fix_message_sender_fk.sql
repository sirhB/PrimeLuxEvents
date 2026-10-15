-- Migration: Fix Message Sender Relationship
-- This ensures that the messages table can easily join with user_profiles.

-- 1. Add explicit foreign key from messages to user_profiles
-- Even though sender_id already points to auth.users, adding this helps PostgREST joins.
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_profile_fkey;

ALTER TABLE messages
ADD CONSTRAINT messages_sender_id_profile_fkey 
FOREIGN KEY (sender_id) 
REFERENCES user_profiles(id) 
ON DELETE SET NULL;

-- 2. Force Schema Cache Reload
NOTIFY pgrst, 'reload config';

-- Migration to support AI messages in conversations
-- Created: 2026-01-12

-- 1. Add is_ai column to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_ai BOOLEAN DEFAULT FALSE;

-- 2. Make sender_id nullable (for system/AI messages)
ALTER TABLE messages ALTER COLUMN sender_id DROP NOT NULL;

-- 3. Update RLS policies for messages
-- We need to allow users to "trigger" an AI message insertion from the client.
-- In a real app, this would be a server-side process, but for this integration,
-- we'll allow users to insert messages flagged as is_ai in conversations they participate in.

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
CREATE POLICY "Users can insert messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    is_conversation_participant(conversation_id, auth.uid())
    AND (
      -- Normal message: sender must be the user
      (is_ai = FALSE AND sender_id = auth.uid())
      OR 
      -- AI message: sender can be null (system)
      (is_ai = TRUE AND (sender_id IS NULL OR sender_id = '00000000-0000-0000-0000-000000000000'::uuid))
    )
  );

-- Clear schema cache
NOTIFY pgrst, 'reload config';

-- Fix missing INSERT policies for chat system

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can add themselves as participants" ON conversation_participants;
DROP POLICY IF EXISTS "Admins can add any participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;

-- Allow authenticated users to create conversations
CREATE POLICY "Authenticated users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to add themselves as participants
-- Note: We removed the admin policy to avoid infinite recursion with user_roles table
-- Admins can still participate by adding themselves like regular users
CREATE POLICY "Users can add themselves as participants"
  ON conversation_participants
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own last_read_at timestamp
CREATE POLICY "Users can update their own participant record"
  ON conversation_participants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

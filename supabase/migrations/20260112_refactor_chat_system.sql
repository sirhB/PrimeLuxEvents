-- Refactor Chat System and Fix RLS

-- 1. Reset RLS Policies to ensure clean state
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add themselves as participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

-- 2. Simplified RLS Policies

-- Conversations
-- Read: Users can see conversations they created OR are participants in
CREATE POLICY "access_own_conversations"
ON conversations FOR SELECT
USING (
  created_by = auth.uid() OR
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Insert: Authenticated users can create conversations
CREATE POLICY "create_conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Participants
-- Read: Users can see participants for conversations they have access to
-- (We use a security definer function to avoid infinite recursion in RLS if we were to query conversations)
CREATE OR REPLACE FUNCTION is_participant_of_conversation(conv_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conv_id AND user_id = auth.uid()
  );
$$;

CREATE POLICY "view_participants"
ON conversation_participants FOR SELECT
USING (
  -- You can view participants if you are a participant of that conversation
  is_participant_of_conversation(conversation_id)
);

-- Insert: Users can add themselves, OR conversation creators can add others
CREATE POLICY "insert_participants"
ON conversation_participants FOR INSERT
WITH CHECK (
  -- User adding themselves
  user_id = auth.uid() OR
  -- Creator adding others (requires checking conversations table)
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id AND created_by = auth.uid()
  )
);

-- Update: Users can update their own record (read status)
CREATE POLICY "update_own_participant"
ON conversation_participants FOR UPDATE
USING (user_id = auth.uid());

-- Messages
-- Read: Visible if participant
CREATE POLICY "view_messages"
ON messages FOR SELECT
USING (
  is_participant_of_conversation(conversation_id)
);

-- Insert: Can insert if participant
CREATE POLICY "insert_messages"
ON messages FOR INSERT
WITH CHECK (
  is_participant_of_conversation(conversation_id) AND
  sender_id = auth.uid()
);


-- 3. RPC Function for Atomic Conversation Creation
CREATE OR REPLACE FUNCTION create_new_conversation(
  p_type text,
  p_subject text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_participant_ids uuid[] DEFAULT ARRAY[]::uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Run as superuser to bypass RLS during creation steps
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_participant_id uuid;
BEGIN
  -- 1. Create Conversation
  INSERT INTO conversations (type, subject, created_by)
  VALUES (p_type, p_subject, auth.uid())
  RETURNING id INTO v_conversation_id;

  -- 2. Add Creator as Participant
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (v_conversation_id, auth.uid());

  -- 3. Add Other Participants
  IF p_participant_ids IS NOT NULL THEN
    FOREACH v_participant_id IN ARRAY p_participant_ids
    LOOP
      -- Avoid duplicates if creator passed their own ID
      IF v_participant_id != auth.uid() THEN
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (v_conversation_id, v_participant_id);
      END IF;
    END LOOP;
  END IF;

  -- 4. Add Initial Message if provided
  IF p_message IS NOT NULL AND length(p_message) > 0 THEN
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (v_conversation_id, auth.uid(), p_message);
  END IF;

  RETURN v_conversation_id;
END;
$$;

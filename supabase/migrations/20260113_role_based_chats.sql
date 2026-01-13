-- Migration: Implement Role-Based Group Chats
-- Everyone within a role should be able to see and respond to conversations targeted at that role.

-- 1. Add target_role_id to conversations table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS target_role_id uuid REFERENCES roles(id);

-- 2. Update is_participant_of_conversation to include role-based access
CREATE OR REPLACE FUNCTION is_participant_of_conversation(conv_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conv_id 
    AND (
      c.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM conversation_participants cp 
        WHERE cp.conversation_id = conv_id AND cp.user_id = auth.uid()
      ) OR
      (
        c.target_role_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM user_roles ur
          WHERE ur.user_id = auth.uid() AND ur.role_id = c.target_role_id
        )
      )
    )
  );
END;
$$;

-- 3. Update create_new_conversation to support target_role_id
CREATE OR REPLACE FUNCTION create_new_conversation(
  p_type text,
  p_subject text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_participant_ids uuid[] DEFAULT ARRAY[]::uuid[],
  p_target_role_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_participant_id uuid;
BEGIN
  -- 1. Create Conversation
  INSERT INTO conversations (type, subject, created_by, target_role_id)
  VALUES (p_type, p_subject, auth.uid(), p_target_role_id)
  RETURNING id INTO v_conversation_id;

  -- 2. Add Creator as Participant
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (v_conversation_id, auth.uid());

  -- 3. Add Other Participants
  IF p_participant_ids IS NOT NULL THEN
    FOREACH v_participant_id IN ARRAY p_participant_ids
    LOOP
      IF v_participant_id != auth.uid() THEN
        -- Check if already added (might have been added by creator or role)
        -- Though participant records are mainly for activity/archive tracking
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (v_conversation_id, v_participant_id)
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
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

-- 4. Update toggle_conversation_archive to handle new participants
CREATE OR REPLACE FUNCTION toggle_conversation_archive(p_conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status boolean;
  v_new_status boolean;
BEGIN
  -- Get current status for the user
  SELECT is_archived INTO v_current_status
  FROM conversation_participants
  WHERE conversation_id = p_conversation_id AND user_id = auth.uid();
  
  -- If no participant record exists, they must be getting access via role
  -- We create the record now.
  IF v_current_status IS NULL THEN
    INSERT INTO conversation_participants (conversation_id, user_id, is_archived)
    VALUES (p_conversation_id, auth.uid(), true) -- Toggle from false (default) to true
    RETURNING is_archived INTO v_new_status;
    RETURN v_new_status;
  END IF;

  v_new_status := NOT v_current_status;

  -- Update status
  UPDATE conversation_participants
  SET is_archived = v_new_status
  WHERE conversation_id = p_conversation_id AND user_id = auth.uid();

  RETURN v_new_status;
END;
$$;

-- 5. Fix RLS policies for conversations to ensure they use the new logic
DROP POLICY IF EXISTS "access_own_conversations" ON conversations;
CREATE POLICY "access_own_conversations"
ON conversations FOR SELECT
USING (is_participant_of_conversation(id));

-- Update other policies for consistency
DROP POLICY IF EXISTS "view_participants" ON conversation_participants;
CREATE POLICY "view_participants"
ON conversation_participants FOR SELECT
USING (is_participant_of_conversation(conversation_id));

DROP POLICY IF EXISTS "view_messages" ON messages;
CREATE POLICY "view_messages"
ON messages FOR SELECT
USING (is_participant_of_conversation(conversation_id));

DROP POLICY IF EXISTS "insert_messages" ON messages;
CREATE POLICY "insert_messages"
ON messages FOR INSERT
WITH CHECK (
  is_participant_of_conversation(conversation_id) AND
  sender_id = auth.uid()
);

NOTIFY pgrst, 'reload config';

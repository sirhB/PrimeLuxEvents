# Chat System Fix Instructions

To resolve the 400 errors, enable realtime updates, and **support starting chats with specific users**, please execute the following SQL.

## Steps

1.  Log in to your Supabase Dashboard.
2.  Go to the **SQL Editor**.
3.  Click **New Query**.
4.  Copy and paste the entire SQL block below.
5.  Click **Run**.

## SQL to Run

```sql
-- Refactor Chat System and Fix RLS

-- 1. Reset RLS Policies to ensure clean state
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add themselves as participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

-- 2. Enable Realtime for these tables
-- We use a DO block to safely check if tables are already in the publication to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'conversations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_participants') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
  END IF;
END $$;

-- 3. Simplified RLS Policies

-- Conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "access_own_conversations" ON conversations;
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

DROP POLICY IF EXISTS "create_conversations" ON conversations;
CREATE POLICY "create_conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Participants
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_participant_of_conversation(conv_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conv_id AND user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "view_participants" ON conversation_participants;
CREATE POLICY "view_participants"
ON conversation_participants FOR SELECT
USING (
  is_participant_of_conversation(conversation_id)
);

DROP POLICY IF EXISTS "insert_participants" ON conversation_participants;
CREATE POLICY "insert_participants"
ON conversation_participants FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id AND created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "update_own_participant" ON conversation_participants;
CREATE POLICY "update_own_participant"
ON conversation_participants FOR UPDATE
USING (user_id = auth.uid());

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "view_messages" ON messages;
CREATE POLICY "view_messages"
ON messages FOR SELECT
USING (
  is_participant_of_conversation(conversation_id)
);

DROP POLICY IF EXISTS "insert_messages" ON messages;
CREATE POLICY "insert_messages"
ON messages FOR INSERT
WITH CHECK (
  is_participant_of_conversation(conversation_id) AND
  sender_id = auth.uid()
);


-- 4. RPC Function for Atomic Conversation Creation
CREATE OR REPLACE FUNCTION create_new_conversation(
  p_type text,
  p_subject text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_participant_ids uuid[] DEFAULT ARRAY[]::uuid[]
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

-- 5. Helper to find user by Email (for starting chats)
-- SECURITY DEFINER to allow users to find others by exact email match
CREATE OR REPLACE FUNCTION get_user_by_email(email_input text)
RETURNS TABLE (id uuid, email varchar)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email::varchar
  FROM auth.users au
  WHERE au.email = email_input;
END;
$$;
```

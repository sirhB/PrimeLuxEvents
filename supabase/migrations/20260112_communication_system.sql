-- Ensure necessary extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('support', 'internal')),
  subject text,
  last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add created_by column if it doesn't exist
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  attachments text[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);


-- RLS Policies

-- Conversations
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
CREATE POLICY "Users can view conversations they participate in"
  ON conversations
  FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;
CREATE POLICY "Authenticated users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Helper function to check participation (Security Definer to avoid infinite recursion)
CREATE OR REPLACE FUNCTION is_conversation_participant(conv_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id AND conversation_participants.user_id = user_id
  );
END;
$$;

-- Participants
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
CREATE POLICY "Users can view participants of their conversations"
  ON conversation_participants
  FOR SELECT
  USING (is_conversation_participant(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Users can add themselves as participants" ON conversation_participants;
CREATE POLICY "Users can add themselves as participants"
  ON conversation_participants
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;
CREATE POLICY "Users can update their own participant record"
  ON conversation_participants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (is_conversation_participant(conversation_id, auth.uid()));
  
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
CREATE POLICY "Users can insert messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    is_conversation_participant(conversation_id, auth.uid())
    AND sender_id = auth.uid()
  );

-- Triggers
-- Security Definer required so that messages trigger can update conversation timestamp without user having explicit UPDATE privilege on conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Force Schema Cache Reload for PostgREST
NOTIFY pgrst, 'reload config';

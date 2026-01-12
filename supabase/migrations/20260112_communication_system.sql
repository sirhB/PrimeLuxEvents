-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('support', 'internal')), -- 'support' (client-staff), 'internal' (staff-staff)
  subject text, -- Optional, mostly for internal or ticket-like support
  last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Links to auth.users
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
  attachments text[], -- Array of URLs
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX idx_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);


-- RLS Policies

-- Conversations: Users can see conversations they are part of
CREATE POLICY "Users can view conversations they participate in"
  ON conversations
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Admin can view all support conversations (optional, depending on if they are auto-added as participants or just have global access)
-- For simplicity, we'll assume admins are added as participants OR we give them global access. 
-- Let's give staff global access to 'support' conversations via a role check if needed, but for now rely on participation or a broad policy.
-- Actually, a better approach for a support system: Admins can view ALL 'support' conversations.
-- We need a way to check if user is admin. usually via a public.profiles table or claim.
-- Assuming we have an 'is_admin' or similar check, or we just rely on the fact that admins *join* threads.
-- Let's stick to participation for strictness, but allow creation.

-- Participants: Users can view participants of their conversations
CREATE POLICY "Users can view participants of their conversations"
  ON conversation_participants
  USING (
    conversation_id IN (
        SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
    )
  );

-- Messages: Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  USING (
    conversation_id IN (
        SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
    )
  );
  
CREATE POLICY "Users can insert messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
        SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
    )
    AND sender_id = auth.uid()
  );

-- Update last_message_at trigger
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

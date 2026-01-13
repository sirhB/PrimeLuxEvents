-- Migration: Real-time Message Notifications
-- This migration implements a notification system for messages, supporting both direct and role-based chats.

-- 1. Ensure admin_notifications has user_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_notifications' AND column_name = 'user_id') THEN
        ALTER TABLE admin_notifications ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Update RLS for admin_notifications to be user-specific or admin-wide
DROP POLICY IF EXISTS "Admins can view notifications" ON admin_notifications;
CREATE POLICY "Users can view their own notifications" ON admin_notifications
    FOR SELECT USING (auth.uid() = user_id OR (user_id IS NULL AND public.is_admin()));

-- 3. Function to notify message recipients
CREATE OR REPLACE FUNCTION public.notify_message_recipients()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sender_name TEXT;
    v_conversation_title TEXT;
    v_target_role_id UUID;
    v_participant_id UUID;
BEGIN
    -- Get sender name
    SELECT full_name INTO v_sender_name
    FROM user_profiles
    WHERE id = NEW.sender_id;

    -- Get conversation info
    SELECT target_role_id, subject INTO v_target_role_id, v_conversation_title
    FROM conversations
    WHERE id = NEW.conversation_id;

    -- Case 1: Role-based conversation
    IF v_target_role_id IS NOT NULL THEN
        -- We notify users with this role
        -- Note: In a production app, we might want to avoid spamming everyone if there are many users.
        -- We'll insert one notification per user with the role (excluding sender)
        INSERT INTO admin_notifications (user_id, type, title, message, link)
        SELECT ur.user_id, 'new_message', 'New Team Message', 
               COALESCE(v_sender_name, 'Someone') || ': ' || LEFT(NEW.content, 50),
                '/admin/messages' -- Correct link
        FROM user_roles ur
        WHERE ur.role_id = v_target_role_id AND ur.user_id != NEW.sender_id;
    
    -- Case 2: Direct conversation / Explicit participants
    ELSE
        INSERT INTO admin_notifications (user_id, type, title, message, link)
        SELECT cp.user_id, 'new_message', 'New Message', 
               COALESCE(v_sender_name, 'Someone') || ': ' || LEFT(NEW.content, 50),
               '/admin/messages'
        FROM conversation_participants cp
        WHERE cp.conversation_id = NEW.conversation_id AND cp.user_id != NEW.sender_id;
    END IF;

    RETURN NEW;
END;
$$;

-- 4. Trigger for new messages
DROP TRIGGER IF EXISTS trigger_notify_message_recipients ON messages;
CREATE TRIGGER trigger_notify_message_recipients
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_message_recipients();

-- 5. Force Schema Cache Reload
NOTIFY pgrst, 'reload config';

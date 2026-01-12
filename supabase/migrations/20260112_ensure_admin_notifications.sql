-- Ensure admin_notifications table exists (idempotent)
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL, -- 'low_stock', 'overbooked', 'new_order', 'payment_received'
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policies (safe to re-run if using IF NOT EXISTS or dropping first, but simpler to just try creating if missing)
-- Since we can't easily check policy existence in simple SQL block without plpgsql DO block, 
-- we will assume if table existed, policies likely did too. If not, we create them.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_notifications' AND policyname = 'Admins can view notifications') THEN
        CREATE POLICY "Admins can view notifications" ON admin_notifications
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_notifications' AND policyname = 'Admins can update notifications') THEN
        CREATE POLICY "Admins can update notifications" ON admin_notifications
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    -- Insert also needed for triggers? Usually triggers handle insertion.
    -- But if manual insertion allowed:
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_notifications' AND policyname = 'Admins can insert notifications') THEN
        CREATE POLICY "Admins can insert notifications" ON admin_notifications
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

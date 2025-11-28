-- Migration: Create events table
-- This table stores all event information for the admin panel

CREATE TABLE IF NOT EXISTS events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id text NOT NULL UNIQUE,
  name text NOT NULL,
  event_date date NOT NULL,
  location text,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed', 'pending', 'cancelled')),
  guest_count integer,
  budget integer, -- stored in cents
  manager_name text,
  customer_name text,
  customer_email text,
  customer_phone text,
  notes text,
  event_type text, -- wedding, corporate, birthday, etc.
  venue_name text,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all events."
  ON events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert events."
  ON events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update events."
  ON events FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete events."
  ON events FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_event_id ON events(event_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_manager_name ON events(manager_name);

-- Add comment
COMMENT ON TABLE events IS 'Stores all event information for management and tracking';

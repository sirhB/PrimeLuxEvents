-- Migration: Add consultation_communications table
-- This table tracks all communication with clients (calls, emails, texts, notes)

CREATE TABLE IF NOT EXISTS consultation_communications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultation_id uuid NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('call', 'email', 'text', 'note')),
  content text NOT NULL,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE consultation_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all consultation communications."
  ON consultation_communications FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert consultation communications."
  ON consultation_communications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update consultation communications."
  ON consultation_communications FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete consultation communications."
  ON consultation_communications FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_consultation_communications_consultation_id ON consultation_communications(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_communications_created_at ON consultation_communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_communications_type ON consultation_communications(type);

-- Add comment
COMMENT ON TABLE consultation_communications IS 'Tracks all communication with clients: calls, emails, texts, and notes';


-- Migration: Add appointments table
-- This table stores all appointments (can be linked to consultations or standalone)

CREATE TABLE IF NOT EXISTS appointments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultation_id uuid REFERENCES consultations(id) ON DELETE SET NULL,
  client_name text,
  client_email text,
  client_phone text,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  location text,
  notes text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all appointments."
  ON appointments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert appointments."
  ON appointments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update appointments."
  ON appointments FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete appointments."
  ON appointments FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_consultation_id ON appointments(consultation_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);

-- Add comment
COMMENT ON TABLE appointments IS 'Stores all appointments, either linked to consultations or standalone';


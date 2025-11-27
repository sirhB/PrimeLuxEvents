-- Migration: Convert Quotes to Consultations
-- This migration renames the quotes table to consultations and updates the schema
-- to support the new consultation workflow

-- Step 1: Rename the quotes table to consultations
ALTER TABLE quotes RENAME TO consultations;

-- Step 2: Add new columns for consultation-specific data
ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS number_of_guests integer,
  ADD COLUMN IF NOT EXISTS budget_range text,
  ADD COLUMN IF NOT EXISTS has_venue boolean,
  ADD COLUMN IF NOT EXISTS venue_name text,
  ADD COLUMN IF NOT EXISTS has_caterer boolean,
  ADD COLUMN IF NOT EXISTS caterer_name text,
  ADD COLUMN IF NOT EXISTS has_planner boolean,
  ADD COLUMN IF NOT EXISTS planner_name text,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text;

-- Step 3: Update the status column to use new consultation workflow states
-- First, update existing statuses to map to new workflow
UPDATE consultations
SET status = CASE
  WHEN status = 'draft' THEN 'new_request'
  WHEN status = 'sent' THEN 'pending_response'
  WHEN status = 'accepted' THEN 'appointment_confirmed'
  WHEN status = 'expired' THEN 'completed'
  ELSE 'new_request'
END;

-- Step 4: Drop cart_data column as consultations don't have carts
-- We'll keep it for now to preserve any existing data, but make it nullable
ALTER TABLE consultations
  ALTER COLUMN cart_data DROP NOT NULL;

-- Step 5: Make financial columns nullable since consultations may not have quotes yet
ALTER TABLE consultations
  ALTER COLUMN subtotal DROP NOT NULL,
  ALTER COLUMN total_amount DROP NOT NULL;

-- Step 6: Update RLS policies
-- Drop old quote policies
DROP POLICY IF EXISTS "Anyone can create quotes." ON consultations;
DROP POLICY IF EXISTS "Admins can view all quotes." ON consultations;
DROP POLICY IF EXISTS "Admins can update quotes." ON consultations;

-- Create new consultation policies
CREATE POLICY "Anyone can create consultations."
  ON consultations FOR insert
  WITH CHECK (true);

CREATE POLICY "Admins can view all consultations."
  ON consultations FOR select
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update consultations."
  ON consultations FOR update
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete consultations."
  ON consultations FOR delete
  USING (auth.role() = 'authenticated');

-- Step 7: Add index for better query performance on status
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);

-- Step 8: Add a comment to the table
COMMENT ON TABLE consultations IS 'Stores consultation requests from the contact form with workflow states: new_request, pending_response, appointment_confirmed, completed';

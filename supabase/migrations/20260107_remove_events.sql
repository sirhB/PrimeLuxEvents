-- Migration: Remove events functionality
-- This migration removes all event-related tables and columns

-- Drop event_tasks table first (has foreign key to events)
DROP TABLE IF EXISTS event_tasks CASCADE;

-- Remove event_id columns from related tables
ALTER TABLE orders DROP COLUMN IF EXISTS event_id;
ALTER TABLE consultations DROP COLUMN IF EXISTS event_id;
ALTER TABLE appointments DROP COLUMN IF EXISTS event_id;

-- Drop events table
DROP TABLE IF EXISTS events CASCADE;

-- Add comment
COMMENT ON DATABASE postgres IS 'Removed events functionality - focusing on orders';

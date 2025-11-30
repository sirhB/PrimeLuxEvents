-- Migration: Add event relationships to existing tables
-- This migration adds event_id foreign keys to orders, consultations, and appointments tables

-- Add event_id to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE SET NULL;

-- Add event_id to consultations table
ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE SET NULL;

-- Add event_id to appointments table
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_consultations_event_id ON consultations(event_id);
CREATE INDEX IF NOT EXISTS idx_appointments_event_id ON appointments(event_id);

-- Update existing data based on customer name matching (best effort)
-- This will link existing orders/consultations/appointments to events based on customer name
UPDATE orders
SET event_id = events.id
FROM events
WHERE orders.customer_name = events.customer_name
  AND orders.event_id IS NULL;

UPDATE consultations
SET event_id = events.id
FROM events
WHERE consultations.customer_name = events.customer_name
  AND consultations.event_id IS NULL;

UPDATE appointments
SET event_id = events.id
FROM events
WHERE appointments.client_name = events.customer_name
  AND appointments.event_id IS NULL;

-- Add comment to document the relationships
COMMENT ON COLUMN orders.event_id IS 'Reference to the events table for linking orders to specific events';
COMMENT ON COLUMN consultations.event_id IS 'Reference to the events table for linking consultations to specific events';
COMMENT ON COLUMN appointments.event_id IS 'Reference to the events table for linking appointments to specific events';

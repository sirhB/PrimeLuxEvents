-- Add pickup information fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS pickup_date DATE,
ADD COLUMN IF NOT EXISTS pickup_time TEXT,
ADD COLUMN IF NOT EXISTS pickup_notes TEXT,
ADD COLUMN IF NOT EXISTS same_day_pickup BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN orders.pickup_date IS 'Date when rental items should be picked up';
COMMENT ON COLUMN orders.pickup_time IS 'Preferred time window for pickup';
COMMENT ON COLUMN orders.pickup_notes IS 'Special instructions for pickup';
COMMENT ON COLUMN orders.same_day_pickup IS 'Whether pickup is scheduled for the same day as the event';

-- Add is_overbooked column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS is_overbooked BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN orders.is_overbooked IS 'Flag indicating if the order contains items that exceed available stock';

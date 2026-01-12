-- Add discount tracking to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_total integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_name text;

-- Add index for reporting
CREATE INDEX IF NOT EXISTS idx_orders_discount_total ON orders(discount_total);

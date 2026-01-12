-- Add cost column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost integer DEFAULT 0;

-- Update existing products to have a cost based on 50% of price (rough estimate if not provided)
-- This ensures the "total value" doesn't drop to zero for existing data.
UPDATE products SET cost = ROUND(price * 0.5) WHERE cost = 0 OR cost IS NULL;

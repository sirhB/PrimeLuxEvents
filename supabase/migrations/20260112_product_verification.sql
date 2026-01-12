-- Add verification columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Add index for efficient filtering by verification status
CREATE INDEX IF NOT EXISTS idx_products_is_verified ON products(is_verified);

-- Update existing products to have is_verified false if not already set
UPDATE products SET is_verified = false WHERE is_verified IS NULL;

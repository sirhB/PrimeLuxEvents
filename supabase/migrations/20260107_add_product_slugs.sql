-- Add slug column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;

-- Function to generate slug from name and category
CREATE OR REPLACE FUNCTION generate_product_slug(product_name text, category_name text DEFAULT NULL) RETURNS text AS $$
DECLARE
  base_slug text;
BEGIN
  IF category_name IS NOT NULL AND category_name != '' THEN
    base_slug := lower(category_name || ' ' || product_name);
  ELSE
    base_slug := lower(product_name);
  END IF;
  
  RETURN regexp_replace(regexp_replace(base_slug, '[^a-z0-9\s]', '', 'g'), '\s+', '-', 'g');
END;
$$ LANGUAGE plpgsql;

-- Update existing products with slugs using category names
-- We append the first 4 characters of the ID to ensure uniqueness in case of name collisions
UPDATE products p
SET slug = generate_product_slug(p.name, c.name) || '-' || substr(p.id::text, 1, 4)
FROM categories c
WHERE p.category_id = c.id AND p.slug IS NULL;

-- Fallback for products without categories
UPDATE products 
SET slug = generate_product_slug(name) || '-' || substr(id::text, 1, 4) 
WHERE slug IS NULL;

-- Handle any remaining nulls (shouldn't be any)
UPDATE products SET slug = 'product-' || substr(id::text, 1, 8) WHERE slug IS NULL;

-- Now add the unique constraint and NOT NULL
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);

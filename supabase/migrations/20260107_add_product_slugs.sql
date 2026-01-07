-- Add slug column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Function to generate slug
CREATE OR REPLACE FUNCTION generate_slug(name text) RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Update existing products with slugs
UPDATE products SET slug = generate_slug(name) WHERE slug IS NULL;

-- Make slug NOT NULL after populating
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;

-- Update the slug generation function to exclude category name
CREATE OR REPLACE FUNCTION generate_product_slug(product_name text, category_name text DEFAULT NULL) RETURNS text AS $$
DECLARE
  base_slug text;
BEGIN
  -- We no longer use the category name in the product slug
  base_slug := lower(product_name);
  
  RETURN regexp_replace(regexp_replace(base_slug, '[^a-z0-9\s]', '', 'g'), '\s+', '-', 'g');
END;
$$ LANGUAGE plpgsql;

-- Update existing products to have cleaner slugs (removing category prefix if it exists)
-- This re-generates all slugs using the new logic and preserves the uniqueness suffix
UPDATE products p
SET slug = generate_product_slug(p.name) || '-' || substr(p.id::text, 1, 4);

-- Optional: If you want to keep slugs even cleaner without the ID suffix for most items, 
-- you'd only append it if there's a collision. But for simplicity and safety in a batch update,
-- keeping the suffix is more robust.

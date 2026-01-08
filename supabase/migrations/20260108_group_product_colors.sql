-- Migration to group products by color variants
-- Created based on scraped data patterns (e.g. "Product Name (Color)")

-- Add columns for color grouping
ALTER TABLE products ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS group_id uuid;
ALTER TABLE products ADD COLUMN IF NOT EXISTS hex_color text; -- For UI display if needed

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_group_id ON products(group_id);

DO $$
DECLARE
    r RECORD;
    gid uuid;
BEGIN
    -- Loop through unique base names found by stripping "(Color)" suffix
    FOR r IN
        SELECT DISTINCT substring(name from '^(.*)\s\((.+)\)$') as bname
        FROM products
        WHERE name ~ '.*\s\(.+\)$'
    LOOP
        -- Check if there are actually multiple products for this base name
        -- (Optional: even single products can be grouped if we expect variants later, 
        -- but strictly speaking we only need to grouping if there are variants. 
        -- However, consistent data structure is better.)
        
        gid := gen_random_uuid();

        -- Update products matching this base name
        UPDATE products
        SET
            group_id = gid,
            -- Extract color from inside parentheses
            color = substring(name from '^.*\s\((.+)\)$')
        WHERE
            substring(name from '^(.*)\s\((.+)\)$') = r.bname;
            
    END LOOP;
END $$;

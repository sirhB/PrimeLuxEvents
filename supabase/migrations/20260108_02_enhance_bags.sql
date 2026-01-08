-- Enhance Warehouse Bag Management
-- Change number to text to support custom alphanumeric IDs
ALTER TABLE warehouse_bags ALTER COLUMN number TYPE TEXT;

-- Table for general catalog items stored in bags (not order-specific)
CREATE TABLE IF NOT EXISTS bag_catalog_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bag_id UUID REFERENCES warehouse_bags(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE bag_catalog_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view bag catalog items" 
ON bag_catalog_items FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage bag catalog items" 
ON bag_catalog_items FOR ALL 
USING (auth.role() = 'authenticated');

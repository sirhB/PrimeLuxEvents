-- Create warehouse_locations table
CREATE TABLE IF NOT EXISTS warehouse_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'Shelf', 'Bin', 'Aisle'
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name)
);

-- Add location_id to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL;

-- Add location_id to warehouse_bags
ALTER TABLE warehouse_bags ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;

-- Policies for warehouse_locations
CREATE POLICY "Admins can view warehouse locations" 
ON warehouse_locations FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage warehouse locations" 
ON warehouse_locations FOR ALL 
USING (auth.role() = 'authenticated');

-- Seed some initial locations
INSERT INTO warehouse_locations (name, type) VALUES
('Shelf A1', 'Shelf'),
('Shelf A2', 'Shelf'),
('Shelf B1', 'Shelf'),
('Shelf B2', 'Shelf'),
('Bin 101', 'Bin'),
('Bin 102', 'Bin')
ON CONFLICT (name) DO NOTHING;

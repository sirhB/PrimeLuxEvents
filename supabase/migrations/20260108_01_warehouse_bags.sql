-- Warehouse Bag Management
CREATE TABLE IF NOT EXISTS warehouse_bags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    color TEXT NOT NULL, -- 'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White'
    number INTEGER NOT NULL,
    status TEXT DEFAULT 'empty', -- 'empty', 'packed', 'shipped', 'returned'
    last_order_id UUID REFERENCES orders(id),
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(color, number)
);

-- Assignments of items to bags for an order
CREATE TABLE IF NOT EXISTS bag_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bag_id UUID REFERENCES warehouse_bags(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE warehouse_bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bag_assignments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view bags" ON warehouse_bags FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update bags" ON warehouse_bags FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can view bag assignments" ON bag_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage bag assignments" ON bag_assignments FOR ALL USING (auth.role() = 'authenticated');

-- Seed initial bags (example set)
INSERT INTO warehouse_bags (color, number) 
SELECT color, n
FROM (VALUES ('Red'), ('Blue'), ('Green'), ('Yellow'), ('Black')) AS colors(color)
CROSS JOIN generate_series(1, 20) AS nums(n)
ON CONFLICT DO NOTHING;

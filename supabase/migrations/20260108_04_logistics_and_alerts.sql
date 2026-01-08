-- Add coordinates to orders for logistics
ALTER TABLE orders ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create inventory logs for auditing
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    change_amount INTEGER NOT NULL,
    reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create admin notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL, -- 'low_stock', 'overbooked', 'new_order', 'payment_received'
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to check product availability for a date range
CREATE OR REPLACE FUNCTION check_product_availability(p_id UUID, p_start DATE, p_end DATE, p_qty INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    total_stock INTEGER;
    max_reserved INTEGER;
BEGIN
    -- Get total available stock
    SELECT quantity_available INTO total_stock FROM products WHERE id = p_id;
    
    -- Find the peak reservation count during the period
    -- We check each day in the range or just aggregate overlapping reservations
    SELECT MAX(reserved_on_day) INTO max_reserved
    FROM (
        SELECT SUM(quantity) as reserved_on_day
        FROM rental_reservations
        WHERE product_id = p_id
        AND (start_date, end_date) OVERLAPS (p_start, p_end)
        AND status IN ('confirmed', 'pending')
        GROUP BY generate_series(start_date, end_date, '1 day'::interval)
    ) peak_check;

    RETURN (total_stock - COALESCE(max_reserved, 0)) >= p_qty;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify on new orders
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO admin_notifications (type, title, message, link)
    VALUES (
        'new_order',
        'New Order Received',
        'Order #' || UPPER(LEFT(NEW.id::text, 8)) || ' from ' || NEW.customer_name,
        '/admin/orders/' || NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_created
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_order();

-- Enable RLS on new tables
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view inventory logs" ON inventory_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can view notifications" ON admin_notifications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update notifications" ON admin_notifications
    FOR UPDATE USING (auth.role() = 'authenticated');

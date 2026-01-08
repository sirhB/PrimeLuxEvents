-- Migration: Link orders to users and update RLS for Customer Portal
-- Adds user_id to orders and tightens security policies

-- 1. Add user_id column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 2. Backfill user_id based on email matches in user_profiles
-- Using lower() for case-insensitive matching
UPDATE orders
SET user_id = up.id
FROM user_profiles up
WHERE lower(orders.customer_email) = lower(up.email)
AND orders.user_id IS NULL;

-- 3. Update RLS for orders table
-- Drop loosely defined policies from schema.sql
DROP POLICY IF EXISTS "Admins can view all orders." ON orders;
DROP POLICY IF EXISTS "Admins can update orders." ON orders;

-- Policy for Admins/Staff
CREATE POLICY "Admins and staff can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('admin', 'manager', 'staff')
        )
    );

CREATE POLICY "Admins and staff can update all orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('admin', 'manager', 'staff')
        )
    );

-- Policy for Customers
CREATE POLICY "Customers can view their own orders"
    ON orders FOR SELECT
    USING (
        auth.uid() = user_id 
        OR 
        lower(customer_email) = lower(auth.jwt() ->> 'email')
    );

-- 4. Update RLS for order_items table
DROP POLICY IF EXISTS "Admins can view all order items." ON order_items;

CREATE POLICY "Admins and staff can view all order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('admin', 'manager', 'staff')
        )
    );

CREATE POLICY "Customers can view their own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
            AND (o.user_id = auth.uid() OR lower(o.customer_email) = lower(auth.jwt() ->> 'email'))
        )
    );

-- 5. Update RLS for user_profiles to allow users to update their own info
DROP POLICY IF EXISTS "Users can update their own profiles" ON user_profiles;
CREATE POLICY "Users can update their own profiles"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Fix RLS policies to allow checkout by non-authenticated users
CREATE POLICY "Anyone can insert order items." ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert reservations." ON rental_reservations FOR INSERT WITH CHECK (true);

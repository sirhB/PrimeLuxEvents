-- Fix RLS policies to allow checkout by non-authenticated users
drop policy if exists "Anyone can insert order items." on order_items;
CREATE POLICY "Anyone can insert order items." ON order_items FOR INSERT WITH CHECK (true);
drop policy if exists "Anyone can insert reservations." on rental_reservations;
CREATE POLICY "Anyone can insert reservations." ON rental_reservations FOR INSERT WITH CHECK (true);

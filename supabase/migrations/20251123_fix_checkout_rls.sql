-- Fix RLS policies to allow guest checkout

-- Allow anyone to insert order items (required for guest checkout)
drop policy if exists "Anyone can create order items" on order_items;
CREATE POLICY "Anyone can create order items"
ON order_items FOR INSERT
WITH CHECK (true);

-- Allow anyone to insert rental reservations (required for guest checkout)
drop policy if exists "Anyone can create rental reservations" on rental_reservations;
CREATE POLICY "Anyone can create rental reservations"
ON rental_reservations FOR INSERT
WITH CHECK (true);

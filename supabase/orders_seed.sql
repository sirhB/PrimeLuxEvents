-- Seed Orders with Delivery Details
-- Note: This assumes products exist from seed.sql. 
-- We will use a DO block to look up product IDs and insert orders.

DO $$
DECLARE
  -- Product IDs
  chair_id uuid;
  table_id uuid;
  sofa_id uuid;
  
  -- Order IDs
  order1_id uuid := uuid_generate_v4();
  order2_id uuid := uuid_generate_v4();
  
  -- Dates
  today date := CURRENT_DATE;
BEGIN
  -- Look up some products
  SELECT id INTO chair_id FROM products WHERE name = 'Gilded Chiavari Chair' LIMIT 1;
  SELECT id INTO table_id FROM products WHERE name = 'Farmhouse Dining Table' LIMIT 1;
  SELECT id INTO sofa_id FROM products WHERE name = 'Velvet Lounge Sofa' LIMIT 1;

  -- Create Order 1: Wedding
  INSERT INTO orders (id, customer_name, customer_email, total_amount, status, delivery_address, delivery_time, delivery_notes)
  VALUES (
    order1_id,
    'Isabella Martinez',
    'isabella.m@example.com',
    1250.00,
    'confirmed',
    'The Plaza Hotel, 768 5th Ave, New York, NY 10019',
    '10:00 AM',
    'Deliver to the Grand Ballroom via loading dock B. Contact event coordinator upon arrival.'
  );

  -- Create Order 2: Corporate Event
  INSERT INTO orders (id, customer_name, customer_email, total_amount, status, delivery_address, delivery_time, delivery_notes)
  VALUES (
    order2_id,
    'TechCorp Inc.',
    'events@techcorp.com',
    3500.00,
    'confirmed',
    'Javits Center, 429 11th Ave, New York, NY 10001',
    '08:00 AM',
    'Booth 405 setup. strict security check required.'
  );

  -- Create Order Items for Order 1
  IF chair_id IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
    VALUES (order1_id, chair_id, 100, 12.50);
    
    INSERT INTO rental_reservations (product_id, order_id, start_date, end_date, quantity, status)
    VALUES (chair_id, order1_id, today, today + 2, 100, 'confirmed');
  END IF;

  IF table_id IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
    VALUES (order1_id, table_id, 10, 85.00);

    INSERT INTO rental_reservations (product_id, order_id, start_date, end_date, quantity, status)
    VALUES (table_id, order1_id, today, today + 2, 10, 'confirmed');
  END IF;

  -- Create Order Items for Order 2
  IF sofa_id IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
    VALUES (order2_id, sofa_id, 4, 150.00);

    INSERT INTO rental_reservations (product_id, order_id, start_date, end_date, quantity, status)
    VALUES (sofa_id, order2_id, today, today + 3, 4, 'confirmed');
  END IF;

END $$;

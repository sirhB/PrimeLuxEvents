-- Migration: Seed data for delivery and task testing (Updated - No Events)

DO $$
DECLARE
  -- Order IDs
  ord_wedding uuid;
  ord_gala uuid;
  ord_birthday uuid;
  ord_standalone uuid;
  
  -- Product IDs (fetched dynamically)
  prod_chair uuid;
  prod_table uuid;
  prod_tent uuid;
  prod_bar uuid;

BEGIN

  -- 1. Create Orders with delivery information
  -- Note: Latitude/Longitude are approximate for LA area to test map/routing
  
  -- Wedding Order
  INSERT INTO orders (customer_name, customer_email, delivery_address, delivery_time, status, total_amount, latitude, longitude)
  VALUES ('John Smith', 'john@example.com', '123 Wedding Lane, Beverly Hills, CA', (now() + interval '2 days')::timestamp, 'confirmed', 500000, 34.0736, -118.4004)
  RETURNING id INTO ord_wedding;

  -- Gala Order
  INSERT INTO orders (customer_name, customer_email, delivery_address, delivery_time, status, total_amount, latitude, longitude)
  VALUES ('Jane Doe', 'jane@techcorp.com', '500 Convention Center Dr, Los Angeles, CA', (now() + interval '5 days')::timestamp, 'pending', 1500000, 34.0407, -118.2690)
  RETURNING id INTO ord_gala;

  -- Birthday Order
  INSERT INTO orders (customer_name, customer_email, delivery_address, delivery_time, status, total_amount, latitude, longitude)
  VALUES ('Mike Johnson', 'mike@example.com', '888 Suburban St, Pasadena, CA', (now() + interval '1 day')::timestamp, 'confirmed', 75000, 34.1478, -118.1445)
  RETURNING id INTO ord_birthday;

  -- Standalone Order
  INSERT INTO orders (customer_name, customer_email, delivery_address, delivery_time, status, total_amount, latitude, longitude)
  VALUES ('Sarah Connor', 'sarah@example.com', '101 Terminator Blvd, Santa Monica, CA', (now() + interval '3 days')::timestamp, 'confirmed', 25000, 34.0195, -118.4912)
  RETURNING id INTO ord_standalone;


  -- 2. Add Order Items
  -- Fetch some product IDs and their prices
  SELECT id INTO prod_chair FROM products WHERE name ILIKE '%Chiavari%' LIMIT 1;
  SELECT id INTO prod_table FROM products WHERE name ILIKE '%Banquet%' LIMIT 1;
  SELECT id INTO prod_tent FROM products WHERE name ILIKE '%Tent%' LIMIT 1;
  SELECT id INTO prod_bar FROM products WHERE name ILIKE '%Bar%' LIMIT 1;

  -- Wedding Items
  IF prod_chair IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
    SELECT ord_wedding, prod_chair, 100, rental_price_daily FROM products WHERE id = prod_chair;
  END IF;
  IF prod_table IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
    SELECT ord_wedding, prod_table, 10, rental_price_daily FROM products WHERE id = prod_table;
  END IF;

  -- Gala Items
  IF prod_chair IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
    SELECT ord_gala, prod_chair, 300, rental_price_daily FROM products WHERE id = prod_chair;
  END IF;
  IF prod_bar IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
    SELECT ord_gala, prod_bar, 5, rental_price_daily FROM products WHERE id = prod_bar;
  END IF;

  -- Birthday Items
  IF prod_tent IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
    SELECT ord_birthday, prod_tent, 1, rental_price_daily FROM products WHERE id = prod_tent;
  END IF;
  IF prod_table IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
    SELECT ord_birthday, prod_table, 4, rental_price_daily FROM products WHERE id = prod_table;
  END IF;

  -- Standalone Items
  IF prod_chair IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
    SELECT ord_standalone, prod_chair, 20, rental_price_daily FROM products WHERE id = prod_chair;
  END IF;


  -- 3. Create Tasks
  
  -- Delivery Tasks (Linked to Orders)
  INSERT INTO tasks (title, description, status, priority, task_type, assigned_to_text, due_date, order_id, route_order, created_by_text)
  VALUES 
    ('Deliver to Smith Wedding', 'Deliver chairs and tables to main hall', 'pending', 'high', 'delivery', 'Driver Team A', (now() + interval '2 days')::date, ord_wedding, 1, 'admin'),
    ('Deliver to Tech Gala', 'Early morning delivery for setup', 'pending', 'urgent', 'delivery', 'Driver Team B', (now() + interval '5 days')::date, ord_gala, 2, 'admin'),
    ('Deliver to Birthday Bash', 'Backyard setup required', 'pending', 'medium', 'delivery', 'Driver Team A', (now() + interval '1 day')::date, ord_birthday, 3, 'admin'),
    ('Deliver to Sarah Connor', 'Standard drop-off', 'pending', 'medium', 'delivery', 'Driver Team C', (now() + interval '3 days')::date, ord_standalone, 4, 'admin');

  -- General/Warehouse Tasks
  INSERT INTO tasks (title, description, status, priority, task_type, assigned_to_text, due_date, created_by_text)
  VALUES 
    ('Weekly Vehicle Maintenance', 'Check oil and tires for Truck 1 & 2', 'pending', 'medium', 'general', 'Maintenance Crew', (now() + interval '3 days')::date, 'admin'),
    ('Organize Chair Storage', 'Re-stack Chiavari chairs by color', 'pending', 'low', 'warehouse', 'Warehouse Staff', (now() + interval '4 days')::date, 'admin'),
    ('Office Supply Run', 'Buy printer paper and ink', 'pending', 'low', 'office', 'Admin Assistant', now()::date, 'admin');

END $$;

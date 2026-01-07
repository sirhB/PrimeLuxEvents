-- Seed data generated from PrimeLuxEvents.com

-- Categories
DO $$
DECLARE
  cat_backdrops_panels uuid;
  cat_flower_walls uuid;
  cat_shimmer_walls uuid;
  cat_soft_touch_walls uuid;
  cat_bar_counters uuid;
  cat_bar_stools uuid;
  cat_bar_tables uuid;
  cat_benches_ottomans uuid;
  cat_cake_tables_stands uuid;
  cat_chafing_dishes uuid;
  cat_cooking_prep uuid;
  cat_decorations_props uuid;
  cat_flooring_staging uuid;
  cat_chairs uuid;
  cat_sofas_loveseats uuid;
  cat_kids_backdrops uuid;
  cat_kids_chairs uuid;
  cat_kids_tables uuid;
  cat_kids_thrones uuid;
  cat_led_signs uuid;
  cat_lit_letters_and_numbers uuid;
  cat_thrones uuid;
  cat_misc uuid;
  cat_pedestals_plinths uuid;
  cat_shelves uuid;
  cat_sweets_carts uuid;
  cat_charger_plates uuid;
  cat_dinnerware uuid;
  cat_centerpeices_2 uuid;
  cat_table_linens uuid;
  cat_table_napkins_and_rings uuid;
  cat_dining_tables uuid;
  cat_tent uuid;
  cat_buffet_service uuid;
  cat_glasswear uuid;
  cat_chargers uuid;
  cat_table_settings uuid;
BEGIN

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Backdrops & Panels', 'backdrops-panels', 'Backdrops & Panels rental.', 'https://placehold.co/600x400?text=Backdrops%20%26%20Panels', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_backdrops_panels;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Flower Walls', 'flower-walls', 'Flower Walls rental.', 'https://placehold.co/600x400?text=Flower%20Walls', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_flower_walls;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Shimmer Walls', 'shimmer-walls', 'Shimmer Walls rental.', 'https://placehold.co/600x400?text=Shimmer%20Walls', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_shimmer_walls;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Soft Touch Walls', 'soft-touch-walls', 'Soft Touch Walls rental.', 'https://placehold.co/600x400?text=Soft%20Touch%20Walls', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_soft_touch_walls;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Bar Counters', 'bar-counters', 'Bar Counters rental.', 'https://placehold.co/600x400?text=Bar%20Counters', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_bar_counters;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Bar Stools', 'bar-stools', 'Bar Stools rental.', 'https://placehold.co/600x400?text=Bar%20Stools', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_bar_stools;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Bar Tables', 'bar-tables', 'Bar Tables rental.', 'https://placehold.co/600x400?text=Bar%20Tables', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_bar_tables;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Benches & Ottomans', 'benches-ottomans', 'Benches & Ottomans rental.', 'https://placehold.co/600x400?text=Benches%20%26%20Ottomans', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_benches_ottomans;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Cake Tables & Stands', 'cake-tables-stands', 'Cake Tables & Stands rental.', 'https://placehold.co/600x400?text=Cake%20Tables%20%26%20Stands', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_cake_tables_stands;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Chafing Dishes', 'chafing-dishes', 'Chafing Dishes rental.', 'https://placehold.co/600x400?text=Chafing%20Dishes', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_chafing_dishes;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Cooking & Prep', 'cooking-prep', 'Cooking & Prep rental.', 'https://placehold.co/600x400?text=Cooking%20%26%20Prep', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_cooking_prep;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Decorations & Props', 'decorations-props', 'Decorations & Props rental.', 'https://placehold.co/600x400?text=Decorations%20%26%20Props', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_decorations_props;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Flooring & Staging', 'flooring-staging', 'Flooring & Staging rental.', 'https://placehold.co/600x400?text=Flooring%20%26%20Staging', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_flooring_staging;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Chairs', 'chairs', 'Chairs rental.', 'https://placehold.co/600x400?text=Chairs', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_chairs;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Sofas & Loveseats', 'sofas-loveseats', 'Sofas & Loveseats rental.', 'https://placehold.co/600x400?text=Sofas%20%26%20Loveseats', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_sofas_loveseats;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Kids Backdrops', 'kids-backdrops', 'Kids Backdrops rental.', 'https://placehold.co/600x400?text=Kids%20Backdrops', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_kids_backdrops;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Kids Chairs', 'kids-chairs', 'Kids Chairs rental.', 'https://placehold.co/600x400?text=Kids%20Chairs', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_kids_chairs;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Kids Tables', 'kids-tables', 'Kids Tables rental.', 'https://placehold.co/600x400?text=Kids%20Tables', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_kids_tables;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Kids Thrones', 'kids-thrones', 'Kids Thrones rental.', 'https://placehold.co/600x400?text=Kids%20Thrones', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_kids_thrones;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('LED Signs', 'led-signs', 'LED Signs rental.', 'https://placehold.co/600x400?text=LED%20Signs', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_led_signs;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Lit Letters & Numbers', 'lit-letters-and-numbers', 'Lit Letters & Numbers rental.', 'https://placehold.co/600x400?text=Lit%20Letters%20%26%20Numbers', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_lit_letters_and_numbers;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Luxury Thrones', 'thrones', 'Luxury Thrones rental.', 'https://placehold.co/600x400?text=Luxury%20Thrones', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_thrones;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Misc', 'misc', 'Misc rental.', 'https://placehold.co/600x400?text=Misc', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_misc;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Pedestals & Plinths', 'pedestals-plinths', 'Pedestals & Plinths rental.', 'https://placehold.co/600x400?text=Pedestals%20%26%20Plinths', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_pedestals_plinths;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Shelves', 'shelves', 'Shelves rental.', 'https://placehold.co/600x400?text=Shelves', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_shelves;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Sweets Carts', 'sweets-carts', 'Sweets Carts rental.', 'https://placehold.co/600x400?text=Sweets%20Carts', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_sweets_carts;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Charger Plates', 'charger-plates', 'Charger Plates rental.', 'https://placehold.co/600x400?text=Charger%20Plates', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_charger_plates;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Dinnerware', 'dinnerware', 'Dinnerware rental.', 'https://placehold.co/600x400?text=Dinnerware', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_dinnerware;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Flowers & Centerpieces', 'centerpeices-2', 'Flowers & Centerpieces rental.', 'https://placehold.co/600x400?text=Flowers%20%26%20Centerpieces', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_centerpeices_2;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Table Linens', 'table-linens', 'Table Linens rental.', 'https://placehold.co/600x400?text=Table%20Linens', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_table_linens;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Napkins & Rings', 'table-napkins-and-rings', 'Napkins & Rings rental.', 'https://placehold.co/600x400?text=Napkins%20%26%20Rings', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_table_napkins_and_rings;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Tables', 'dining-tables', 'Tables rental.', 'https://placehold.co/600x400?text=Tables', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_dining_tables;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Tents', 'tent', 'Tents rental.', 'https://placehold.co/600x400?text=Tents', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_tent;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Buffet Service', 'buffet-service', 'Buffet Service rental.', 'https://placehold.co/600x400?text=Buffet%20Service', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_buffet_service;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Glassware', 'glasswear', 'Glassware rental.', 'https://placehold.co/600x400?text=Glassware', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_glasswear;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Chargers', 'chargers', 'Chargers rental.', 'https://placehold.co/600x400?text=Chargers', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_chargers;

  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Table Settings', 'table-settings', 'Table Settings rental.', 'https://placehold.co/600x400?text=Table%20Settings', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_table_settings;

  -- Products
  -- Backdrops & Panels
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_backdrops_panels, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_backdrops_panels, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_backdrops_panels, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Scarlet Royale FrameRegular', 'Scarlet Royale Frame.', 67500, cat_backdrops_panels, '/images/products/scarlet-royale-frameregular.jpg', 67500, 10, '[]'::jsonb),
  ('Scottsdale Arch', 'Scottsdale Arch.', 37500, cat_backdrops_panels, '/images/products/scottsdale-arch.jpg', 37500, 10, '[]'::jsonb),
  ('Sapphire acrh', 'Sapphire acrh.', 25000, cat_backdrops_panels, '/images/products/sapphire-acrh.jpg', 25000, 10, '[]'::jsonb),
  ('Clover wave Acrh', 'Clover wave Acrh.', 27500, cat_backdrops_panels, '/images/products/clover-wave-acrh.jpg', 27500, 10, '[]'::jsonb),
  ('Ana set', 'Ana set.', 60000, cat_backdrops_panels, '/images/products/ana-set.jpg', 60000, 10, '[]'::jsonb),
  ('Waves of Elegance Backdrop 8x8ft', 'Waves of Elegance Backdrop 8x8ft.', 45000, cat_backdrops_panels, '/images/products/waves-of-elegance-backdrop-8x8ft.jpg', 45000, 10, '[]'::jsonb),
  ('JOLIE"S  BACKDROP', 'JOLIE"S  BACKDROP.', 65000, cat_backdrops_panels, '/images/products/jolie-s-backdrop.jpg', 65000, 10, '[]'::jsonb),
  ('Story Book', 'Story Book.', 27500, cat_backdrops_panels, '/images/products/story-book.jpg', 27500, 10, '[]'::jsonb),
  ('Fresh Kicks Display 6ft', 'Fresh Kicks Display 6ft.', 22500, cat_backdrops_panels, '/images/products/fresh-kicks-display-6ft.jpg', 22500, 10, '[]'::jsonb),
  ('Moon 7ft', 'Moon 7ft.', 17500, cat_backdrops_panels, '/images/products/moon-7ft.jpg', 17500, 10, '[]'::jsonb),
  ('Santorini wall package', 'Santorini wall package.', 100000, cat_backdrops_panels, '/images/products/santorini-wall-package.jpg', 100000, 10, '[]'::jsonb),
  ('Boxwood  Wall 6ft x 3ft', 'Boxwood  Wall 6ft x 3ft.', 22500, cat_backdrops_panels, '/images/products/boxwood-wall-6ft-x-3ft.jpg', 22500, 10, '[]'::jsonb),
  ('Sugar Blossom Patisserie 🌸🍩', 'Sugar Blossom Patisserie 🌸🍩.', 50000, cat_backdrops_panels, '/images/products/sugar-blossom-patisserie.jpg', 50000, 10, '[]'::jsonb),
  ('Rustic Red Barn Wall', 'Rustic Red Barn Wall.', 27500, cat_backdrops_panels, '/images/products/rustic-red-barn-wall.jpg', 27500, 10, '[]'::jsonb),
  ('F&M Arch Wall', 'F&M Arch Wall.', 15000, cat_backdrops_panels, '/images/products/f-m-arch-wall.jpg', 15000, 10, '[]'::jsonb),
  ('Fanta Shelf Wall | 8ft x 8ft', 'Fanta Shelf Wall | 8ft x 8ft.', 27500, cat_backdrops_panels, '/images/products/fanta-shelf-wall-8ft-x-8ft.jpg', 27500, 10, '[]'::jsonb),
  ('Trio Wedding Gold Arch', 'Trio Wedding Gold Arch.', 105000, cat_backdrops_panels, '/images/products/trio-wedding-gold-arch.jpg', 105000, 10, '[]'::jsonb),
  ('The Crain wall', 'The Crain wall.', 12500, cat_backdrops_panels, '/images/products/the-crain-wall.jpg', 12500, 10, '[]'::jsonb),
  ('Alice flower box 6ft x 4ft', 'Alice flower box 6ft x 4ft.', 35000, cat_backdrops_panels, '/images/products/alice-flower-box-6ft-x-4ft.jpg', 35000, 10, '[]'::jsonb),
  ('Luxe Tote', 'Luxe Tote.', 65000, cat_backdrops_panels, '/images/products/luxe-tote.jpg', 65000, 10, '[]'::jsonb);

  -- Flower Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_flower_walls, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_flower_walls, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_flower_walls, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('RED FLOWER WALL BACKDROP', 'RED FLOWER WALL BACKDROP.', 20000, cat_flower_walls, '/images/products/red-flower-wall-backdrop.jpg', 20000, 10, '[]'::jsonb),
  ('Grand Flower Wall Backdrop', 'Grand Flower Wall Backdrop.', 40000, cat_flower_walls, '/images/products/grand-flower-wall-backdrop.jpg', 40000, 10, '[]'::jsonb),
  ('FLOWER WALL & BALLOONRegular', 'FLOWER WALL & BALLOON.', 58000, cat_flower_walls, '/images/products/flower-wall-balloonregular.jpg', 58000, 10, '[]'::jsonb),
  ('Flower Wall (Touch of Pink)', 'Flower Wall (Touch of Pink).', 25000, cat_flower_walls, '/images/products/flower-wall-touch-of-pink.jpg', 25000, 10, '[]'::jsonb);

  -- Shimmer Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_shimmer_walls, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_shimmer_walls, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_shimmer_walls, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Shimmer Wall (Gold)', 'Shimmer Wall (Gold).', 22500, cat_shimmer_walls, '/images/products/shimmer-wall-gold.jpg', 22500, 10, '[]'::jsonb),
  ('Shimmer Wall (Black)', 'Shimmer Wall (Black).', 22500, cat_shimmer_walls, '/images/products/shimmer-wall-black.jpg', 22500, 10, '[]'::jsonb),
  ('Shimmer Wall (Silver)', 'Shimmer Wall (Silver).', 22500, cat_shimmer_walls, '/images/products/shimmer-wall-silver.jpg', 22500, 10, '[]'::jsonb);

  -- Soft Touch Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_soft_touch_walls, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_soft_touch_walls, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_soft_touch_walls, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Soft Touch Wall (Black)', 'Soft Touch Wall (Black).', 15000, cat_soft_touch_walls, '/images/products/soft-touch-wall-black.jpg', 15000, 10, '[]'::jsonb);

  -- Bar Counters
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_bar_counters, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_bar_counters, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_bar_counters, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Malibu Bar 6ft', 'Malibu Bar 6ft.', 32500, cat_bar_counters, '/images/products/malibu-bar-6ft.jpg', 32500, 10, '[]'::jsonb),
  ('Lux Bar', 'Lux Bar.', 35000, cat_bar_counters, '/images/products/lux-bar.jpg', 35000, 10, '[]'::jsonb),
  ('White CHAMPAGNE WALLRegular', 'White CHAMPAGNE WALL.', 20000, cat_bar_counters, '/images/products/white-champagne-wallregular.jpg', 20000, 10, '[]'::jsonb),
  ('Black Champagne Wall', 'Black Champagne Wall.', 18000, cat_bar_counters, '/images/products/black-champagne-wall.jpg', 18000, 10, '[]'::jsonb),
  ('Walnut laminate bar', 'Walnut laminate bar.', 7500, cat_bar_counters, '/images/products/walnut-laminate-bar.jpg', 7500, 10, '[]'::jsonb),
  ('White Formica Bar', 'White Formica Bar.', 7500, cat_bar_counters, '/images/products/white-formica-bar.jpg', 7500, 10, '[]'::jsonb),
  ('Laminate black bar', 'Laminate black bar.', 7500, cat_bar_counters, '/images/products/laminate-black-bar.jpg', 7500, 10, '[]'::jsonb),
  ('GRASS BAR', 'GRASS BAR.', 15000, cat_bar_counters, '/images/products/grass-bar.jpg', 15000, 10, '[]'::jsonb);

  -- Bar Stools
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_bar_stools, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_bar_stools, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_bar_stools, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('LUX GOLD BAR STOOL', 'LUX GOLD BAR STOOL.', 2500, cat_bar_stools, '/images/products/lux-gold-bar-stool.jpg', 2500, 10, '[]'::jsonb),
  ('Stylish Vintage  Barstool 30”Regular', 'Stylish Vintage  Barstool 30”.', 1500, cat_bar_stools, '/images/products/stylish-vintage-barstool-30-regular.jpg', 1500, 10, '[]'::jsonb),
  ('Stylish Vintage  Barstool 24”Regular', 'Stylish Vintage  Barstool 24”.', 1200, cat_bar_stools, '/images/products/stylish-vintage-barstool-24-regular.jpg', 1200, 10, '[]'::jsonb),
  ('LUX SILVER BAR STOOL', 'LUX SILVER BAR STOOL.', 2000, cat_bar_stools, '/images/products/lux-silver-bar-stool.jpg', 2000, 10, '[]'::jsonb),
  ('O Back Gold Bar Stool', 'O Back Gold Bar Stool.', 2500, cat_bar_stools, '/images/products/o-back-gold-bar-stool.jpg', 2500, 10, '[]'::jsonb);

  -- Bar Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_bar_tables, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_bar_tables, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_bar_tables, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('White cocktail', 'White cocktail.', 10000, cat_bar_tables, '/images/products/white-cocktail.jpg', 10000, 10, '[]'::jsonb),
  ('Led Champagne table', 'Led Champagne table.', 5000, cat_bar_tables, '/images/products/led-champagne-table.jpg', 5000, 10, '[]'::jsonb),
  ('Highboy Cocktail Round Spandex Table cover', 'Highboy Cocktail Round Spandex Table cover.', 1350, cat_bar_tables, '/images/products/highboy-cocktail-round-spandex-table-cover.jpg', 1350, 10, '[]'::jsonb),
  ('COCKTAIL TABLES', 'COCKTAIL TABLES.', 1450, cat_bar_tables, '/images/products/cocktail-tables.jpg', 1450, 10, '[]'::jsonb),
  ('Spandex Tablecloth for Cocktail Tables', 'Spandex Tablecloth for Cocktail Tables.', 1350, cat_bar_tables, '/images/products/spandex-tablecloth-for-cocktail-tables.jpg', 1350, 10, '[]'::jsonb),
  ('LED COCKTABLE  TABLE', 'LED COCKTABLE  TABLE.', 3500, cat_bar_tables, '/images/products/led-cocktable-table.jpg', 3500, 10, '[]'::jsonb),
  ('Trisha Bar Table (Silver)', 'Trisha Bar Table (Silver).', 10000, cat_bar_tables, '/images/products/trisha-bar-table-silver.jpg', 10000, 10, '[]'::jsonb),
  ('Trisha Bar Table (Gold)', 'Trisha Bar Table (Gold).', 10000, cat_bar_tables, '/images/products/trisha-bar-table-gold.jpg', 10000, 10, '[]'::jsonb),
  ('Circle Bar Table (Silver)', 'Circle Bar Table (Silver).', 10000, cat_bar_tables, '/images/products/circle-bar-table-silver.jpg', 10000, 10, '[]'::jsonb),
  ('Circle Bar Table (Gold)', 'Circle Bar Table (Gold).', 10000, cat_bar_tables, '/images/products/circle-bar-table-gold.jpg', 10000, 10, '[]'::jsonb);

  -- Cake Tables & Stands
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_cake_tables_stands, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_cake_tables_stands, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_cake_tables_stands, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('White Wagon Cart', 'White Wagon Cart.', 22500, cat_cake_tables_stands, '/images/products/white-wagon-cart.jpg', 22500, 10, '[]'::jsonb),
  ('White Rustic cart', 'White Rustic cart.', 30000, cat_cake_tables_stands, '/images/products/white-rustic-cart.jpg', 30000, 10, '[]'::jsonb),
  ('LED ROSES TABLE', 'LED ROSES TABLE.', 15000, cat_cake_tables_stands, '/images/products/led-roses-table.jpg', 15000, 10, '[]'::jsonb),
  ('Squeeze Me Stand (Blue)', 'Squeeze Me Stand (Blue).', 12500, cat_cake_tables_stands, '/images/products/squeeze-me-stand-blue.jpg', 12500, 10, '[]'::jsonb),
  ('Squeeze Me Stand (Pink)', 'Squeeze Me Stand (Pink).', 12500, cat_cake_tables_stands, '/images/products/squeeze-me-stand-pink.jpg', 12500, 10, '[]'::jsonb),
  ('GIRL Treat Table', 'GIRL Treat Table.', 17500, cat_cake_tables_stands, '/images/products/girl-treat-table.jpg', 17500, 10, '[]'::jsonb),
  ('BOY Treat Table', 'BOY Treat Table.', 15000, cat_cake_tables_stands, '/images/products/boy-treat-table.jpg', 15000, 10, '[]'::jsonb),
  ('Diamond Cake Table (Gold)', 'Diamond Cake Table (Gold).', 16000, cat_cake_tables_stands, '/images/products/diamond-cake-table-gold.jpg', 16000, 10, '[]'::jsonb);

  -- Decorations & Props
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_decorations_props, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_decorations_props, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_decorations_props, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Green Tree', 'Green Tree.', 10000, cat_decorations_props, '/images/products/green-tree.jpg', 10000, 10, '[]'::jsonb),
  ('Trio Wedding Gold Arch', 'Trio Wedding Gold Arch.', 105000, cat_decorations_props, '/images/products/trio-wedding-gold-arch.jpg', 105000, 10, '[]'::jsonb),
  ('Telephone Booth Regular', 'Telephone Booth.', 35000, cat_decorations_props, '/images/products/telephone-booth-regular.jpg', 35000, 10, '[]'::jsonb),
  ('Zebra', 'Zebra.', 12500, cat_decorations_props, '/images/products/zebra.jpg', 12500, 10, '[]'::jsonb),
  ('Giraffe', 'Giraffe.', 22500, cat_decorations_props, '/images/products/giraffe.jpg', 22500, 10, '[]'::jsonb),
  ('Elephant', 'Elephant.', 22500, cat_decorations_props, '/images/products/elephant.jpg', 22500, 10, '[]'::jsonb),
  ('Table Top Elephant', 'Table Top Elephant.', 1000, cat_decorations_props, '/images/products/table-top-elephant.jpg', 1000, 10, '[]'::jsonb),
  ('Table Top Elephant', 'Table Top Elephant.', 1000, cat_decorations_props, '/images/products/table-top-elephant.jpg', 1000, 10, '[]'::jsonb),
  ('Table Top Elephant', 'Table Top Elephant.', 1000, cat_decorations_props, '/images/products/table-top-elephant.jpg', 1000, 10, '[]'::jsonb),
  ('Gold Number Stand', 'Gold Number Stand.', 5000, cat_decorations_props, '/images/products/gold-number-stand.jpg', 5000, 10, '[]'::jsonb);

  -- Chairs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_chairs, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_chairs, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_chairs, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('TRANSLUCENT CHIAVARI CHAIR', 'TRANSLUCENT CHIAVARI CHAIR.', 700, cat_chairs, '/images/products/translucent-chiavari-chair.jpg', 700, 10, '[]'::jsonb),
  ('CLEAR ROUND ELEGANCE', 'CLEAR ROUND ELEGANCE.', 750, cat_chairs, '/images/products/clear-round-elegance.jpg', 750, 10, '[]'::jsonb),
  ('Padded Folding Chair', 'Padded Folding Chair.', 350, cat_chairs, '/images/products/padded-folding-chair.jpg', 350, 10, '[]'::jsonb),
  ('BLACK PADDED CHAIR', 'BLACK PADDED CHAIR.', 350, cat_chairs, '/images/products/black-padded-chair.jpg', 350, 10, '[]'::jsonb),
  ('BLACK CHIAVARI CHAIR', 'BLACK CHIAVARI CHAIR.', 700, cat_chairs, '/images/products/black-chiavari-chair.jpg', 700, 10, '[]'::jsonb),
  ('PRIME PINK  ROYALTY CHAIRRegular', 'PRIME PINK  ROYALTY CHAIR.', 1800, cat_chairs, '/images/products/prime-pink-royalty-chairregular.jpg', 1800, 10, '[]'::jsonb),
  ('White Samsonite Chair', 'White Samsonite Chair.', 250, cat_chairs, '/images/products/white-samsonite-chair.jpg', 250, 10, '[]'::jsonb),
  ('O Back Gold Chair', 'O Back Gold Chair.', 1800, cat_chairs, '/images/products/o-back-gold-chair.jpg', 1800, 10, '[]'::jsonb),
  ('O Back Silver Chair', 'O Back Silver Chair.', 1800, cat_chairs, '/images/products/o-back-silver-chair.jpg', 1800, 10, '[]'::jsonb),
  ('Heart Chair (Gold)Regular', 'Heart Chair (Gold).', 1500, cat_chairs, '/images/products/heart-chair-gold-regular.jpg', 1500, 10, '[]'::jsonb),
  ('Bamboo Chair (Gold)', 'Bamboo Chair (Gold).', 700, cat_chairs, '/images/products/bamboo-chair-gold.jpg', 700, 10, '[]'::jsonb),
  ('Bamboo Chair (Silver)', 'Bamboo Chair (Silver).', 700, cat_chairs, '/images/products/bamboo-chair-silver.jpg', 700, 10, '[]'::jsonb),
  ('Folding Acrylic Chair (Gold)', 'Folding Acrylic Chair (Gold).', 1125, cat_chairs, '/images/products/folding-acrylic-chair-gold.jpg', 1125, 10, '[]'::jsonb);

  -- Sofas & Loveseats
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_sofas_loveseats, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_sofas_loveseats, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_sofas_loveseats, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Wave sofa', 'Wave sofa.', 29000, cat_sofas_loveseats, '/images/products/wave-sofa.jpg', 29000, 10, '[]'::jsonb),
  ('Hendrix Velvet Flared Arm Loveseats', 'Hendrix Velvet Flared Arm Loveseats.', 16000, cat_sofas_loveseats, '/images/products/hendrix-velvet-flared-arm-loveseats.jpg', 16000, 10, '[]'::jsonb),
  ('Lux Sofa', 'Lux Sofa.', 15000, cat_sofas_loveseats, '/images/products/lux-sofa.jpg', 15000, 10, '[]'::jsonb),
  ('Cage sofa Regular', 'Cage sofa.', 27500, cat_sofas_loveseats, '/images/products/cage-sofa-regular.jpg', 27500, 10, '[]'::jsonb),
  ('3 PIECE LUX SETRegular', '3 PIECE LUX SET.', 30000, cat_sofas_loveseats, '/images/products/3-piece-lux-setregular.jpg', 30000, 10, '[]'::jsonb),
  ('Lux Pink sofa', 'Lux Pink sofa.', 20000, cat_sofas_loveseats, '/images/products/lux-pink-sofa.jpg', 20000, 10, '[]'::jsonb),
  ('fancy Royal SofaRegular', 'fancy Royal Sofa.', 29000, cat_sofas_loveseats, '/images/products/fancy-royal-sofaregular.jpg', 29000, 10, '[]'::jsonb),
  ('NUDE SOFA', 'NUDE SOFA.', 20000, cat_sofas_loveseats, '/images/products/nude-sofa.jpg', 20000, 10, '[]'::jsonb),
  ('Chic Sofa (Black)', 'Chic Sofa (Black).', 30000, cat_sofas_loveseats, '/images/products/chic-sofa-black.jpg', 30000, 10, '[]'::jsonb),
  ('White Dotted Throne SofaRegular', 'White Dotted Throne Sofa.', 30000, cat_sofas_loveseats, '/images/products/white-dotted-throne-sofaregular.jpg', 30000, 10, '[]'::jsonb);

  -- Kids Backdrops
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_kids_backdrops, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_kids_backdrops, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_kids_backdrops, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Dreamland Train', 'Dreamland Train.', 42500, cat_kids_backdrops, '/images/products/dreamland-train.jpg', 42500, 10, '[]'::jsonb),
  ('Princess Express Train', 'Princess Express Train.', 42500, cat_kids_backdrops, '/images/products/princess-express-train.jpg', 42500, 10, '[]'::jsonb),
  ('Story Book', 'Story Book.', 27500, cat_kids_backdrops, '/images/products/story-book.jpg', 27500, 10, '[]'::jsonb),
  ('Royal Castle', 'Royal Castle.', 47500, cat_kids_backdrops, '/images/products/royal-castle.jpg', 47500, 10, '[]'::jsonb),
  ('Blast Zone Magic Castle', 'Blast Zone Magic Castle.', 27500, cat_kids_backdrops, '/images/products/blast-zone-magic-castle.jpg', 27500, 10, '[]'::jsonb);

  -- Kids Chairs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_kids_chairs, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_kids_chairs, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_kids_chairs, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Kids Bow Back Chair', 'Kids Bow Back Chair.', 600, cat_kids_chairs, '/images/products/kids-bow-back-chair.jpg', 600, 10, '[]'::jsonb),
  ('kids Chiavari Blue Chair', 'kids Chiavari Blue Chair.', 500, cat_kids_chairs, '/images/products/kids-chiavari-blue-chair.jpg', 500, 10, '[]'::jsonb),
  ('KIDS White Samsonite Chair', 'KIDS White Samsonite Chair.', 225, cat_kids_chairs, '/images/products/kids-white-samsonite-chair.jpg', 225, 10, '[]'::jsonb),
  ('Kids Bamboo Chair (Pink)', 'Kids Bamboo Chair (Pink).', 500, cat_kids_chairs, '/images/products/kids-bamboo-chair-pink.jpg', 500, 10, '[]'::jsonb);

  -- Kids Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_kids_tables, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_kids_tables, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_kids_tables, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('KIDS 6FT TABLE', 'KIDS 6FT TABLE.', 1100, cat_kids_tables, '/images/products/kids-6ft-table.jpg', 1100, 10, '[]'::jsonb);

  -- Kids Thrones
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_kids_thrones, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_kids_thrones, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_kids_thrones, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Kids Bow Back Chair', 'Kids Bow Back Chair.', 600, cat_kids_thrones, '/images/products/kids-bow-back-chair.jpg', 600, 10, '[]'::jsonb),
  ('Kids King Throne Chair (White)', 'Kids King Throne Chair (White).', 12000, cat_kids_thrones, '/images/products/kids-king-throne-chair-white.jpg', 12000, 10, '[]'::jsonb);

  -- LED Signs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_led_signs, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_led_signs, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_led_signs, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Happy Birthday LED Sign', 'Happy Birthday LED Sign.', 7500, cat_led_signs, '/images/products/happy-birthday-led-sign.jpg', 7500, 10, '[]'::jsonb),
  ('Let''s Party LED Sign', 'Let''s Party LED Sign.', 7500, cat_led_signs, '/images/products/let-s-party-led-sign.jpg', 7500, 10, '[]'::jsonb);

  -- Lit Letters & Numbers
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_lit_letters_and_numbers, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_lit_letters_and_numbers, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_lit_letters_and_numbers, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('BABY MARQUEERegular', 'BABY MARQUEE.', 40000, cat_lit_letters_and_numbers, '/images/products/baby-marqueeregular.jpg', 40000, 10, '[]'::jsonb),
  ('OH BABY MARQUEERegular', 'OH BABY MARQUEE.', 60000, cat_lit_letters_and_numbers, '/images/products/oh-baby-marqueeregular.jpg', 60000, 10, '[]'::jsonb),
  ('BLACK MARQUEE NUMBERS', 'BLACK MARQUEE NUMBERS.', 10000, cat_lit_letters_and_numbers, '/images/products/black-marquee-numbers.jpg', 10000, 10, '[]'::jsonb),
  ('MARQUEE LETTER', 'MARQUEE LETTER.', 12500, cat_lit_letters_and_numbers, '/images/products/marquee-letter.jpg', 12500, 10, '[]'::jsonb),
  ('LARGE MARQUEE CROSS WITH LIGHT', 'LARGE MARQUEE CROSS WITH LIGHT.', 12500, cat_lit_letters_and_numbers, '/images/products/large-marquee-cross-with-light.jpg', 12500, 10, '[]'::jsonb),
  ('WHITE MARQUEE NUMBERRegular', 'WHITE MARQUEE NUMBER.', 10000, cat_lit_letters_and_numbers, '/images/products/white-marquee-numberregular.jpg', 10000, 10, '[]'::jsonb);

  -- Luxury Thrones
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_thrones, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_thrones, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_thrones, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Hendrix Velvet Flared Arm Loveseats', 'Hendrix Velvet Flared Arm Loveseats.', 16000, cat_thrones, '/images/products/hendrix-velvet-flared-arm-loveseats.jpg', 16000, 10, '[]'::jsonb),
  ('Gold Dust Throne', 'Gold Dust Throne.', 20000, cat_thrones, '/images/products/gold-dust-throne.jpg', 20000, 10, '[]'::jsonb),
  ('Mid Night Throne', 'Mid Night Throne.', 18000, cat_thrones, '/images/products/mid-night-throne.jpg', 18000, 10, '[]'::jsonb),
  ('Emerald Pearl Throne', 'Emerald Pearl Throne.', 18000, cat_thrones, '/images/products/emerald-pearl-throne.jpg', 18000, 10, '[]'::jsonb),
  ('Silver Pearl ThroneRegular', 'Silver Pearl Throne.', 20000, cat_thrones, '/images/products/silver-pearl-throneregular.jpg', 20000, 10, '[]'::jsonb),
  ('White Peal Throne ChairRegular', 'White Peal Throne Chair.', 20000, cat_thrones, '/images/products/white-peal-throne-chairregular.jpg', 20000, 10, '[]'::jsonb),
  ('Red Throne', 'Red Throne.', 16000, cat_thrones, '/images/products/red-throne.jpg', 16000, 10, '[]'::jsonb),
  ('Kids Velvet Pink Throne', 'Kids Velvet Pink Throne.', 5000, cat_thrones, '/images/products/kids-velvet-pink-throne.jpg', 5000, 10, '[]'::jsonb),
  ('White Princess Throne Sofa ChairRegular', 'White Princess Throne Sofa Chair.', 18000, cat_thrones, '/images/products/white-princess-throne-sofa-chairregular.jpg', 18000, 10, '[]'::jsonb),
  ('King Throne sofa chairRegular', 'King Throne sofa chair.', 20000, cat_thrones, '/images/products/king-throne-sofa-chairregular.jpg', 20000, 10, '[]'::jsonb),
  ('Cassie Loveseat (Gold)', 'Cassie Loveseat (Gold).', 29000, cat_thrones, '/images/products/cassie-loveseat-gold.jpg', 29000, 10, '[]'::jsonb),
  ('Cage Gold Chair (White Cushion)Regular', 'Cage Gold Chair (White Cushion).', 17500, cat_thrones, '/images/products/cage-gold-chair-white-cushion-regular.jpg', 17500, 10, '[]'::jsonb),
  ('Cage Gold Chair (Black Cushion)', 'Cage Gold Chair (Black Cushion).', 17500, cat_thrones, '/images/products/cage-gold-chair-black-cushion.jpg', 17500, 10, '[]'::jsonb),
  ('Lux Throne Chair (Black)', 'Lux Throne Chair (Black).', 16000, cat_thrones, '/images/products/lux-throne-chair-black.jpg', 16000, 10, '[]'::jsonb),
  ('Canopy Throne Chair (White)', 'Canopy Throne Chair (White).', 17500, cat_thrones, '/images/products/canopy-throne-chair-white.jpg', 17500, 10, '[]'::jsonb),
  ('Lux Throne Chair (Gold)', 'Lux Throne Chair (Gold).', 17500, cat_thrones, '/images/products/lux-throne-chair-gold.jpg', 17500, 10, '[]'::jsonb),
  ('Lux Throne Chair (Silver)', 'Lux Throne Chair (Silver).', 17500, cat_thrones, '/images/products/lux-throne-chair-silver.jpg', 17500, 10, '[]'::jsonb);

  -- Misc
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('GOLD CHIAVARI CHAIR', 'GOLD CHIAVARI CHAIR.', 700, cat_misc, '/images/products/gold-chiavari-chair.jpg', 700, 10, '[]'::jsonb),
  ('Spandex Light Blue Chair Covers', 'Spandex Light Blue Chair Covers.', 200, cat_misc, '/images/products/spandex-light-blue-chair-covers.jpg', 200, 10, '[]'::jsonb),
  ('Treat wall', 'Treat wall.', 25000, cat_misc, 'https://placehold.co/600x400?text=Treat%20wall', 25000, 10, '[]'::jsonb),
  ('Table Napkin (Baby Blue)', 'Complete the look of your special day with our 100% Polyester (spun to look and feel like satin) 𝑻𝒂𝒃𝒍𝒆 𝑵𝒂𝒑𝒌𝒊𝒏 with a hemmed edge.
Size: Approx. 20"x20" square
More than 20 colors to choose from!', 250, cat_misc, '/images/products/table-napkin-baby-blue.jpg', 250, 10, '[]'::jsonb),
  ('Acrylic Stage 8''x 8''', 'Smooth & sturdy enough for dancingTranslucent platform allows light to pass throughOptional sound-activated LED light strip', 57500, cat_misc, '/images/products/acrylic-stage-8-x-8.jpg', 57500, 10, '[]'::jsonb),
  ('Chamberlain 3 pcs', 'Chamberlain 3 pcs.', 22500, cat_misc, '/images/products/chamberlain-3-pcs.jpg', 22500, 10, '[]'::jsonb),
  ('Ken &  Barbie box', 'Ken &  Barbie box.', 22500, cat_misc, '/images/products/ken-barbie-box.jpg', 22500, 10, '[]'::jsonb),
  ('GOLD SHIM SHIM BACKDROP', 'GOLD SHIM SHIM WALL# BALLOONS  NOT INCLUDED #', 22500, cat_misc, '/images/products/gold-shim-shim-backdrop.jpg', 22500, 10, '[]'::jsonb),
  ('Cage Dome  Throne', 'Cage Dome  Throne.', 17000, cat_misc, '/images/products/cage-dome-throne.jpg', 17000, 10, '[]'::jsonb),
  ('BABY LETTER  TABLE', 'BABY LETTER  TABLE.', 20250, cat_misc, '/images/products/baby-letter-table.jpg', 20250, 10, '[]'::jsonb),
  ('Classic Half Size Round Chafer', 'Perfect for use at weddings, buffets, or other catered events, this Choice Classic 5 qt. half size round chafer will provide an elegant display piece for all your foods. The round shape will allow your customers to access the food from any angle while the 5 qt. capacity will keep all your foods in stock. Complete with a polished finish, this chafer will add to the presentation value of the foods you are offering.', 2500, cat_misc, '/images/products/classic-half-size-round-chafer.jpg', 2500, 10, '[]'::jsonb),
  ('Clear Beaded Chargers', 'Clear Beaded Chargers.', 399, cat_misc, '/images/products/clear-beaded-chargers.jpg', 399, 10, '[]'::jsonb),
  ('MENU', 'MENU.', 300, cat_misc, '/images/products/menu.jpg', 300, 10, '[]'::jsonb),
  ('BIRTHDAY PACKAGE', 'PERSONALIZED NAME PEDESTAL, BALLOON GARLAND, MARQUEE # (balloon color choice)', 61200, cat_misc, '/images/products/birthday-package.jpg', 61200, 10, '[]'::jsonb),
  ('Mega Set Arch & Stage', 'Arch measurements 8ft H by 112in LStages measurements 81in W. x 114in L.', 95000, cat_misc, '/images/products/mega-set-arch-stage.jpg', 95000, 10, '[]'::jsonb),
  ('GREEN WALL N BALLOON PACKAGE', 'BALLOONS GARLAND THRONE PEDESTAL W/DECAL', 79650, cat_misc, '/images/products/green-wall-n-balloon-package.jpg', 79650, 10, '[]'::jsonb),
  ('Artificial Fluffy Tree', '5.7'' Tall | Ivory |', 7500, cat_misc, '/images/products/artificial-fluffy-tree.jpg', 7500, 10, '[]'::jsonb),
  ('White photo frame', 'White photo frame.', 15000, cat_misc, '/images/products/white-photo-frame.jpg', 15000, 10, '[]'::jsonb),
  ('Pink Columns', 'Pink Columns.', 20000, cat_misc, '/images/products/pink-columns.jpg', 20000, 10, '[]'::jsonb),
  ('KIDS WHITE Chiavari  Chair', 'KIDS WHITE Chiavari  Chair.', 500, cat_misc, '/images/products/kids-white-chiavari-chair.jpg', 500, 10, '[]'::jsonb),
  ('LED Cube', 'LED Cube.', 2000, cat_misc, '/images/products/led-cube.jpg', 2000, 10, '[]'::jsonb),
  ('Purple Columns', 'Purple Columns.', 20000, cat_misc, '/images/products/purple-columns.jpg', 20000, 10, '[]'::jsonb),
  ('3 PCS GOLD FLOWER BACKDROP W/TABLE', '3 PCS GOLD FLOWER BACKDROP W/TABLE.', 67500, cat_misc, '/images/products/3-pcs-gold-flower-backdrop-w-table.jpg', 67500, 10, '[]'::jsonb),
  ('Pure white Stage 8x8', 'Pure white Stage 8x8.', 80000, cat_misc, '/images/products/pure-white-stage-8x8.jpg', 80000, 10, '[]'::jsonb),
  ('Kissing ball', 'Kissing ball only', 1000, cat_misc, '/images/products/kissing-ball.jpg', 1000, 10, '[]'::jsonb),
  ('The INDY 3 Station', 'The INDY 3 Station.', 180000, cat_misc, '/images/products/the-indy-3-station.jpg', 180000, 10, '[]'::jsonb),
  ('Table Napkin (Willow Green)', 'Complete the look of your special day with our 100% Polyester (spun to look and feel like satin) 𝑻𝒂𝒃𝒍𝒆 𝑵𝒂𝒑𝒌𝒊𝒏 with a hemmed edge.
Size: Approx. 20"x20" square
More than 20 colors to choose from!', 250, cat_misc, '/images/products/table-napkin-willow-green.jpg', 250, 10, '[]'::jsonb),
  ('MOIEA FLORAL WEDDING DESIGN', 'CHOOSE YOUR COLOR', 87500, cat_misc, '/images/products/moiea-floral-wedding-design.jpg', 87500, 10, '[]'::jsonb),
  ('Bestie baby Thone', 'Bestie baby Thone.', 7500, cat_misc, '/images/products/bestie-baby-thone.jpg', 7500, 10, '[]'::jsonb),
  ('SILVER CLASSIC THRONE', 'SILVER CLASSIC THRONE.', 10000, cat_misc, '/images/products/silver-classic-throne.jpg', 10000, 10, '[]'::jsonb),
  ('KIDDIES FRESH FLOWER W/VASE', 'KIDDIES FRESH FLOWER W/VASE.', 3000, cat_misc, '/images/products/kiddies-fresh-flower-w-vase.jpg', 3000, 10, '[]'::jsonb),
  ('Rustic Solid Pine Folding Farm Table', 'This Rustic Solid Pine Folding Farm Table is perfect for adding a touch of rustic charm to any event. It is made from solid pine wood and finished with a light stain for a unique, vintage look. The table is easy to set up and fold away, making it ideal for use at outdoor events or for storage in between uses. The table is strong and sturdy and can accommodate up to 10 people. Make your next party unforgettable with this beautiful Rustic Solid Pine Folding Farm Table.', 22500, cat_misc, '/images/products/rustic-solid-pine-folding-farm-table.jpg', 22500, 10, '[]'::jsonb),
  ('Podium', 'Podium.', 7500, cat_misc, '/images/products/podium.jpg', 7500, 10, '[]'::jsonb),
  ('Tumblers 10 oz', 'Tumblers 10 oz.', 105, cat_misc, '/images/products/tumblers-10-oz.jpg', 105, 10, '[]'::jsonb),
  ('Crate pedestal', 'Crate pedestal.', 12500, cat_misc, '/images/products/crate-pedestal.jpg', 12500, 10, '[]'::jsonb),
  ('Led table', 'Led table.', 3500, cat_misc, '/images/products/led-table.jpg', 3500, 10, '[]'::jsonb),
  ('The Selfie 2 Station', 'The Selfie 2 Station.', 170000, cat_misc, '/images/products/the-selfie-2-station.jpg', 170000, 10, '[]'::jsonb),
  ('Chair Cushion', 'Chair Cushion.', 200, cat_misc, '/images/products/chair-cushion.jpg', 200, 10, '[]'::jsonb),
  ('Chloe''s arch', 'Chloe''s arch.', 25000, cat_misc, '/images/products/chloe-s-arch.jpg', 25000, 10, '[]'::jsonb),
  ('Copper Mule  Mugs', 'Copper Mule  Mugs.', 350, cat_misc, '/images/products/copper-mule-mugs.jpg', 350, 10, '[]'::jsonb),
  ('Mother 2 B Area', 'Color Choice of2 Arch Wall2 Half WallWall DecalOrganic Balloon GarlandTheme AcessoriesLux Sofa3 PedestalRug', 180000, cat_misc, '/images/products/mother-2-b-area.jpg', 180000, 10, '[]'::jsonb),
  ('Lux Bubble Acrylic Wall Backdrop', 'Price is for each wall', 35000, cat_misc, '/images/products/lux-bubble-acrylic-wall-backdrop.jpg', 35000, 10, '[]'::jsonb),
  ('Abstract Wall', 'Abstract Wall.', 37500, cat_misc, '/images/products/abstract-wall.jpg', 37500, 10, '[]'::jsonb),
  ('PONYTAIL BACKDROP', 'CHOOSE YOUR COLOR', 22500, cat_misc, '/images/products/ponytail-backdrop.jpg', 22500, 10, '[]'::jsonb),
  ('SKYLINE BACKDROP', 'SKYLINE BACKDROP.', 20000, cat_misc, '/images/products/skyline-backdrop.jpg', 20000, 10, '[]'::jsonb),
  ('CIRCLE TIME BACKDROP', 'GOLD & BLACK and TABLE', 32500, cat_misc, '/images/products/circle-time-backdrop.jpg', 32500, 10, '[]'::jsonb),
  ('Miami Tree', 'Miami Tree.', 12500, cat_misc, '/images/products/miami-tree.jpg', 12500, 10, '[]'::jsonb),
  ('Spandex Royal Blue Chair Cover', 'Spandex Royal Blue Chair Cover.', 200, cat_misc, '/images/products/spandex-royal-blue-chair-cover.jpg', 200, 10, '[]'::jsonb),
  ('Lux Cocktail Table', 'Lux Cocktail Table.', 12793, cat_misc, '/images/products/lux-cocktail-table.jpg', 12793, 10, '[]'::jsonb),
  ('FRESH FLORAL W/VASE', 'FRESH FLORAL W/VASE.', 7500, cat_misc, '/images/products/fresh-floral-w-vase.jpg', 7500, 10, '[]'::jsonb),
  ('Single Velvet Lux', 'Single Velvet Lux.', 7500, cat_misc, '/images/products/single-velvet-lux.jpg', 7500, 10, '[]'::jsonb),
  ('Natural Wall and Balloon BACKDROP', 'wall Balloon Garland one side (color choice)', 58000, cat_misc, '/images/products/natural-wall-and-balloon-backdrop.jpg', 58000, 10, '[]'::jsonb),
  ('Pearl queen bench', 'Pearl queen bench.', 24000, cat_misc, '/images/products/pearl-queen-bench.jpg', 24000, 10, '[]'::jsonb),
  ('GUEST TABLE SETTINGS', 'Setting for Up to 20 guest, chiavari chair, tables,chargers plates,dinner plates, napkins,cups,utensils and centerpieces ( color choice)', 49400, cat_misc, '/images/products/guest-table-settings.jpg', 49400, 10, '[]'::jsonb),
  ('Spandex Metallic Gold & White Chair Covers', 'Spandex Metallic Gold & White Chair Covers.', 250, cat_misc, '/images/products/spandex-metallic-gold-white-chair-covers.jpg', 250, 10, '[]'::jsonb),
  ('Acura Blue Package', 'Items included in package:3 Acura Blue WallBalloon GarlandGold Pedestal', 67500, cat_misc, '/images/products/acura-blue-package.jpg', 67500, 10, '[]'::jsonb),
  ('Marley 3D Open Arch', '8x8', 35000, cat_misc, '/images/products/marley-3d-open-arch.jpg', 35000, 10, '[]'::jsonb),
  ('Green Columns', 'Green Columns.', 20000, cat_misc, '/images/products/green-columns.jpg', 20000, 10, '[]'::jsonb),
  ('Gold Cake Stand', 'Gold Cake Stand.', 5000, cat_misc, '/images/products/gold-cake-stand.jpg', 5000, 10, '[]'::jsonb),
  ('Butter Arch', 'decor not included', 35000, cat_misc, '/images/products/butter-arch.jpg', 35000, 10, '[]'::jsonb),
  ('KIDS CHARACTERS DECOR', '1 Bbackdrop and 3 pedestals', 45000, cat_misc, '/images/products/kids-characters-decor.jpg', 45000, 10, '[]'::jsonb),
  ('6 BURNER STOVE', '6 BURNER STOVE.', 15000, cat_misc, '/images/products/6-burner-stove.jpg', 15000, 10, '[]'::jsonb),
  ('Crisscross Backdrop', 'Crisscross Backdrop adds glamour and a touch of grandeur style to your event. With a shiny gold coating and bars across, this panel has a beauty of its own. For a personalized look, pair it with custom signage, flowers, a string of lights, balloons, and photos.Dimensions: 6ft tallMaterials: ﻿Stainless SteelInventory: 1', 17500, cat_misc, '/images/products/crisscross-backdrop.jpg', 17500, 10, '[]'::jsonb),
  ('Trendy Kids throne', 'Trendy Kids throne.', 7500, cat_misc, '/images/products/trendy-kids-throne.jpg', 7500, 10, '[]'::jsonb),
  ('Ghost pedestal', 'Ghost pedestal.', 25000, cat_misc, '/images/products/ghost-pedestal.jpg', 25000, 10, '[]'::jsonb),
  ('Gold Bead Acrylic Chargers', 'Stylish & ElegantAdd elegance and style to any tablescape and give an enhanced and neat look to your special and traditional dishes with our Beaded Clear Plastic Charger Plates.', 495, cat_misc, '/images/products/gold-bead-acrylic-chargers.jpg', 495, 10, '[]'::jsonb),
  ('Arc Stands', 'This 2 Arc Stands provides amazing opportunities to decorate for a wedding sweetheart area, celebrant stage area, or ceremony area or even as a seating chart display!

Dimensions: 48 x 79" each stand

Materials: Stainless Steel

Inventory: 1', 15000, cat_misc, '/images/products/arc-stands.jpg', 15000, 10, '[]'::jsonb),
  ('MOI BLACK VELVET', 'MOI BLACK VELVET.', 10000, cat_misc, '/images/products/moi-black-velvet.jpg', 10000, 10, '[]'::jsonb),
  ('Plastic Carafe 1 liter', 'Plastic Carafe 1 liter.', 500, cat_misc, '/images/products/plastic-carafe-1-liter.jpg', 500, 10, '[]'::jsonb),
  ('PRIME GOLD  ROYALTY CHAIR', 'PRIME GOLD  ROYALTY CHAIR.', 1440, cat_misc, '/images/products/prime-gold-royalty-chair.jpg', 1440, 10, '[]'::jsonb),
  ('Open Arch', 'The Open Arch is a beautiful and elegant addition to any special event! It is spacious enough to accommodate a variety of decorations, from florals to balloons and more. The arch is made of durable and lightweight materials, making it easy to set up and take down. The Open Arch is sure to add a touch of sophistication to any event, no matter the occasion. With a range of colors to choose from, you can easily find the perfect arch to match your event theme. Let the Open Arch be the perfect backdrop for your next gathering 1 pcs arch included', 12500, cat_misc, '/images/products/open-arch.jpg', 12500, 10, '[]'::jsonb),
  ('Elite Dripless Rectangular Chafer with Gold', 'Elite Dripless Rectangular Chafer with Gold.', 4500, cat_misc, '/images/products/elite-dripless-rectangular-chafer-with-gold.jpg', 4500, 10, '[]'::jsonb),
  ('WHITE QUEEN SOFA FOR WEDDING', 'I''m a product description. I’m a great place to include more information about your product. Buyers like to know what they’re getting before they purchase.', 24000, cat_misc, '/images/products/white-queen-sofa-for-wedding.jpg', 24000, 10, '[]'::jsonb),
  ('Black Dome', 'Black Dome.', 13125, cat_misc, '/images/products/black-dome.jpg', 13125, 10, '[]'::jsonb),
  ('CURVE ARCHWAY', 'Curve ArchwayMaterial: WoodDimensions: 84”H X 48”WArches are custom painted to the client’s specification. Color change fee applies per color needed.', 17500, cat_misc, '/images/products/curve-archway.jpg', 17500, 10, '[]'::jsonb),
  ('Gold  Tunnel Arch', 'Tunnel  arch 7 feet high 4 feet wide', 25000, cat_misc, '/images/products/gold-tunnel-arch.jpg', 25000, 10, '[]'::jsonb),
  ('Char Griller', 'Char Griller.', 12500, cat_misc, '/images/products/char-griller.jpg', 12500, 10, '[]'::jsonb),
  ('PRIME EMS  ROYALTY CHAIR', 'PRIME EMS  ROYALTY CHAIR.', 1440, cat_misc, '/images/products/prime-ems-royalty-chair.jpg', 1440, 10, '[]'::jsonb),
  ('KING AND QUEEN PACKAGE', '2 CHAIR, BACKDROP, PEDESTAL,RUG,PILLOWS, 2 CHANDELIER STANDS(choose your color choice)', 88650, cat_misc, '/images/products/king-and-queen-package.jpg', 88650, 10, '[]'::jsonb),
  ('Deluxe 4 Qt. Round Gold Accent Chafer', 'Other Available Sizes:
4 qt.
8 qt.
14 qt.

Durable stainless steel with mirror finish
Round shape for 360 degree serving
Elegant gold details
Half-circle lid handle for secure gripping
Two side handles for easy transportation
Fuel can holder ensures patron and staff safety
Water pan, food pan, cover, frame, and fuel holders included', 1500, cat_misc, '/images/products/deluxe-4-qt-round-gold-accent-chafer.jpg', 1500, 10, '[]'::jsonb),
  ('BLACK SHIMMY WALL BACKDROP', 'SHIMMY WALL ONLY', 22500, cat_misc, '/images/products/black-shimmy-wall-backdrop.jpg', 22500, 10, '[]'::jsonb),
  ('Heart Of Love Backdrop', 'PERFECT FOR WEDDING BACKDROP #HEART ONLY', 27500, cat_misc, '/images/products/heart-of-love-backdrop.jpg', 27500, 10, '[]'::jsonb),
  ('Golden Flower Bomb Backdrop', 'Golden Flower Bomb Backdrop.', 27500, cat_misc, '/images/products/golden-flower-bomb-backdrop.jpg', 27500, 10, '[]'::jsonb),
  ('Deluxe 8 Qt. Full Size Gold Accent Chafer', 'Durable stainless steel with mirror finishUniversal full size chaferElegant gold detailsHalf-circle lid handle for secure grippingTwo side handles for easy transportationTwo fuel can holders ensures patron and staff safetyCover holder clips keep lid propped back', 2500, cat_misc, '/images/products/deluxe-8-qt-full-size-gold-accent-chafer.jpg', 2500, 10, '[]'::jsonb),
  ('BLACK CIRCLE WALL BACKDROP', 'ALL BLACK.......... WALL ONLY', 20000, cat_misc, '/images/products/black-circle-wall-backdrop.jpg', 20000, 10, '[]'::jsonb),
  ('Lux Champagne wall', 'Lux Champagne wall.', 35000, cat_misc, '/images/products/lux-champagne-wall.jpg', 35000, 10, '[]'::jsonb),
  ('360 PHOTO BOOTH', 'WHAT’S INCLUDED:  XL platform that fit upto 4 people Delivery ,setup and BreakdownLed lightingUnlimited  slow Mo High resolution video Custom  overlay and musicPropsiPad sharing stationStations and velvet ropes', 50000, cat_misc, '/images/products/360-photo-booth.jpg', 50000, 10, '[]'::jsonb),
  ('3D Grass Wall BACKDROP', '3D Grass Wall BACKDROP.', 17500, cat_misc, '/images/products/3d-grass-wall-backdrop.jpg', 17500, 10, '[]'::jsonb),
  ('2 seater white Bench', '2 seater white Bench.', 12500, cat_misc, '/images/products/2-seater-white-bench.jpg', 12500, 10, '[]'::jsonb),
  ('COMING 2 AMERICA', '*PERSONALIZED BACKDROP*BALLOON GARLAND*LEXINGTON*RUG*PILLOWS*THRONE(color choice)', 85500, cat_misc, '/images/products/coming-2-america.jpg', 85500, 10, '[]'::jsonb),
  ('GOLD VASE', 'GOLD VASE.', 1800, cat_misc, '/images/products/gold-vase.jpg', 1800, 10, '[]'::jsonb),
  ('Tufted Back - Flat Seat  sofa 3pcs', 'Tufted Back - Flat Seat  sofa 3pcs.', 40000, cat_misc, '/images/products/tufted-back-flat-seat-sofa-3pcs.jpg', 40000, 10, '[]'::jsonb),
  ('Light pink rug', 'Light pink rug.', 4000, cat_misc, '/images/products/light-pink-rug.jpg', 4000, 10, '[]'::jsonb),
  ('DOTS TABLECLOTH', 'DOTS TABLECLOTH.', 0, cat_misc, '/images/products/dots-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('Dance Floor 3x3', 'This Dance Floor is the perfect way to turn any event into a party! It measures 16'' x 16'' and can accommodate up to 50 guests, giving everyone plenty of space to move and groove. The black and white checkered design is classic and timeless, making it ideal for weddings and other formal events. Our durable Dance Floor is easy to install, with a low-maintenance design that won''t require any extra care. Let the good times roll with this must-have party rental', 3200, cat_misc, '/images/products/dance-floor-3x3.jpg', 3200, 10, '[]'::jsonb),
  ('QuickLock Staging 8''x8'' Indoor/Outdoor Stage System', 'QuickLock Staging 8''x8'' Indoor/Outdoor Stage System.', 45000, cat_misc, '/images/products/quicklock-staging-8-x8-indoor-outdoor-stage-system.jpg', 45000, 10, '[]'::jsonb),
  ('Infinity dinning chair', 'Infinity dinning chair.', 1800, cat_misc, '/images/products/infinity-dinning-chair.jpg', 1800, 10, '[]'::jsonb),
  ('Patio Heater', 'Patio Heater.', 12500, cat_misc, '/images/products/patio-heater.jpg', 12500, 10, '[]'::jsonb),
  ('SIDE PART BACKDROP', 'CHOOSE YOUR COLOR', 25000, cat_misc, '/images/products/side-part-backdrop.jpg', 25000, 10, '[]'::jsonb),
  ('Excape throne', 'Excape throne.', 14875, cat_misc, '/images/products/excape-throne.jpg', 14875, 10, '[]'::jsonb),
  ('Macy Stand', 'This Macy Stand is a gold panel that can be decorated easily with flowers or any decoration piece. It may also be used as a frame for the celebrant''s picture.   


Dimensions: 150 x 200 cm | Inside of Frame: 42 x 71"

Materials: Stainless Steel

Inventory: 2', 20000, cat_misc, '/images/products/macy-stand.jpg', 20000, 10, '[]'::jsonb),
  ('White China Rim', 'White China Rim.', 55, cat_misc, '/images/products/white-china-rim.jpg', 55, 10, '[]'::jsonb),
  ('Circle Winter Wonderland Arch Backdrop', 'Circle Winter Wonderland Arch Backdrop.', 19500, cat_misc, '/images/products/circle-winter-wonderland-arch-backdrop.jpg', 19500, 10, '[]'::jsonb),
  ('Good life Mirror Polished Gold Silverware', 'Good life Mirror Polished Gold Silverware.', 350, cat_misc, '/images/products/good-life-mirror-polished-gold-silverware.jpg', 350, 10, '[]'::jsonb),
  ('Acrylic Wall (White)', 'Prettify your event with a glossy circular backdrop stand  - Acrylic Wall (White).   Pair it with a fab balloon garland, floral arrangements, signs, and/or add pedestals to spice it up!
 Dimensions: 6ft tallMaterials: ﻿AcrylicInventory: 1', 25000, cat_misc, '/images/products/acrylic-wall-white.jpg', 25000, 10, '[]'::jsonb),
  ('BABY BLOCKS', 'BABY BLOCKS.', 10000, cat_misc, '/images/products/baby-blocks.jpg', 10000, 10, '[]'::jsonb),
  ('SILVER SHIMMY BACKDROP', 'Shimmy Shimmy Wall and 3 Pedestal', 35000, cat_misc, '/images/products/silver-shimmy-backdrop.jpg', 35000, 10, '[]'::jsonb),
  ('Hot Air Balloon', 'Hot Air Balloon.', 12500, cat_misc, '/images/products/hot-air-balloon.jpg', 12500, 10, '[]'::jsonb),
  ('🌸 La Belle Façade', '🌸 La Belle FaçadeSize: 12 ft wide x 10 ft highStep into the charm of Paris with La Belle Façade, a stunning 12x10 ft backdrop designed to transport your event guests straight to the streets of the City of Light. Featuring classic Parisian storefront details and elegant accents, this backdrop is perfect for weddings, bridal showers, photo shoots, and chic themed parties.', 100000, cat_misc, '/images/products/la-belle-fa-ade.jpg', 100000, 10, '[]'::jsonb),
  ('Glitz Sequin Spandex Chair Band', 'Elevate your chair decor with our Glitz Sequin Spandex Chair Bands!', 125, cat_misc, '/images/products/glitz-sequin-spandex-chair-band.jpg', 125, 10, '[]'::jsonb),
  ('Gold Peal Throne', 'Gold Peal Throne.', 16000, cat_misc, '/images/products/gold-peal-throne.jpg', 16000, 10, '[]'::jsonb),
  ('Barbie Head Shelf', 'Barbie Head Shelf.', 8000, cat_misc, '/images/products/barbie-head-shelf.jpg', 8000, 10, '[]'::jsonb),
  ('Majestic Velvet chair', 'Majestic Velvet chair.', 7500, cat_misc, '/images/products/majestic-velvet-chair.jpg', 7500, 10, '[]'::jsonb),
  ('Classic Bowl Black 6 in', 'Classic Bowl Black 6 in.', 99, cat_misc, '/images/products/classic-bowl-black-6-in.jpg', 99, 10, '[]'::jsonb),
  ('MOI BLACK VELVET', 'MOI BLACK VELVET.', 10000, cat_misc, '/images/products/moi-black-velvet.jpg', 10000, 10, '[]'::jsonb),
  ('White Wine 20 oz', 'White Wine 20 oz.', 135, cat_misc, '/images/products/white-wine-20-oz.jpg', 135, 10, '[]'::jsonb),
  ('PRIME AQUA ROYALTY CHAIR', 'PRIME AQUA ROYALTY CHAIR.', 1440, cat_misc, '/images/products/prime-aqua-royalty-chair.jpg', 1440, 10, '[]'::jsonb),
  ('3 WAY IN CANOPY BACKDROP', 'CHOOSE YOUR COLOR', 87500, cat_misc, '/images/products/3-way-in-canopy-backdrop.jpg', 87500, 10, '[]'::jsonb),
  ('Emerald Sofa', 'Emerald Sofa.', 26000, cat_misc, '/images/products/emerald-sofa.jpg', 26000, 10, '[]'::jsonb),
  ('The VIP Single Stall', 'VIP Standard Features:Solar poweredFlushable toilet w/Teflon sealHeavy-duty auto-off faucetAcrylic-coated metallic ABS sinkAcrylic mirrorLED Interior and exterior "in use" lightCoat hookSwitch mat and latch activated powerProprietary aluminum structural elementsNo wood constructionPolyethylene plastic wallsProprietary roto-cast tanksWeatherproof carpetDurable plastic skidsMade in the U.S.A.﻿Specifications (each unit)Exterior Ht: 91”Int Ht: 79”Width: 48”Depth: 43.5”Weight: 600 lbs.Waste tank: 65GFresh tank: 40GDoor opening: 72″x24”Average number of uses: 125', 90000, cat_misc, '/images/products/the-vip-single-stall.jpg', 90000, 10, '[]'::jsonb),
  ('Glory Day', 'Glory Day.', 57500, cat_misc, '/images/products/glory-day.jpg', 57500, 10, '[]'::jsonb),
  ('Big Barn Wall Backdrop', 'Big Barn Wall Backdrop.', 50000, cat_misc, '/images/products/big-barn-wall-backdrop.jpg', 50000, 10, '[]'::jsonb),
  ('Flowering Dogwood Tree - Pink - 11 Feet Tall x 8 Feet Wide "Sideswept" - Create', 'Weight: 73.40 LBSFeatures: Very Full, Sturdy, Branches BendHeight: 11 FeetWidth: 8 FeetColor Family: Pink,White', 22500, cat_misc, '/images/products/flowering-dogwood-tree-pink-11-feet-tall-x-8-feet-wide-sideswept-create.jpg', 22500, 10, '[]'::jsonb),
  ('Ach Wall', '1 pcs  arch ( customize any color)', 15000, cat_misc, '/images/products/ach-wall.jpg', 15000, 10, '[]'::jsonb),
  ('Chrome Stanchion', '* PER POLE* ROPE NOT INCLUDED', 1500, cat_misc, '/images/products/chrome-stanchion.jpg', 1500, 10, '[]'::jsonb),
  ('Round  Stage 8ft x8ft', 'Round  Stage 8ft x8ft.', 67500, cat_misc, '/images/products/round-stage-8ft-x8ft.jpg', 67500, 10, '[]'::jsonb),
  ('Spandex Banquet Chair Cover', 'Spandex Banquet Chair Cover.', 200, cat_misc, '/images/products/spandex-banquet-chair-cover.jpg', 200, 10, '[]'::jsonb),
  ('LUX TRIANGLE W/FLOWERS', 'LUX TRIANGLE W/FLOWERS.', 8500, cat_misc, 'https://placehold.co/600x400?text=LUX%20TRIANGLE%20W%2FFLOWERS', 8500, 10, '[]'::jsonb),
  ('Closed Back 3D Arch', 'Closed Back 3D Arch.', 42500, cat_misc, '/images/products/closed-back-3d-arch.jpg', 42500, 10, '[]'::jsonb),
  ('KIDS PACKAGE', '*THEME AND COLORS CHOICE*CART*BALLOON GARLAND*KIDS TABLE*10 KIDS CHAIR*PEDESTAL', 77500, cat_misc, '/images/products/kids-package.jpg', 77500, 10, '[]'::jsonb),
  ('Table Napkin (Red)', 'Complete the look of your special day with our 100% Polyester (spun to look and feel like satin) 𝑻𝒂𝒃𝒍𝒆 𝑵𝒂𝒑𝒌𝒊𝒏 with a hemmed edge.
Size: Approx. 20"x20" square
More than 20 colors to choose from!', 250, cat_misc, '/images/products/table-napkin-red.jpg', 250, 10, '[]'::jsonb),
  ('3 Angles', '3 Angles.', 22500, cat_misc, '/images/products/3-angles.jpg', 22500, 10, '[]'::jsonb),
  ('GENDER REVEAL PACKAGE', '*THRONE*FLOWER WALL*COLOR WALL*BALLOON GARLAND*PEDETAL*PILLOWS  *BABY TABLE. (COLORS CHOICE FROM OUR SELECTION)', 158000, cat_misc, '/images/products/gender-reveal-package.jpg', 158000, 10, '[]'::jsonb),
  ('Lux swing', 'Lux swing.', 45000, cat_misc, '/images/products/lux-swing.jpg', 45000, 10, '[]'::jsonb),
  ('Spandex Tablecloths for 6 ft Home Rectangular', 'Spandex Tablecloths for 6 ft Home Rectangular.', 1699, cat_misc, '/images/products/spandex-tablecloths-for-6-ft-home-rectangular.jpg', 1699, 10, '[]'::jsonb),
  ('Renaissance Chafer', 'Renaissance Chafer.', 3000, cat_misc, '/images/products/renaissance-chafer.jpg', 3000, 10, '[]'::jsonb),
  ('Heart Backdrop', 'This Heart Backdrop is an elegant heart-shaped backdrop made of stainless steel. This can be easily decorated with flowers or balloons. Dimensions: 240 x 210 cmMaterials: Stainless SteelInventory: 1', 26000, cat_misc, '/images/products/heart-backdrop.jpg', 26000, 10, '[]'::jsonb),
  ('MEYA', 'MEYA.', 25500, cat_misc, '/images/products/meya.jpg', 25500, 10, '[]'::jsonb),
  ('MIDNIGHT DOUBLE BACKDROP', '(3) PEDESTAL AND BACKDROP', 35000, cat_misc, '/images/products/midnight-double-backdrop.jpg', 35000, 10, '[]'::jsonb),
  ('Silver Beaded Chargers', 'Silver Beaded Chargers.', 399, cat_misc, '/images/products/silver-beaded-chargers.jpg', 399, 10, '[]'::jsonb),
  ('Acrylic Wall (Black)', 'Beautify your event with a glossy circular backdrop stand - Acrylic Wall (Black). Pair it with a fab balloon garland, floral arrangements, signs, and/or add pedestals to spice it up! Dimensions: 6ft tallMaterials: ﻿AcrylicInventory: 1', 25000, cat_misc, '/images/products/acrylic-wall-black.jpg', 25000, 10, '[]'::jsonb),
  ('Lexington Gold HighBoys', 'Lexington Gold HighBoys.', 10000, cat_misc, '/images/products/lexington-gold-highboys.jpg', 10000, 10, '[]'::jsonb),
  ('Elegance  Lux Loveseat', 'Elegance  Lux Loveseat.', 19500, cat_misc, '/images/products/elegance-lux-loveseat.jpg', 19500, 10, '[]'::jsonb),
  ('Store Front', 'Store Front.', 45000, cat_misc, '/images/products/store-front.jpg', 45000, 10, '[]'::jsonb),
  ('Flower Runner (Purple & Pink)', 'Use this Flower Runner (Purple & Pink) to be an accent of elegance to your event. This will definitely beautify your table setting. You can simply put It in the middle of the table, and hang them from a backdrop. Use your creativity to use it as a decoration in any part of your setup!Inventory: 2', 37500, cat_misc, '/images/products/flower-runner-purple-pink.jpg', 37500, 10, '[]'::jsonb),
  ('BABY BLUE COLUMN', 'BABY BLUE COLUMN.', 20000, cat_misc, '/images/products/baby-blue-column.jpg', 20000, 10, '[]'::jsonb),
  ('Lux boho chair', 'Lux boho chair.', 12500, cat_misc, '/images/products/lux-boho-chair.jpg', 12500, 10, '[]'::jsonb),
  ('Table Napkin (Fuchsia)', 'Complete the look of your special day with our 100% Polyester (spun to look and feel like satin) 𝑻𝒂𝒃𝒍𝒆 𝑵𝒂𝒑𝒌𝒊𝒏 with a hemmed edge.
Size: Approx. 20"x20" square
More than 20 colors to choose from!', 250, cat_misc, '/images/products/table-napkin-fuchsia.jpg', 250, 10, '[]'::jsonb),
  ('SILVER CHIAVARI CHAIR', 'SILVER CHIAVARI CHAIR.', 700, cat_misc, '/images/products/silver-chiavari-chair.jpg', 700, 10, '[]'::jsonb),
  ('Sterno Gel Chafing Fuel', 'Sterno 20660 2 Hour Handy Fuel Methanol Gel Chafing Fuel', 100, cat_misc, '/images/products/sterno-gel-chafing-fuel.jpg', 100, 10, '[]'::jsonb),
  ('Stainless Steel Wedding Arch', 'Stainless Steel Wedding Arch.', 17500, cat_misc, '/images/products/stainless-steel-wedding-arch.jpg', 17500, 10, '[]'::jsonb),
  ('Ice Table', 'Ice Table.', 8000, cat_misc, '/images/products/ice-table.jpg', 8000, 10, '[]'::jsonb),
  ('LUXURY LIFE RUNNER', 'LUXURY LIFE RUNNER.', 500, cat_misc, '/images/products/luxury-life-runner.jpg', 500, 10, '[]'::jsonb),
  ('Poly Napkins', 'Poly Napkins.', 125, cat_misc, '/images/products/poly-napkins.jpg', 125, 10, '[]'::jsonb),
  ('Table Napkin (Leopard)', 'Complete the look of your special day with our 100% Polyester (spun to look and feel like satin) 𝑻𝒂𝒃𝒍𝒆 𝑵𝒂𝒑𝒌𝒊𝒏 with a hemmed edge.
Size: Approx. 20"x20" square
More than 20 colors to choose from!', 250, cat_misc, '/images/products/table-napkin-leopard.jpg', 250, 10, '[]'::jsonb),
  ('Gold Ruffle Chargers', 'Gold Ruffle Chargers.', 200, cat_misc, '/images/products/gold-ruffle-chargers.jpg', 200, 10, '[]'::jsonb),
  ('Economy 8 Qt. Full Size Stainless Steel Chafer', 'Economy 8 Qt. Full Size Stainless Steel Chafer.', 1500, cat_misc, '/images/products/economy-8-qt-full-size-stainless-steel-chafer.jpg', 1500, 10, '[]'::jsonb),
  ('Love table', 'Love table.', 20000, cat_misc, '/images/products/love-table.jpg', 20000, 10, '[]'::jsonb),
  ('Food warmer', 'Food warmer.', 4500, cat_misc, '/images/products/food-warmer.jpg', 4500, 10, '[]'::jsonb),
  ('Pocket Arch', 'Pocket  ArchwayMaterial: WoodDimensions: 84”H X 48”WArches are custom painted to the client’s specification. Color change fee applies per color needed.', 32500, cat_misc, '/images/products/pocket-arch.jpg', 32500, 10, '[]'::jsonb),
  ('Natural Backdrop and Balloon', '2 Grass 3D Walls3 Nude WallsOrganic Balloon Garland', 116000, cat_misc, '/images/products/natural-backdrop-and-balloon.jpg', 116000, 10, '[]'::jsonb),
  ('All black pearl', 'All black pearl.', 16000, cat_misc, '/images/products/all-black-pearl.jpg', 16000, 10, '[]'::jsonb),
  ('White Dome Party', 'White Dome Party.', 13125, cat_misc, '/images/products/white-dome-party.jpg', 13125, 10, '[]'::jsonb),
  ('Tiger props', 'Tiger props.', 10000, cat_misc, '/images/products/tiger-props.jpg', 10000, 10, '[]'::jsonb),
  ('Rainbow Arch Wall 7ft x 4ft', 'Rainbow Arch Wall 7ft x 4ft.', 15000, cat_misc, '/images/products/rainbow-arch-wall-7ft-x-4ft.jpg', 15000, 10, '[]'::jsonb),
  ('Blush Columns', 'Blush Columns.', 20000, cat_misc, '/images/products/blush-columns.jpg', 20000, 10, '[]'::jsonb),
  ('Vintage table', 'Vintage table.', 20000, cat_misc, '/images/products/vintage-table.jpg', 20000, 10, '[]'::jsonb),
  ('Led Coffee Table', 'Led Coffee Table.', 3500, cat_misc, '/images/products/led-coffee-table.jpg', 3500, 10, '[]'::jsonb),
  ('Bubble gum  love seat', 'Bubble gum  love seat.', 29000, cat_misc, '/images/products/bubble-gum-love-seat.jpg', 29000, 10, '[]'::jsonb),
  ('Lightning wall', '8x 6', 25000, cat_misc, '/images/products/lightning-wall.jpg', 25000, 10, '[]'::jsonb),
  ('Rose lux sofa', 'Rose lux sofa.', 25000, cat_misc, '/images/products/rose-lux-sofa.jpg', 25000, 10, '[]'::jsonb),
  ('Red Snug sofa', 'Red Snug sofa.', 40000, cat_misc, '/images/products/red-snug-sofa.jpg', 40000, 10, '[]'::jsonb),
  ('Farmhouse Bench', 'Farmhouse Bench.', 3000, cat_misc, '/images/products/farmhouse-bench.jpg', 3000, 10, '[]'::jsonb),
  ('Flower Runner (Purple)', 'Use this Flower Runner (Purple) to be an accent of elegance to your event. This will definitely beautify your table setting. You can simply put it in the middle of the table, and hang them from a backdrop. Use your creativity to use it as a decoration in any part of your setup!Inventory: 10', 12000, cat_misc, '/images/products/flower-runner-purple.jpg', 12000, 10, '[]'::jsonb),
  ('NUDE COLUMNS', 'NUDE COLUMNS.', 20000, cat_misc, '/images/products/nude-columns.jpg', 20000, 10, '[]'::jsonb),
  ('5 White Columns', '5 White Columns.', 19500, cat_misc, '/images/products/5-white-columns.jpg', 19500, 10, '[]'::jsonb),
  ('CIRCLE BACKDROP', 'No flowers included', 9500, cat_misc, '/images/products/circle-backdrop.jpg', 9500, 10, '[]'::jsonb),
  ('PERSONALIZED BACKROP', 'PERSONALIZED BACKROP.', 25000, cat_misc, '/images/products/personalized-backrop.jpg', 25000, 10, '[]'::jsonb),
  ('Full Size Chafer Choice Classic 8 Qt.', '8 qt. full size capacityDurable, corrosion-resistant 18/8 stainless steel with mirror finishWood-looking plastic handlesStylish lid handle for aesthetics and safe access to the foodElevated fuel shelf ensures the heat remains close to the chaferElegant beveled legs for optimum stabilityWater pan, food pan, cover, frame, and fuel holders included', 2500, cat_misc, '/images/products/full-size-chafer-choice-classic-8-qt.jpg', 2500, 10, '[]'::jsonb),
  ('Halo Wall', 'Halo Wall.', 35000, cat_misc, '/images/products/halo-wall.jpg', 35000, 10, '[]'::jsonb),
  ('Lotus Backdrop', 'Lotus Backdrop is a lotus-shaped backdrop, that has a combination of white and gold colors. It is perfect for intimate and romantic celebrations like engagements and weddings.Dimensions: 300 x 240 cmInventory: 1', 32500, cat_misc, '/images/products/lotus-backdrop.jpg', 32500, 10, '[]'::jsonb),
  ('Tunnel walkway (led )', 'Tunnel walkway (led ).', 25000, cat_misc, '/images/products/tunnel-walkway-led.jpg', 25000, 10, '[]'::jsonb),
  ('SILVER CAGE THRONE', 'SILVER CAGE THRONE.', 20625, cat_misc, '/images/products/silver-cage-throne.jpg', 20625, 10, '[]'::jsonb),
  ('Carpet Runners', 'Carpet Runners.', 5000, cat_misc, '/images/products/carpet-runners.jpg', 5000, 10, '[]'::jsonb),
  ('Treat Storefront', 'Treat Storefront.', 45000, cat_misc, '/images/products/treat-storefront.jpg', 45000, 10, '[]'::jsonb),
  ('Farm Table', '60 x 36 x 30 inches', 15000, cat_misc, '/images/products/farm-table.jpg', 15000, 10, '[]'::jsonb),
  ('Spandex Black Chair Covers', 'Spandex Black Chair Covers.', 200, cat_misc, '/images/products/spandex-black-chair-covers.jpg', 200, 10, '[]'::jsonb),
  ('Plain Rose Gold charger', 'Plain Rose Gold charger.', 100, cat_misc, '/images/products/plain-rose-gold-charger.jpg', 100, 10, '[]'::jsonb),
  ('Stacy Backdrop', 'Stacy Backdrop consists of 3 pink panels of similar sizes. Use your creativity to set this up in various ways for your event. You can incorporate balloons, flowers, and other decals.Dimensions: 120 x 220 cm (each)Inventory:', 37500, cat_misc, '/images/products/stacy-backdrop.jpg', 37500, 10, '[]'::jsonb),
  ('Classic throne', 'Classic throne.', 10000, cat_misc, '/images/products/classic-throne.jpg', 10000, 10, '[]'::jsonb),
  ('Hendrix 52" Velvet Flared Arm Loveseat', 'Hendrix 52" Velvet Flared Arm Loveseat', 20000, cat_misc, '/images/products/hendrix-52-velvet-flared-arm-loveseat.jpg', 20000, 10, '[]'::jsonb),
  ('FLOWER FRESH W/VASE', 'FLOWER FRESH W/VASE.', 6500, cat_misc, '/images/products/flower-fresh-w-vase.jpg', 6500, 10, '[]'::jsonb),
  ('FIVE TOP CRYSTAL', 'FIVE TOP CRYSTAL.', 3000, cat_misc, '/images/products/five-top-crystal.jpg', 3000, 10, '[]'::jsonb),
  ('MOI PINK VELVET', 'MOI PINK VELVET.', 10000, cat_misc, '/images/products/moi-pink-velvet.jpg', 10000, 10, '[]'::jsonb),
  ('Pink Elegance Loveseat', 'Pink Elegance Loveseat.', 19500, cat_misc, '/images/products/pink-elegance-loveseat.jpg', 19500, 10, '[]'::jsonb),
  ('Plain Silver Chargers', 'Plain Silver Chargers.', 100, cat_misc, '/images/products/plain-silver-chargers.jpg', 100, 10, '[]'::jsonb),
  ('Flower Wall (Blue)', 'The Flower Wall (Blue) is a stand-alone backdrop that is sure to be a perfect spot for photo opting for your event!
This Flower Wall has matching Flower Runners & Flower Balls
Dimensions: 8ft (W) x 8ft (H)Materials:  High-Quality Faux FlowersInventory: 1', 25000, cat_misc, '/images/products/flower-wall-blue.jpg', 25000, 10, '[]'::jsonb),
  ('Bamboo Loveseat', 'If you are aiming to have a modern and dramatic twist on the traditional loveseat used during events, then the Bamboo Loveseat is the perfect sofa that will surely turn heads at your party. It has a white velvet cushion, gold polished, and reflective frame finish which can seat 3 adults.Dimension: 64” W x 24” Depth x 52” HInventory: 2 pcs for White Cushion and 1 pc on the rest of the cushion colors', 22500, cat_misc, '/images/products/bamboo-loveseat.jpg', 22500, 10, '[]'::jsonb),
  ('CLASSIC FOUR BACKDROP', 'CHOOSE YOUR COLOR', 30000, cat_misc, '/images/products/classic-four-backdrop.jpg', 30000, 10, '[]'::jsonb),
  ('Flower Wall Backdrop', 'Flower Wall Backdrop.', 25000, cat_misc, '/images/products/flower-wall-backdrop.jpg', 25000, 10, '[]'::jsonb),
  ('LUX CAKE TABLE', 'LUX CAKE TABLE.', 12500, cat_misc, '/images/products/lux-cake-table.jpg', 12500, 10, '[]'::jsonb),
  ('cold sparkler fountain', 'cold sparkler fountain.', 35000, cat_misc, '/images/products/cold-sparkler-fountain.jpg', 35000, 10, '[]'::jsonb),
  ('Lux mirror  swing', 'Lux mirror  swing.', 45000, cat_misc, '/images/products/lux-mirror-swing.jpg', 45000, 10, '[]'::jsonb),
  ('Triangle Treats wall', 'Triangle Treats wall.', 17500, cat_misc, '/images/products/triangle-treats-wall.jpg', 17500, 10, '[]'::jsonb),
  ('Magazine Photo Box', '8x8 magazine photo box', 80000, cat_misc, '/images/products/magazine-photo-box.jpg', 80000, 10, '[]'::jsonb),
  ('PRIME WHITE  ROYALTY CHAIR', 'PRIME WHITE  ROYALTY CHAIR.', 1440, cat_misc, '/images/products/prime-white-royalty-chair.jpg', 1440, 10, '[]'::jsonb),
  ('Grass Wall', 'Grass Wall.', 20000, cat_misc, '/images/products/grass-wall.jpg', 20000, 10, '[]'::jsonb),
  ('Wedding cross', 'Wedding cross.', 12500, cat_misc, '/images/products/wedding-cross.jpg', 12500, 10, '[]'::jsonb),
  ('3 WAY BACKDROP', 'CHOOSE YOUR COLOR', 25000, cat_misc, '/images/products/3-way-backdrop.jpg', 25000, 10, '[]'::jsonb),
  ('Sweet Lux Station 4ft', 'Sweet Lux Station 4ft.', 47500, cat_misc, '/images/products/sweet-lux-station-4ft.jpg', 47500, 10, '[]'::jsonb),
  ('Kids Table ( 4ft )', 'Kids Table ( 4ft ).', 1000, cat_misc, '/images/products/kids-table-4ft.jpg', 1000, 10, '[]'::jsonb),
  ('Lotus flower ( Changing light )', 'price is per section,if 2 pieces is needed add 2 to cart', 17500, cat_misc, '/images/products/lotus-flower-changing-light.jpg', 17500, 10, '[]'::jsonb),
  ('Ripple Arch Wall (Blue)', 'Ripple Arch Wall (Blue).', 45000, cat_misc, '/images/products/ripple-arch-wall-blue.jpg', 45000, 10, '[]'::jsonb),
  ('Back drop poles', 'Back drop poles.', 7500, cat_misc, '/images/products/back-drop-poles.jpg', 7500, 10, '[]'::jsonb),
  ('Lounge Circles', 'Lounge Circles.', 6500, cat_misc, '/images/products/lounge-circles.jpg', 6500, 10, '[]'::jsonb),
  ('Single Angle', 'Single Angle.', 7500, cat_misc, '/images/products/single-angle.jpg', 7500, 10, '[]'::jsonb),
  ('Table Napkin (Ivory)', 'Complete the look of your special day with our 100% Polyester (spun to look and feel like satin) 𝑻𝒂𝒃𝒍𝒆 𝑵𝒂𝒑𝒌𝒊𝒏 with a hemmed edge.
Size: Approx. 20"x20" square
More than 20 colors to choose from!', 250, cat_misc, '/images/products/table-napkin-ivory.jpg', 250, 10, '[]'::jsonb),
  ('PRIME LAV ROYALTY CHAIR', 'PRIME LAV ROYALTY CHAIR.', 1440, cat_misc, '/images/products/prime-lav-royalty-chair.jpg', 1440, 10, '[]'::jsonb),
  ('EARTH TONE', 'EARTH TONE.', 47500, cat_misc, '/images/products/earth-tone.jpg', 47500, 10, '[]'::jsonb),
  ('Lux affair', 'Lux affair.', 120000, cat_misc, '/images/products/lux-affair.jpg', 120000, 10, '[]'::jsonb),
  ('Snow White table', 'Snow White table.', 15000, cat_misc, '/images/products/snow-white-table.jpg', 15000, 10, '[]'::jsonb),
  ('KIDS THRONE', 'GOLD N WHITESILVER N WHITEROYAL BLUE N GOLD', 7500, cat_misc, '/images/products/kids-throne.jpg', 7500, 10, '[]'::jsonb),
  ('Lexington mini', 'Lexington mini.', 5000, cat_misc, '/images/products/lexington-mini.jpg', 5000, 10, '[]'::jsonb),
  ('OLD FASHION HAGING BACKDROP', 'CHOOSE YOUR COLOR', 17500, cat_misc, '/images/products/old-fashion-haging-backdrop.jpg', 17500, 10, '[]'::jsonb),
  ('Elegance  Folding Chairs', 'Elegance  Folding Chairs.', 1400, cat_misc, '/images/products/elegance-folding-chairs.jpg', 1400, 10, '[]'::jsonb),
  ('Champagne Arch', 'Champagne Arch.', 45000, cat_misc, '/images/products/champagne-arch.jpg', 45000, 10, '[]'::jsonb),
  ('Oval wedding Bench', 'Oval wedding Bench.', 22500, cat_misc, '/images/products/oval-wedding-bench.jpg', 22500, 10, '[]'::jsonb),
  ('THE CURVE THRONE', 'THE CURVE THRONE.', 22500, cat_misc, '/images/products/the-curve-throne.jpg', 22500, 10, '[]'::jsonb),
  ('Marci Backdrop', 'Marci Backdrop has a combination of pink and white panels with gold accents. This backdrop is perfect for your upcoming event. Decorate it with balloons, flowers, or any event prop.


 Dimensions:620 x 200 cm (All together)

Inventory: 1', 25000, cat_misc, '/images/products/marci-backdrop.jpg', 25000, 10, '[]'::jsonb),
  ('Kids trendy Table packages', 'Here is our lovely kids setup tablepadded chairchargesnapkins table runnerforal centepeice', 45000, cat_misc, '/images/products/kids-trendy-table-packages.jpg', 45000, 10, '[]'::jsonb),
  ('Solo Sections ( set of 3 )', 'per set (3pcs)', 15750, cat_misc, '/images/products/solo-sections-set-of-3.jpg', 15750, 10, '[]'::jsonb),
  ('Spandex Pink Chair Covers', 'Spandex Pink Chair Covers.', 200, cat_misc, '/images/products/spandex-pink-chair-covers.jpg', 200, 10, '[]'::jsonb),
  ('REEF CHARGER', 'REEF CHARGER.', 699, cat_misc, '/images/products/reef-charger.jpg', 699, 10, '[]'::jsonb),
  ('Ice cream props', 'Ice cream props.', 8000, cat_misc, '/images/products/ice-cream-props.jpg', 8000, 10, '[]'::jsonb),
  ('3D Letters', '3D Letters.', 5000, cat_misc, '/images/products/3d-letters.jpg', 5000, 10, '[]'::jsonb),
  ('SWEET 16 PACKAGE', '*SINGLE THRONE*BACKDROP DECAL*BALLOON GARLAND*MARQUEE*PEDESTAL  .(color/theme choice)', 104400, cat_misc, '/images/products/sweet-16-package.jpg', 104400, 10, '[]'::jsonb),
  ('The Royal Pour', '🌟 Perfect For:•Signature cocktail stations•Champagne or wine displays•Brand activations•VIP & lounge experiences•Luxury weddings or corporate mixers', 25000, cat_misc, '/images/products/the-royal-pour.jpg', 25000, 10, '[]'::jsonb),
  ('Cotton Nakins', 'Cotton Nakins.', 400, cat_misc, '/images/products/cotton-nakins.jpg', 400, 10, '[]'::jsonb),
  ('Plain Gold Chargers', 'Plain Gold Chargers.', 100, cat_misc, '/images/products/plain-gold-chargers.jpg', 100, 10, '[]'::jsonb),
  ('Led Cloud  6x6', 'Led Cloud  6x6.', 15000, cat_misc, '/images/products/led-cloud-6x6.jpg', 15000, 10, '[]'::jsonb),
  ('Barbie Ready', 'Barbie Ready.', 57500, cat_misc, '/images/products/barbie-ready.jpg', 57500, 10, '[]'::jsonb),
  ('The Majestic Backdrop', '👑 The Majestic BackdropSize: 14 ft wide x 8 ft highCustom Color Available (+$125 paint fee)Elevate your event with The Majestic Backdrop — a stunning 14x8 ft display that brings a royal touch to any celebration. Whether you’re hosting a wedding, baby shower, birthday, or brand launch, this elegant wall creates the perfect photo moment or decor focal point.', 65000, cat_misc, '/images/products/the-majestic-backdrop.jpg', 65000, 10, '[]'::jsonb),
  ('THE CHEST OF GOLD', 'THE CHEST OF GOLD.', 29000, cat_misc, '/images/products/the-chest-of-gold.jpg', 29000, 10, '[]'::jsonb),
  ('Oval lux gold table', 'Size L 240cm W 120cm H 75 cm', 22500, cat_misc, '/images/products/oval-lux-gold-table.jpg', 22500, 10, '[]'::jsonb),
  ('Ripple Arch Wall (Pink)', 'Ripple Arch Wall (Pink) is a 3 pc backdrop that is ideal for your special celebration. It is perfectly paired with balloon garlands and floral arrangements.', 45000, cat_misc, '/images/products/ripple-arch-wall-pink.jpg', 45000, 10, '[]'::jsonb),
  ('Flower Runner (Pink)', 'Use this Flower Runner (Pink) to be an accent of elegance to your event. This will definitely beautify your table setting. You can simply put it in the middle of the table, and hang them from a backdrop. Use your creativity to use it as a decoration in any part of your setup! Inventory: 10', 12000, cat_misc, '/images/products/flower-runner-pink.jpg', 12000, 10, '[]'::jsonb),
  ('Prime Pure White Arch', 'COMES IN PINK ALSO', 35000, cat_misc, '/images/products/prime-pure-white-arch.jpg', 35000, 10, '[]'::jsonb),
  ('HIGH ROLLER SOFA SET (3)', 'HIGH ROLLER SOFA SET (3).', 18000, cat_misc, '/images/products/high-roller-sofa-set-3.jpg', 18000, 10, '[]'::jsonb),
  ('PRIME BLACK ROYALTY CHAIR', 'PRIME BLACK ROYALTY CHAIR.', 1440, cat_misc, '/images/products/prime-black-royalty-chair.jpg', 1440, 10, '[]'::jsonb),
  ('Rose Gold Beaded Chargers', 'Rose Gold Beaded Chargers.', 399, cat_misc, '/images/products/rose-gold-beaded-chargers.jpg', 399, 10, '[]'::jsonb),
  ('Crystals Trumpet Vase', 'This beaded crystal vase features rows and rows of glinting beaded acrylic crystals in luxurious metal wire frame for a pure royal look and feel.  Our dazzling jewel embedded vase is artistically crafted with faceted round acrylic crystals wired intricately in an elegant trumpet shape.  Glam your wedding tables up by lighting candles and LEDs inside and placing this precious crystal vase atop decorative mirrors and chandelier centerpiece risers.  Place a kissing ball or a rose bouquet atop to create a mesmeric floral tabletop presentation. Pair it with other beaded crystal decorative vases, candle holders, candlesticks, and tower vases available in modish designs and affordable rates.', 2000, cat_misc, '/images/products/crystals-trumpet-vase.jpg', 2000, 10, '[]'::jsonb),
  ('Side table', 'Side table.', 1500, cat_misc, '/images/products/side-table.jpg', 1500, 10, '[]'::jsonb),
  ('manzanita', 'manzanita.', 4000, cat_misc, '/images/products/manzanita.jpg', 4000, 10, '[]'::jsonb),
  ('Red Wine 13.5oz', 'Red Wine 13.5oz.', 135, cat_misc, '/images/products/red-wine-13-5oz.jpg', 135, 10, '[]'::jsonb),
  ('LED CLOUD WALL 4X5FT', 'LED CLOUD WALL 4X5FT.', 12500, cat_misc, '/images/products/led-cloud-wall-4x5ft.jpg', 12500, 10, '[]'::jsonb),
  ('BRIDES SPECIAL', '*2 THRONE*BACKDROP*BACKDROP FLOWER GARLAND*2 TREES*FLOWER RUNNER*CANDLE SETS*SPECIALTY TABLE', 121050, cat_misc, '/images/products/brides-special.jpg', 121050, 10, '[]'::jsonb),
  ('Gold Columns', 'Gold Columns.', 6500, cat_misc, '/images/products/gold-columns.jpg', 6500, 10, '[]'::jsonb),
  ('Hot Pink Columns', 'Hot Pink Columns.', 20000, cat_misc, '/images/products/hot-pink-columns.jpg', 20000, 10, '[]'::jsonb),
  ('ELEGANT CANDLES', 'ELEGANT CANDLES.', 6500, cat_misc, '/images/products/elegant-candles.jpg', 6500, 10, '[]'::jsonb),
  ('Black Beaded Chargers', 'Black Beaded Chargers.', 399, cat_misc, '/images/products/black-beaded-chargers.jpg', 399, 10, '[]'::jsonb),
  ('Silver Ruffle Chargers', 'Silver Ruffle Chargers.', 200, cat_misc, '/images/products/silver-ruffle-chargers.jpg', 200, 10, '[]'::jsonb);

  -- Pedestals & Plinths
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_pedestals_plinths, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_pedestals_plinths, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_pedestals_plinths, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Slatted  Pedestal', 'Slatted  Pedestal.', 10000, cat_pedestals_plinths, '/images/products/slatted-pedestal.jpg', 10000, 10, '[]'::jsonb),
  ('Sliver Pedestal', 'Sliver Pedestal.', 6000, cat_pedestals_plinths, '/images/products/sliver-pedestal.jpg', 6000, 10, '[]'::jsonb),
  ('BLACK COLUMNS', 'BLACK COLUMNS.', 20000, cat_pedestals_plinths, '/images/products/black-columns.jpg', 20000, 10, '[]'::jsonb),
  ('3 PIECE SET OF METAL CYLINDER PEDESTALS DISPLAY - SILVER', '3 PIECE SET OF METAL CYLINDER PEDESTALS DISPLAY - SILVER.', 15000, cat_pedestals_plinths, '/images/products/3-piece-set-of-metal-cylinder-pedestals-display-silver.jpg', 15000, 10, '[]'::jsonb),
  ('Royal Blue Columns', 'Royal Blue Columns.', 20000, cat_pedestals_plinths, '/images/products/royal-blue-columns.jpg', 20000, 10, '[]'::jsonb),
  ('Ruth Pedestals (Gold)', 'Ruth Pedestals (Gold).', 22500, cat_pedestals_plinths, '/images/products/ruth-pedestals-gold.jpg', 22500, 10, '[]'::jsonb),
  ('Gold Square Pedestals', 'Gold Square Pedestals.', 8000, cat_pedestals_plinths, '/images/products/gold-square-pedestals.jpg', 8000, 10, '[]'::jsonb),
  ('Ruth Pedestals (Silver)', 'Ruth Pedestals (Silver).', 22500, cat_pedestals_plinths, '/images/products/ruth-pedestals-silver.jpg', 22500, 10, '[]'::jsonb),
  ('Cylinder Acrylic Pedestals (White)', 'Cylinder Acrylic Pedestals (White).', 16000, cat_pedestals_plinths, '/images/products/cylinder-acrylic-pedestals-white.jpg', 16000, 10, '[]'::jsonb);

  -- Shelves
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_shelves, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_shelves, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_shelves, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Charice Shelf', 'Charice Shelf.', 15000, cat_shelves, '/images/products/charice-shelf.jpg', 15000, 10, '[]'::jsonb);

  -- Sweets Carts
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_sweets_carts, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_sweets_carts, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_sweets_carts, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Prime cycle cart', 'Prime cycle cart.', 30000, cat_sweets_carts, '/images/products/prime-cycle-cart.jpg', 30000, 10, '[]'::jsonb),
  ('Pumpkin Cart', 'Pumpkin Cart.', 20000, cat_sweets_carts, '/images/products/pumpkin-cart.jpg', 20000, 10, '[]'::jsonb),
  ('White Rustic cart', 'White Rustic cart.', 30000, cat_sweets_carts, '/images/products/white-rustic-cart.jpg', 30000, 10, '[]'::jsonb),
  ('All White Cart', 'All White Cart.', 25000, cat_sweets_carts, '/images/products/all-white-cart.jpg', 25000, 10, '[]'::jsonb),
  ('White Wagon Cart', 'White Wagon Cart.', 22500, cat_sweets_carts, '/images/products/white-wagon-cart.jpg', 22500, 10, '[]'::jsonb);

  -- Charger Plates
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_charger_plates, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_charger_plates, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_charger_plates, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Plain Red Chargers', 'Plain Red Chargers.', 100, cat_charger_plates, '/images/products/plain-red-chargers.jpg', 100, 10, '[]'::jsonb),
  ('Eclipse Gold Charger', 'Eclipse Gold Charger.', 650, cat_charger_plates, '/images/products/eclipse-gold-charger.jpg', 650, 10, '[]'::jsonb),
  ('Natural Tone Charger', 'Natural Tone Charger.', 100, cat_charger_plates, '/images/products/natural-tone-charger.jpg', 100, 10, '[]'::jsonb),
  ('Reef Charger Plate (Pink)', 'Reef Charger Plate (Pink).', 350, cat_charger_plates, '/images/products/reef-charger-plate-pink.jpg', 350, 10, '[]'::jsonb),
  ('Reef Charger Plate (Navy Blue)', 'Reef Charger Plate (Navy Blue).', 350, cat_charger_plates, '/images/products/reef-charger-plate-navy-blue.jpg', 350, 10, '[]'::jsonb),
  ('Reef Charger Plate (Purple)', 'Reef Charger Plate (Purple).', 350, cat_charger_plates, '/images/products/reef-charger-plate-purple.jpg', 350, 10, '[]'::jsonb),
  ('Reef Charger Plate (Gold)', 'Reef Charger Plate (Gold).', 350, cat_charger_plates, '/images/products/reef-charger-plate-gold.jpg', 350, 10, '[]'::jsonb),
  ('Reef Charger Plate (Black)', 'Reef Charger Plate (Black).', 350, cat_charger_plates, '/images/products/reef-charger-plate-black.jpg', 350, 10, '[]'::jsonb),
  ('Reef Charger Plate (Aqua Blue)', 'Reef Charger Plate (Aqua Blue).', 350, cat_charger_plates, '/images/products/reef-charger-plate-aqua-blue.jpg', 350, 10, '[]'::jsonb),
  ('Reef Charger Plate (Baby Blue)', 'Reef Charger Plate (Baby Blue).', 350, cat_charger_plates, '/images/products/reef-charger-plate-baby-blue.jpg', 350, 10, '[]'::jsonb),
  ('Reef Charger Plate (Burgundy)', 'Reef Charger Plate (Burgundy).', 350, cat_charger_plates, '/images/products/reef-charger-plate-burgundy.jpg', 350, 10, '[]'::jsonb),
  ('Reef Charger Plate (Silver)', 'Reef Charger Plate (Silver).', 350, cat_charger_plates, '/images/products/reef-charger-plate-silver.jpg', 350, 10, '[]'::jsonb);

  -- Flowers & Centerpieces
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_centerpeices_2, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_centerpeices_2, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_centerpeices_2, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Green Tree', 'Green Tree.', 10000, cat_centerpeices_2, '/images/products/green-tree.jpg', 10000, 10, '[]'::jsonb),
  ('3 Piece Cylinder Centerpiece', '3 Piece Cylinder Centerpiece.', 3500, cat_centerpeices_2, '/images/products/3-piece-cylinder-centerpiece.jpg', 3500, 10, '[]'::jsonb),
  ('GOLD  VASE', 'GOLD  VASE.', 1800, cat_centerpeices_2, '/images/products/gold-vase.jpg', 1800, 10, '[]'::jsonb),
  ('Peach Time Centerpiece', 'Peach Time Centerpiece.', 4500, cat_centerpeices_2, '/images/products/peach-time-centerpiece.jpg', 4500, 10, '[]'::jsonb),
  ('The Elegance  Centerpiece', 'The Elegance  Centerpiece.', 4500, cat_centerpeices_2, '/images/products/the-elegance-centerpiece.jpg', 4500, 10, '[]'::jsonb),
  ('Spring Valley Centerpiece', 'Spring Valley Centerpiece.', 4500, cat_centerpeices_2, '/images/products/spring-valley-centerpiece.jpg', 4500, 10, '[]'::jsonb),
  ('Table Top Elephant', 'Table Top Elephant.', 1000, cat_centerpeices_2, '/images/products/table-top-elephant.jpg', 1000, 10, '[]'::jsonb),
  ('Table Top Elephant', 'Table Top Elephant.', 1000, cat_centerpeices_2, '/images/products/table-top-elephant.jpg', 1000, 10, '[]'::jsonb),
  ('Table Top Elephant', 'Table Top Elephant.', 1000, cat_centerpeices_2, '/images/products/table-top-elephant.jpg', 1000, 10, '[]'::jsonb),
  ('Silver Vase', 'Silver Vase.', 1500, cat_centerpeices_2, '/images/products/silver-vase.jpg', 1500, 10, '[]'::jsonb),
  ('ROUND CRYSTAL VASE', 'ROUND CRYSTAL VASE.', 1000, cat_centerpeices_2, '/images/products/round-crystal-vase.jpg', 1000, 10, '[]'::jsonb),
  ('SILVER FRESH FLOWERS W/ VASE', 'SILVER FRESH FLOWERS W/ VASE.', 6500, cat_centerpeices_2, '/images/products/silver-fresh-flowers-w-vase.jpg', 6500, 10, '[]'::jsonb),
  ('3 GOBLETS', '3 GOBLETS.', 3500, cat_centerpeices_2, '/images/products/3-goblets.jpg', 3500, 10, '[]'::jsonb),
  ('FLORAL BALL', 'FLORAL BALL.', 3500, cat_centerpeices_2, '/images/products/floral-ball.jpg', 3500, 10, '[]'::jsonb),
  ('FLORAL CARRIAGE CENTERPIECE', 'FLORAL CARRIAGE CENTERPIECE.', 3500, cat_centerpeices_2, '/images/products/floral-carriage-centerpiece.jpg', 3500, 10, '[]'::jsonb),
  ('BALLOON CENTERPIECERegular', 'BALLOON CENTERPIECERegular.', 3500, cat_centerpeices_2, '/images/products/balloon-centerpieceregular.jpg', 3500, 10, '[]'::jsonb),
  ('FLOWER QUEEN W/VASE', 'FLOWER QUEEN W/VASE.', 6500, cat_centerpeices_2, '/images/products/flower-queen-w-vase.jpg', 6500, 10, '[]'::jsonb),
  ('3 SET CORAL', '3 SET CORAL.', 3500, cat_centerpeices_2, '/images/products/3-set-coral.jpg', 3500, 10, '[]'::jsonb),
  ('FRESH FLOWER', 'FRESH FLOWER.', 5500, cat_centerpeices_2, '/images/products/fresh-flower.jpg', 5500, 10, '[]'::jsonb),
  ('GREEN GARDEN FLOWER', 'GREEN GARDEN FLOWER.', 4500, cat_centerpeices_2, '/images/products/green-garden-flower.jpg', 4500, 10, '[]'::jsonb);

  -- Table Linens
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_table_linens, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_table_linens, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_table_linens, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('SOLID STRIPE TABLECLOTH', 'SOLID STRIPE TABLECLOTH.', 0, cat_table_linens, '/images/products/solid-stripe-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('BEETHOVEN TABLECLOTH', 'BEETHOVEN TABLECLOTH.', 0, cat_table_linens, '/images/products/beethoven-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('CHECKS TABLECLOTH', 'CHECKS TABLECLOTH.', 0, cat_table_linens, '/images/products/checks-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('PLAID TABLECLOTH', 'PLAID TABLECLOTH.', 0, cat_table_linens, '/images/products/plaid-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('AWNING STRIPE TABLECLOTH', 'AWNING STRIPE TABLECLOTH.', 0, cat_table_linens, '/images/products/awning-stripe-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('VELVET TABLECLOTH', 'VELVET TABLECLOTH.', 2500, cat_table_linens, 'https://placehold.co/600x400?text=VELVET%20TABLECLOTH', 2500, 10, '[]'::jsonb),
  ('RACE CAR TABLECLOTH', 'RACE CAR TABLECLOTH.', 3300, cat_table_linens, '/images/products/race-car-tablecloth.jpg', 3300, 10, '[]'::jsonb),
  ('SEQUINS TABLECLOTH', 'SEQUINS TABLECLOTH.', 2500, cat_table_linens, '/images/products/sequins-tablecloth.jpg', 2500, 10, '[]'::jsonb),
  ('Flower on Sequin Taffeta Tablecloth 120" Round - Blush/Rose Gold', 'Flower on Sequin Taffeta Tablecloth 120" Round - Blush/Rose Gold.', 2500, cat_table_linens, '/images/products/flower-on-sequin-taffeta-tablecloth-120-round-blush-rose-gold.jpg', 2500, 10, '[]'::jsonb),
  ('Large Rosette Flower Tablecloth', 'Large Rosette Flower Tablecloth.', 5000, cat_table_linens, '/images/products/large-rosette-flower-tablecloth.jpg', 5000, 10, '[]'::jsonb),
  ('ROUND PINTUCK TABLECLOTH', 'Keep it classy with our elegant line of affordable pintuck tablecloths. Perfect for banquet events like weddings, Bar Mitzvahs, and Quinceaneras, a 108 in. Round Pintuck Tablecloth offers a smart, sophisticated look for any tablescape. Featuring intricately tucked rows of rich satin, our pintuck table linens are made from high quality, taffeta fabric,', 0, cat_table_linens, '/images/products/round-pintuck-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('ROUND PAYETTE SEQUIN TABLECLOTH IRIDESCENT', 'ROUND PAYETTE SEQUIN TABLECLOTH IRIDESCENT.', 4000, cat_table_linens, '/images/products/round-payette-sequin-tablecloth-iridescent.jpg', 4000, 10, '[]'::jsonb),
  ('1.	RECTANGULAR POLYESTER TABLECLOTH IN DIFFERENT COLOR', 'A dual-duty banquet tablecloth, this linen fits 6 ft. and 8 ft. long tables. Besides the affordable price tag, our polyester material is the toughest fabric we''ve got. Rectangular tables are perfect for conserving precious floor space at banquet venues and serving meals family-style', 0, cat_table_linens, '/images/products/1-rectangular-polyester-tablecloth-in-different-color.jpg', 0, 10, '[]'::jsonb),
  ('ROUND POLYESTER TABLECLOTH', 'round polyester tablecloths are our most popular table clothes. This Party Linen is perfect for a Wedding Reception, a Party, Banquets or any other Fine Event. It fits the most common 5 ft. (60in.) round tables with an elegant drop all the way to the floor. Besides the affordable price tag, our polyester material is the toughest fabric we''ve got. Round tables can be decorated with either round or square tablecloths, and are traditionally used at weddings because circles are symbolic of eternal unity. Our 120 in. Round Polyester Tablecloth features a serged hem, seamless design, and durable fabric quality ideal for withstanding high-volume banquet events and restaurants', 0, cat_table_linens, '/images/products/round-polyester-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('ROUND SILK EMBROIDERED POLYESTER TABLECLOTH', 'ROUND SILK EMBROIDERED POLYESTER TABLECLOTH.', 2500, cat_table_linens, '/images/products/round-silk-embroidered-polyester-tablecloth.jpg', 2500, 10, '[]'::jsonb);

  -- Napkins & Rings
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_table_napkins_and_rings, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_table_napkins_and_rings, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_table_napkins_and_rings, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Table Napkin (Burnt Orange)', 'Table Napkin (Burnt Orange).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-burnt-orange.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Emerald Green)', 'Table Napkin (Emerald Green).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-emerald-green.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Aqua Blue)', 'Table Napkin (Aqua Blue).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-aqua-blue.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Lavender)', 'Table Napkin (Lavender).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-lavender.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Medium Pink)', 'Table Napkin (Medium Pink).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-medium-pink.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Silver)', 'Table Napkin (Silver).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-silver.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Purple)', 'Table Napkin (Purple).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-purple.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (White)', 'Table Napkin (White).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-white.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Champagne)', 'Table Napkin (Champagne).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-champagne.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Coral)', 'Table Napkin (Coral).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-coral.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Magenta Violet)', 'Table Napkin (Magenta Violet).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-magenta-violet.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Pewter)', 'Table Napkin (Pewter).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-pewter.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Gold Antique)', 'Table Napkin (Gold Antique).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-gold-antique.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Burgundy)', 'Table Napkin (Burgundy).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-burgundy.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Chocolate Brown)', 'Table Napkin (Chocolate Brown).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-chocolate-brown.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Apple Red)', 'Table Napkin (Apple Red).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-apple-red.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Black)', 'Table Napkin (Black).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-black.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Royal Blue)', 'Table Napkin (Royal Blue).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-royal-blue.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Bright Gold)', 'Table Napkin (Bright Gold).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-bright-gold.jpg', 250, 10, '[]'::jsonb),
  ('Table Napkin (Kelly Green)', 'Table Napkin (Kelly Green).', 250, cat_table_napkins_and_rings, '/images/products/table-napkin-kelly-green.jpg', 250, 10, '[]'::jsonb);

  -- Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_dining_tables, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_dining_tables, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_dining_tables, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('White lux table', 'White lux table.', 20000, cat_dining_tables, '/images/products/white-lux-table.jpg', 20000, 10, '[]'::jsonb),
  ('BANQUET ROUND PARTY TABLES', 'BANQUET ROUND PARTY TABLES.', 1100, cat_dining_tables, '/images/products/banquet-round-party-tables.jpg', 1100, 10, '[]'::jsonb),
  ('RECTANGULAR BANQUET TABLES', 'RECTANGULAR BANQUET TABLES.', 1100, cat_dining_tables, '/images/products/rectangular-banquet-tables.jpg', 1100, 10, '[]'::jsonb),
  ('gold mirrior table', 'gold mirrior table.', 25000, cat_dining_tables, '/images/products/gold-mirrior-table.jpg', 25000, 10, '[]'::jsonb),
  ('Gold Serpentine tableRegular', 'Gold Serpentine table.', 25000, cat_dining_tables, '/images/products/gold-serpentine-tableregular.jpg', 25000, 10, '[]'::jsonb),
  ('Vogue Triangular Table', 'Vogue Triangular Table.', 35000, cat_dining_tables, '/images/products/vogue-triangular-table.jpg', 35000, 10, '[]'::jsonb),
  ('Fab Glass Table', 'Fab Glass Table.', 25000, cat_dining_tables, '/images/products/fab-glass-table.jpg', 25000, 10, '[]'::jsonb),
  ('Clear Rectangular Table', 'Clear Rectangular Table.', 25000, cat_dining_tables, '/images/products/clear-rectangular-table.jpg', 25000, 10, '[]'::jsonb),
  ('Olivia Rectangular Table', 'Olivia Rectangular Table.', 35000, cat_dining_tables, '/images/products/olivia-rectangular-table.jpg', 35000, 10, '[]'::jsonb);

  -- Tents
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_tent, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_tent, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_tent, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Pickup Security Deposit', 'Pickup Security Deposit.', 7500, cat_tent, '/images/products/pickup-security-deposit.jpg', 7500, 10, '[]'::jsonb),
  ('Tent Installation', 'Tent Installation.', 12500, cat_tent, '/images/products/tent-installation.jpg', 12500, 10, '[]'::jsonb),
  ('Instillation', 'Instillation.', 12500, cat_tent, '/images/products/instillation.jpg', 12500, 10, '[]'::jsonb),
  ('White Bounce House  - 3in1  bouncey House for Kids', 'White Bounce House  - 3in1  bouncey House for Kids.', 37500, cat_tent, '/images/products/white-bounce-house-3in1-bouncey-house-for-kids.jpg', 37500, 10, '[]'::jsonb),
  ('OUTDOOR SETTINGS #1', 'OUTDOOR SETTINGS #1.', 86100, cat_tent, '/images/products/outdoor-settings-1.jpg', 86100, 10, '[]'::jsonb),
  ('OUTDOOR SETTINGS #2', 'OUTDOOR SETTINGS #2.', 121000, cat_tent, '/images/products/outdoor-settings-2.jpg', 121000, 10, '[]'::jsonb),
  ('LED CABANA', 'LED CABANA.', 71500, cat_tent, '/images/products/led-cabana.jpg', 71500, 10, '[]'::jsonb),
  ('SINGLE CABANA W/SOFA & TABLE', 'SINGLE CABANA W/SOFA & TABLE.', 65000, cat_tent, '/images/products/single-cabana-w-sofa-table.jpg', 65000, 10, '[]'::jsonb),
  ('10X10 TENT', '10X10 TENT.', 15000, cat_tent, '/images/products/10x10-tent.jpg', 15000, 10, '[]'::jsonb),
  ('20X30 TENT', '20X30 TENT.', 67500, cat_tent, '/images/products/20x30-tent.jpg', 67500, 10, '[]'::jsonb),
  ('OUTDOOR PACKAGE #4', 'OUTDOOR PACKAGE #4.', 168150, cat_tent, '/images/products/outdoor-package-4.jpg', 168150, 10, '[]'::jsonb),
  ('OUTDOOR PACKAGE #3', 'OUTDOOR PACKAGE #3.', 114500, cat_tent, '/images/products/outdoor-package-3.jpg', 114500, 10, '[]'::jsonb),
  ('OUTDOOR PACKAGE #2', 'OUTDOOR PACKAGE #2.', 129350, cat_tent, '/images/products/outdoor-package-2.jpg', 129350, 10, '[]'::jsonb),
  ('OUTDOOR PACKAGE #1', 'OUTDOOR PACKAGE #1.', 99000, cat_tent, '/images/products/outdoor-package-1.jpg', 99000, 10, '[]'::jsonb),
  ('Fringe Umbrella', 'Fringe Umbrella.', 12500, cat_tent, '/images/products/fringe-umbrella.jpg', 12500, 10, '[]'::jsonb),
  ('Market Umbrella', 'Market Umbrella.', 5500, cat_tent, '/images/products/market-umbrella.jpg', 5500, 10, '[]'::jsonb),
  ('20x 40 Tent', '20x 40 Tent.', 87500, cat_tent, '/images/products/20x-40-tent.jpg', 87500, 10, '[]'::jsonb),
  ('Tent 20x20', 'Tent 20x20.', 47500, cat_tent, '/images/products/tent-20x20.jpg', 47500, 10, '[]'::jsonb);

  -- Glassware
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_glasswear, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_glasswear, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_glasswear, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('White Dessert Plate', 'White Dessert Plate.', 105, cat_glasswear, '/images/products/white-dessert-plate.jpg', 105, 10, '[]'::jsonb),
  ('Blanc  Wine Glass', 'Blanc  Wine Glass.', 135, cat_glasswear, '/images/products/blanc-wine-glass.jpg', 135, 10, '[]'::jsonb),
  ('Rocks / Old Fashioned Glass', 'Rocks / Old Fashioned Glass.', 135, cat_glasswear, '/images/products/rocks-old-fashioned-glass.jpg', 135, 10, '[]'::jsonb),
  ('Champagne Flute 6.25oz', 'Champagne Flute 6.25oz.', 125, cat_glasswear, '/images/products/champagne-flute-6-25oz.jpg', 125, 10, '[]'::jsonb),
  ('Modern luxury Matte Gold Silverware', 'Modern luxury Matte Gold Silverware.', 195, cat_glasswear, '/images/products/modern-luxury-matte-gold-silverware.jpg', 195, 10, '[]'::jsonb),
  ('Stoneware Mug 12oz', 'Stoneware Mug 12oz.', 99, cat_glasswear, '/images/products/stoneware-mug-12oz.jpg', 99, 10, '[]'::jsonb),
  ('Stoneware Mug 12oz', 'Stoneware Mug 12oz.', 99, cat_glasswear, '/images/products/stoneware-mug-12oz.jpg', 99, 10, '[]'::jsonb),
  ('Stoneware Mug 12oz', 'Stoneware Mug 12oz.', 99, cat_glasswear, '/images/products/stoneware-mug-12oz.jpg', 99, 10, '[]'::jsonb),
  ('Stemless Glass 20.5oz', 'Stemless Glass 20.5oz.', 135, cat_glasswear, '/images/products/stemless-glass-20-5oz.jpg', 135, 10, '[]'::jsonb),
  ('Stainless Steel Steak Knives', 'Stainless Steel Steak Knives.', 99, cat_glasswear, '/images/products/stainless-steel-steak-knives.jpg', 99, 10, '[]'::jsonb),
  ('The Drop  Flatware Stainless Steel Silverware', 'The Drop  Flatware Stainless Steel Silverware.', 105, cat_glasswear, '/images/products/the-drop-flatware-stainless-steel-silverware.jpg', 105, 10, '[]'::jsonb),
  ('Bentley stainless steel spoon', 'Bentley stainless steel spoon.', 95, cat_glasswear, '/images/products/bentley-stainless-steel-spoon.jpg', 95, 10, '[]'::jsonb),
  ('White Plate 7.5 in', 'White Plate 7.5 in.', 99, cat_glasswear, '/images/products/white-plate-7-5-in.jpg', 99, 10, '[]'::jsonb),
  ('White Dinner Plate 10.5 in', 'White Dinner Plate 10.5 in.', 105, cat_glasswear, '/images/products/white-dinner-plate-10-5-in.jpg', 105, 10, '[]'::jsonb),
  ('Classic Black Plate 10.5 in', 'Classic Black Plate 10.5 in.', 105, cat_glasswear, '/images/products/classic-black-plate-10-5-in.jpg', 105, 10, '[]'::jsonb),
  ('Classic Black Plate 7.5 in', 'Classic Black Plate 7.5 in.', 99, cat_glasswear, '/images/products/classic-black-plate-7-5-in.jpg', 99, 10, '[]'::jsonb),
  ('White serving Coupe Bone China Plate', 'White serving Coupe Bone China Plate.', 95, cat_glasswear, '/images/products/white-serving-coupe-bone-china-plate.jpg', 95, 10, '[]'::jsonb),
  ('Gold Rim Dinner Plates 10.5 in', 'Gold Rim Dinner Plates 10.5 in.', 125, cat_glasswear, '/images/products/gold-rim-dinner-plates-10-5-in.jpg', 125, 10, '[]'::jsonb),
  ('Glass Pint Jar 16oz', 'Glass Pint Jar 16oz.', 125, cat_glasswear, '/images/products/glass-pint-jar-16oz.jpg', 125, 10, '[]'::jsonb),
  ('Glass Carafe 1 liter', 'Glass Carafe 1 liter.', 600, cat_glasswear, '/images/products/glass-carafe-1-liter.jpg', 600, 10, '[]'::jsonb);

  -- Chargers
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_chargers, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_chargers, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_chargers, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb),
  ('Gold Fancy Chargers', 'Gold Fancy Chargers.', 199, cat_chargers, '/images/products/gold-fancy-chargers.jpg', 199, 10, '[]'::jsonb),
  ('Metallic Silver Charger', 'Metallic Silver Charger.', 199, cat_chargers, '/images/products/metallic-silver-charger.jpg', 199, 10, '[]'::jsonb),
  ('Acrylic Reef Silver Charger', 'Acrylic Reef Silver Charger.', 299, cat_chargers, '/images/products/acrylic-reef-silver-charger.jpg', 299, 10, '[]'::jsonb),
  ('Acrylic Reef Black Charger', 'Acrylic Reef Black Charger.', 299, cat_chargers, '/images/products/acrylic-reef-black-charger.jpg', 299, 10, '[]'::jsonb),
  ('Acrylic Reef Dusty Rose Charger', 'Acrylic Reef Dusty Rose Charger.', 299, cat_chargers, '/images/products/acrylic-reef-dusty-rose-charger.jpg', 299, 10, '[]'::jsonb),
  ('Acrylic Reef Pink Charger', 'Acrylic Reef Pink Charger.', 299, cat_chargers, '/images/products/acrylic-reef-pink-charger.jpg', 299, 10, '[]'::jsonb),
  ('Silverware Chargers', 'Silverware Chargers.', 299, cat_chargers, '/images/products/silverware-chargers.jpg', 299, 10, '[]'::jsonb),
  ('Accent Silver Chargers', 'Accent Silver Chargers.', 399, cat_chargers, '/images/products/accent-silver-chargers.jpg', 399, 10, '[]'::jsonb),
  ('Clear Beaded Chargers', 'Clear Beaded Chargers.', 399, cat_chargers, '/images/products/clear-beaded-chargers.jpg', 399, 10, '[]'::jsonb),
  ('Gold and Black Ruffle Chargers', 'Gold and Black Ruffle Chargers.', 299, cat_chargers, '/images/products/gold-and-black-ruffle-chargers.jpg', 299, 10, '[]'::jsonb),
  ('Blue Ruffle Chargers', 'Blue Ruffle Chargers.', 299, cat_chargers, '/images/products/blue-ruffle-chargers.jpg', 299, 10, '[]'::jsonb),
  ('Accent Black Chargers', 'Accent Black Chargers.', 399, cat_chargers, '/images/products/accent-black-chargers.jpg', 399, 10, '[]'::jsonb),
  ('Natural Tone Charger', 'Natural Tone Charger.', 100, cat_chargers, '/images/products/natural-tone-charger.jpg', 100, 10, '[]'::jsonb),
  ('Stone Tone Chargers', 'Stone Tone Chargers.', 100, cat_chargers, '/images/products/stone-tone-chargers.jpg', 100, 10, '[]'::jsonb),
  ('Gold Glass Charger', 'Gold Glass Charger.', 600, cat_chargers, '/images/products/gold-glass-charger.jpg', 600, 10, '[]'::jsonb),
  ('Lux Gold Charger', 'Lux Gold Charger.', 650, cat_chargers, '/images/products/lux-gold-charger.jpg', 650, 10, '[]'::jsonb),
  ('Scarlet Royale FrameRegular', 'Scarlet Royale FrameRegular.', 67500, cat_chargers, '/images/products/scarlet-royale-frameregular.jpg', 67500, 10, '[]'::jsonb),
  ('Dreamland Train', 'Dreamland Train.', 42500, cat_chargers, '/images/products/dreamland-train.jpg', 42500, 10, '[]'::jsonb),
  ('Princess Express Train', 'Princess Express Train.', 42500, cat_chargers, '/images/products/princess-express-train.jpg', 42500, 10, '[]'::jsonb),
  ('Scottsdale Arch', 'Scottsdale Arch.', 37500, cat_chargers, '/images/products/scottsdale-arch.jpg', 37500, 10, '[]'::jsonb),
  ('The Mint Haven Display 🌿', 'The Mint Haven Display 🌿.', 22500, cat_chargers, '/images/products/the-mint-haven-display.jpg', 22500, 10, '[]'::jsonb),
  ('Sapphire acrh', 'Sapphire acrh.', 25000, cat_chargers, '/images/products/sapphire-acrh.jpg', 25000, 10, '[]'::jsonb),
  ('Crystal Glow Table', 'Crystal Glow Table.', 27500, cat_chargers, '/images/products/crystal-glow-table.jpg', 27500, 10, '[]'::jsonb),
  ('Clover wave Acrh', 'Clover wave Acrh.', 27500, cat_chargers, '/images/products/clover-wave-acrh.jpg', 27500, 10, '[]'::jsonb),
  ('Cloud Stage', 'Cloud Stage.', 65000, cat_chargers, '/images/products/cloud-stage.jpg', 65000, 10, '[]'::jsonb),
  ('Waves of Elegance Backdrop 8x8ft', 'Waves of Elegance Backdrop 8x8ft.', 45000, cat_chargers, '/images/products/waves-of-elegance-backdrop-8x8ft.jpg', 45000, 10, '[]'::jsonb),
  ('JOLIE"S  BACKDROP', 'JOLIE"S  BACKDROP.', 65000, cat_chargers, '/images/products/jolie-s-backdrop.jpg', 65000, 10, '[]'::jsonb),
  ('Fresh Kicks Display 6ft', 'Fresh Kicks Display 6ft.', 22500, cat_chargers, '/images/products/fresh-kicks-display-6ft.jpg', 22500, 10, '[]'::jsonb),
  ('Aurora Stage', 'Aurora Stage.', 65000, cat_chargers, '/images/products/aurora-stage.jpg', 65000, 10, '[]'::jsonb),
  ('Angel wings', 'Angel wings.', 27500, cat_chargers, '/images/products/angel-wings.jpg', 27500, 10, '[]'::jsonb),
  ('Moon 7ft', 'Moon 7ft.', 17500, cat_chargers, '/images/products/moon-7ft.jpg', 17500, 10, '[]'::jsonb),
  ('Santorini wall package', 'Santorini wall package.', 100000, cat_chargers, '/images/products/santorini-wall-package.jpg', 100000, 10, '[]'::jsonb),
  ('Green Tree', 'Green Tree.', 10000, cat_chargers, '/images/products/green-tree.jpg', 10000, 10, '[]'::jsonb),
  ('Boxwood  Wall 6ft x 3ft', 'Boxwood  Wall 6ft x 3ft.', 22500, cat_chargers, '/images/products/boxwood-wall-6ft-x-3ft.jpg', 22500, 10, '[]'::jsonb),
  ('Sugar Blossom Patisserie 🌸🍩', 'Sugar Blossom Patisserie 🌸🍩.', 50000, cat_chargers, '/images/products/sugar-blossom-patisserie.jpg', 50000, 10, '[]'::jsonb),
  ('Rustic Red Barn Wall', 'Rustic Red Barn Wall.', 27500, cat_chargers, '/images/products/rustic-red-barn-wall.jpg', 27500, 10, '[]'::jsonb);

  -- Table Settings
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Party in a Box (Ultimate)', 'This package includes everything you need to make your upcoming party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair50 Folding Chairs or 25 Fancy Chairs1 LED Sign5 Round Table Linens50 Table Napkins 50 Charger Plates5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 145000, cat_table_settings, '/images/products/party-in-a-box-ultimate.jpg', 145000, 10, '[]'::jsonb),
  ('Party in a Box (Baby Shower)', 'This package includes everything you need to make your upcoming baby shower party pop! Inclusions: 1 Backdrop1 Pedestal (set)1 Cart1 Throne Chair or Lux Chair50 Bamboo Chairs (Gold or Silver) 5 Round Table Linens50 Table Napkins 50 Charger Plates1 Free Gift (upon availability)5 Centerpieces (Flower Balls)1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 190000, cat_table_settings, '/images/products/party-in-a-box-baby-shower.jpg', 190000, 10, '[]'::jsonb),
  ('Party in a Box (Graduation)', 'This package includes everything you need to make your upcoming Graudation party pop! Inclusions: GRAD Lit Letters (any color)1 Backdrop1 Pedestal (set)1 Throne Chair or Lux Chair1 LED Sign5 Round Table Linens25 Fancy Chairs25 Table Napkins25 Charger Plates5 Graduation Centerpieces1 Fancy Balloon Garland All rentals will be dropped off to your event location.  However, we do not set up.  Delivery and Pickup Fee for this package starts at $90.', 200000, cat_table_settings, '/images/products/party-in-a-box-graduation.jpg', 200000, 10, '[]'::jsonb);

END $$;

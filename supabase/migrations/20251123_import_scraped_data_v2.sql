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

  -- Products
  -- Backdrops & Panels
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_backdrops_panels, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_backdrops_panels, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_backdrops_panels, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Scarlet Royale Frame', 'Scarlet Royale Frame.', 0, cat_backdrops_panels, '/images/products/scarlet-royale-frame.jpg', 0, 10, '[]'::jsonb),
  ('Scottsdale Arch', 'Scottsdale Arch.', 0, cat_backdrops_panels, '/images/products/scottsdale-arch.jpg', 0, 10, '[]'::jsonb),
  ('Sapphire acrh', 'Sapphire acrh.', 0, cat_backdrops_panels, '/images/products/sapphire-acrh.jpg', 0, 10, '[]'::jsonb),
  ('Clover wave Acrh', 'Clover wave Acrh.', 0, cat_backdrops_panels, '/images/products/clover-wave-acrh.jpg', 0, 10, '[]'::jsonb),
  ('Ana set', 'Ana set.', 0, cat_backdrops_panels, '/images/products/ana-set.jpg', 0, 10, '[]'::jsonb),
  ('Waves of Elegance Backdrop 8x8ft', 'Waves of Elegance Backdrop 8x8ft.', 0, cat_backdrops_panels, '/images/products/waves-of-elegance-backdrop-8x8ft.jpg', 0, 10, '[]'::jsonb),
  ('JOLIE"S  BACKDROP', 'JOLIE"S  BACKDROP.', 0, cat_backdrops_panels, '/images/products/jolie-s-backdrop.jpg', 0, 10, '[]'::jsonb),
  ('Story Book', 'Story Book.', 0, cat_backdrops_panels, '/images/products/story-book.jpg', 0, 10, '[]'::jsonb),
  ('Fresh Kicks Display 6ft', 'Fresh Kicks Display 6ft.', 0, cat_backdrops_panels, '/images/products/fresh-kicks-display-6ft.jpg', 0, 10, '[]'::jsonb),
  ('Moon 7ft', 'Moon 7ft.', 0, cat_backdrops_panels, '/images/products/moon-7ft.jpg', 0, 10, '[]'::jsonb),
  ('Santorini wall package', 'Santorini wall package.', 0, cat_backdrops_panels, '/images/products/santorini-wall-package.jpg', 0, 10, '[]'::jsonb),
  ('Boxwood  Wall 6ft x 3ft', 'Boxwood  Wall 6ft x 3ft.', 0, cat_backdrops_panels, '/images/products/boxwood-wall-6ft-x-3ft.jpg', 0, 10, '[]'::jsonb),
  ('Sugar Blossom Patisserie 🌸🍩', 'Sugar Blossom Patisserie 🌸🍩.', 0, cat_backdrops_panels, '/images/products/sugar-blossom-patisserie.jpg', 0, 10, '[]'::jsonb),
  ('Rustic Red Barn Wall', 'Rustic Red Barn Wall.', 0, cat_backdrops_panels, '/images/products/rustic-red-barn-wall.jpg', 0, 10, '[]'::jsonb),
  ('F&M Arch Wall', 'F&M Arch Wall.', 0, cat_backdrops_panels, '/images/products/f-m-arch-wall.jpg', 0, 10, '[]'::jsonb),
  ('Fanta Shelf Wall | 8ft x 8ft', 'Fanta Shelf Wall | 8ft x 8ft.', 0, cat_backdrops_panels, '/images/products/fanta-shelf-wall-8ft-x-8ft.jpg', 0, 10, '[]'::jsonb),
  ('Trio Wedding Gold Arch', 'Trio Wedding Gold Arch.', 0, cat_backdrops_panels, '/images/products/trio-wedding-gold-arch.jpg', 0, 10, '[]'::jsonb),
  ('The Crain wall', 'The Crain wall.', 0, cat_backdrops_panels, '/images/products/the-crain-wall.jpg', 0, 10, '[]'::jsonb),
  ('Alice flower box 6ft x 4ft', 'Alice flower box 6ft x 4ft.', 0, cat_backdrops_panels, '/images/products/alice-flower-box-6ft-x-4ft.jpg', 0, 10, '[]'::jsonb),
  ('Luxe Tote', 'Luxe Tote.', 0, cat_backdrops_panels, '/images/products/luxe-tote.jpg', 0, 10, '[]'::jsonb);

  -- Flower Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_flower_walls, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_flower_walls, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_flower_walls, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('RED FLOWER WALL BACKDROP', 'RED FLOWER WALL BACKDROP.', 0, cat_flower_walls, '/images/products/red-flower-wall-backdrop.jpg', 0, 10, '[]'::jsonb),
  ('Grand Flower Wall Backdrop', 'Grand Flower Wall Backdrop.', 0, cat_flower_walls, '/images/products/grand-flower-wall-backdrop.jpg', 0, 10, '[]'::jsonb),
  ('FLOWER WALL & BALLOON', 'FLOWER WALL & BALLOON.', 0, cat_flower_walls, '/images/products/flower-wall-balloon.jpg', 0, 10, '[]'::jsonb),
  ('Flower Wall (Touch of Pink)', 'Flower Wall (Touch of Pink).', 0, cat_flower_walls, '/images/products/flower-wall-touch-of-pink.jpg', 0, 10, '[]'::jsonb);

  -- Shimmer Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_shimmer_walls, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_shimmer_walls, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_shimmer_walls, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Shimmer Wall (Gold)', 'Shimmer Wall (Gold).', 0, cat_shimmer_walls, '/images/products/shimmer-wall-gold.jpg', 0, 10, '[]'::jsonb),
  ('Shimmer Wall (Black)', 'Shimmer Wall (Black).', 0, cat_shimmer_walls, '/images/products/shimmer-wall-black.jpg', 0, 10, '[]'::jsonb),
  ('Shimmer Wall (Silver)', 'Shimmer Wall (Silver).', 0, cat_shimmer_walls, '/images/products/shimmer-wall-silver.jpg', 0, 10, '[]'::jsonb);

  -- Soft Touch Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_soft_touch_walls, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_soft_touch_walls, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_soft_touch_walls, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Soft Touch Wall (Black)', 'Soft Touch Wall (Black).', 0, cat_soft_touch_walls, '/images/products/soft-touch-wall-black.jpg', 0, 10, '[]'::jsonb);

  -- Bar Counters
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_bar_counters, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_bar_counters, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_bar_counters, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Malibu Bar 6ft', 'Malibu Bar 6ft.', 0, cat_bar_counters, '/images/products/malibu-bar-6ft.jpg', 0, 10, '[]'::jsonb),
  ('Lux Bar', 'Lux Bar.', 0, cat_bar_counters, '/images/products/lux-bar.jpg', 0, 10, '[]'::jsonb),
  ('White CHAMPAGNE WALL', 'White CHAMPAGNE WALL.', 0, cat_bar_counters, '/images/products/white-champagne-wall.jpg', 0, 10, '[]'::jsonb),
  ('Black Champagne Wall', 'Black Champagne Wall.', 0, cat_bar_counters, '/images/products/black-champagne-wall.jpg', 0, 10, '[]'::jsonb),
  ('Walnut laminate bar', 'Walnut laminate bar.', 0, cat_bar_counters, '/images/products/walnut-laminate-bar.jpg', 0, 10, '[]'::jsonb),
  ('White Formica Bar', 'White Formica Bar.', 0, cat_bar_counters, '/images/products/white-formica-bar.jpg', 0, 10, '[]'::jsonb),
  ('Laminate black bar', 'Laminate black bar.', 0, cat_bar_counters, '/images/products/laminate-black-bar.jpg', 0, 10, '[]'::jsonb),
  ('GRASS BAR', 'GRASS BAR.', 0, cat_bar_counters, '/images/products/grass-bar.jpg', 0, 10, '[]'::jsonb);

  -- Bar Stools
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_bar_stools, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_bar_stools, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_bar_stools, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('LUX GOLD BAR STOOL', 'LUX GOLD BAR STOOL.', 0, cat_bar_stools, '/images/products/lux-gold-bar-stool.jpg', 0, 10, '[]'::jsonb),
  ('Stylish Vintage  Barstool 30”', 'Stylish Vintage  Barstool 30”.', 0, cat_bar_stools, '/images/products/stylish-vintage-barstool-30.jpg', 0, 10, '[]'::jsonb),
  ('Stylish Vintage  Barstool 24”', 'Stylish Vintage  Barstool 24”.', 0, cat_bar_stools, '/images/products/stylish-vintage-barstool-24.jpg', 0, 10, '[]'::jsonb),
  ('LUX SILVER BAR STOOL', 'LUX SILVER BAR STOOL.', 0, cat_bar_stools, '/images/products/lux-silver-bar-stool.jpg', 0, 10, '[]'::jsonb),
  ('O Back Gold Bar Stool', 'O Back Gold Bar Stool.', 0, cat_bar_stools, '/images/products/o-back-gold-bar-stool.jpg', 0, 10, '[]'::jsonb);

  -- Bar Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_bar_tables, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_bar_tables, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_bar_tables, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('White cocktail', 'White cocktail.', 0, cat_bar_tables, '/images/products/white-cocktail.jpg', 0, 10, '[]'::jsonb),
  ('Led Champagne table', 'Led Champagne table.', 0, cat_bar_tables, '/images/products/led-champagne-table.jpg', 0, 10, '[]'::jsonb),
  ('Highboy Cocktail Round Spandex Table cover', 'Highboy Cocktail Round Spandex Table cover.', 0, cat_bar_tables, '/images/products/highboy-cocktail-round-spandex-table-cover.jpg', 0, 10, '[]'::jsonb),
  ('COCKTAIL TABLES', 'COCKTAIL TABLES.', 0, cat_bar_tables, '/images/products/cocktail-tables.jpg', 0, 10, '[]'::jsonb),
  ('Spandex Tablecloth for Cocktail Tables', 'Spandex Tablecloth for Cocktail Tables.', 0, cat_bar_tables, '/images/products/spandex-tablecloth-for-cocktail-tables.jpg', 0, 10, '[]'::jsonb),
  ('LED COCKTABLE  TABLE', 'LED COCKTABLE  TABLE.', 0, cat_bar_tables, '/images/products/led-cocktable-table.jpg', 0, 10, '[]'::jsonb),
  ('Trisha Bar Table (Silver)', 'Trisha Bar Table (Silver).', 0, cat_bar_tables, '/images/products/trisha-bar-table-silver.jpg', 0, 10, '[]'::jsonb),
  ('Trisha Bar Table (Gold)', 'Trisha Bar Table (Gold).', 0, cat_bar_tables, '/images/products/trisha-bar-table-gold.jpg', 0, 10, '[]'::jsonb),
  ('Circle Bar Table (Silver)', 'Circle Bar Table (Silver).', 0, cat_bar_tables, '/images/products/circle-bar-table-silver.jpg', 0, 10, '[]'::jsonb),
  ('Circle Bar Table (Gold)', 'Circle Bar Table (Gold).', 0, cat_bar_tables, '/images/products/circle-bar-table-gold.jpg', 0, 10, '[]'::jsonb);

  -- Cake Tables & Stands
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_cake_tables_stands, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_cake_tables_stands, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_cake_tables_stands, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('White Wagon Cart', 'White Wagon Cart.', 0, cat_cake_tables_stands, '/images/products/white-wagon-cart.jpg', 0, 10, '[]'::jsonb),
  ('White Rustic cart', 'White Rustic cart.', 0, cat_cake_tables_stands, '/images/products/white-rustic-cart.jpg', 0, 10, '[]'::jsonb),
  ('LED ROSES TABLE', 'LED ROSES TABLE.', 0, cat_cake_tables_stands, '/images/products/led-roses-table.jpg', 0, 10, '[]'::jsonb),
  ('Squeeze Me Stand (Blue)', 'Squeeze Me Stand (Blue).', 0, cat_cake_tables_stands, '/images/products/squeeze-me-stand-blue.jpg', 0, 10, '[]'::jsonb),
  ('Squeeze Me Stand (Pink)', 'Squeeze Me Stand (Pink).', 0, cat_cake_tables_stands, '/images/products/squeeze-me-stand-pink.jpg', 0, 10, '[]'::jsonb),
  ('GIRL Treat Table', 'GIRL Treat Table.', 0, cat_cake_tables_stands, '/images/products/girl-treat-table.jpg', 0, 10, '[]'::jsonb),
  ('BOY Treat Table', 'BOY Treat Table.', 0, cat_cake_tables_stands, '/images/products/boy-treat-table.jpg', 0, 10, '[]'::jsonb),
  ('Diamond Cake Table (Gold)', 'Diamond Cake Table (Gold).', 0, cat_cake_tables_stands, '/images/products/diamond-cake-table-gold.jpg', 0, 10, '[]'::jsonb);

  -- Decorations & Props
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_decorations_props, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_decorations_props, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_decorations_props, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Green Tree', 'Green Tree.', 0, cat_decorations_props, '/images/products/green-tree.jpg', 0, 10, '[]'::jsonb),
  ('Trio Wedding Gold Arch', 'Trio Wedding Gold Arch.', 0, cat_decorations_props, '/images/products/trio-wedding-gold-arch.jpg', 0, 10, '[]'::jsonb),
  ('Telephone Booth', 'Telephone Booth.', 0, cat_decorations_props, '/images/products/telephone-booth.jpg', 0, 10, '[]'::jsonb),
  ('Zebra', 'Zebra.', 0, cat_decorations_props, '/images/products/zebra.jpg', 0, 10, '[]'::jsonb),
  ('Giraffe', 'Giraffe.', 0, cat_decorations_props, '/images/products/giraffe.jpg', 0, 10, '[]'::jsonb),
  ('Elephant', 'Elephant.', 0, cat_decorations_props, '/images/products/elephant.jpg', 0, 10, '[]'::jsonb),
  ('Table Top Elephant', 'Table Top Elephant.', 0, cat_decorations_props, '/images/products/table-top-elephant.jpg', 0, 10, '[]'::jsonb),
  ('Table Top Elephant', 'Table Top Elephant.', 0, cat_decorations_props, '/images/products/table-top-elephant.jpg', 0, 10, '[]'::jsonb),
  ('Table Top Elephant', 'Table Top Elephant.', 0, cat_decorations_props, '/images/products/table-top-elephant.jpg', 0, 10, '[]'::jsonb),
  ('Gold Number Stand', 'Gold Number Stand.', 0, cat_decorations_props, '/images/products/gold-number-stand.jpg', 0, 10, '[]'::jsonb);

  -- Chairs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_chairs, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_chairs, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_chairs, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('TRANSLUCENT CHIAVARI CHAIR', 'TRANSLUCENT CHIAVARI CHAIR.', 0, cat_chairs, '/images/products/translucent-chiavari-chair.jpg', 0, 10, '[]'::jsonb),
  ('CLEAR ROUND ELEGANCE', 'CLEAR ROUND ELEGANCE.', 0, cat_chairs, '/images/products/clear-round-elegance.jpg', 0, 10, '[]'::jsonb),
  ('Padded Folding Chair', 'Padded Folding Chair.', 0, cat_chairs, '/images/products/padded-folding-chair.jpg', 0, 10, '[]'::jsonb),
  ('BLACK PADDED CHAIR', 'BLACK PADDED CHAIR.', 0, cat_chairs, '/images/products/black-padded-chair.jpg', 0, 10, '[]'::jsonb),
  ('BLACK CHIAVARI CHAIR', 'BLACK CHIAVARI CHAIR.', 0, cat_chairs, '/images/products/black-chiavari-chair.jpg', 0, 10, '[]'::jsonb),
  ('PRIME PINK  ROYALTY CHAIR', 'PRIME PINK  ROYALTY CHAIR.', 0, cat_chairs, '/images/products/prime-pink-royalty-chair.jpg', 0, 10, '[]'::jsonb),
  ('White Samsonite Chair', 'White Samsonite Chair.', 0, cat_chairs, '/images/products/white-samsonite-chair.jpg', 0, 10, '[]'::jsonb),
  ('O Back Gold Chair', 'O Back Gold Chair.', 0, cat_chairs, '/images/products/o-back-gold-chair.jpg', 0, 10, '[]'::jsonb),
  ('O Back Silver Chair', 'O Back Silver Chair.', 0, cat_chairs, '/images/products/o-back-silver-chair.jpg', 0, 10, '[]'::jsonb),
  ('Heart Chair (Gold)', 'Heart Chair (Gold).', 0, cat_chairs, '/images/products/heart-chair-gold.jpg', 0, 10, '[]'::jsonb),
  ('Bamboo Chair (Gold)', 'Bamboo Chair (Gold).', 0, cat_chairs, '/images/products/bamboo-chair-gold.jpg', 0, 10, '[]'::jsonb),
  ('Bamboo Chair (Silver)', 'Bamboo Chair (Silver).', 0, cat_chairs, '/images/products/bamboo-chair-silver.jpg', 0, 10, '[]'::jsonb),
  ('Folding Acrylic Chair (Gold)', 'Folding Acrylic Chair (Gold).', 0, cat_chairs, '/images/products/folding-acrylic-chair-gold.jpg', 0, 10, '[]'::jsonb);

  -- Sofas & Loveseats
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_sofas_loveseats, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_sofas_loveseats, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_sofas_loveseats, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Wave sofa', 'Wave sofa.', 0, cat_sofas_loveseats, '/images/products/wave-sofa.jpg', 0, 10, '[]'::jsonb),
  ('Hendrix Velvet Flared Arm Loveseats', 'Hendrix Velvet Flared Arm Loveseats.', 0, cat_sofas_loveseats, '/images/products/hendrix-velvet-flared-arm-loveseats.jpg', 0, 10, '[]'::jsonb),
  ('Lux Sofa', 'Lux Sofa.', 0, cat_sofas_loveseats, '/images/products/lux-sofa.jpg', 0, 10, '[]'::jsonb),
  ('Cage sofa', 'Cage sofa.', 0, cat_sofas_loveseats, '/images/products/cage-sofa.jpg', 0, 10, '[]'::jsonb),
  ('3 PIECE LUX SET', '3 PIECE LUX SET.', 0, cat_sofas_loveseats, '/images/products/3-piece-lux-set.jpg', 0, 10, '[]'::jsonb),
  ('Lux Pink sofa', 'Lux Pink sofa.', 0, cat_sofas_loveseats, '/images/products/lux-pink-sofa.jpg', 0, 10, '[]'::jsonb),
  ('fancy Royal Sofa', 'fancy Royal Sofa.', 0, cat_sofas_loveseats, '/images/products/fancy-royal-sofa.jpg', 0, 10, '[]'::jsonb),
  ('NUDE SOFA', 'NUDE SOFA.', 0, cat_sofas_loveseats, '/images/products/nude-sofa.jpg', 0, 10, '[]'::jsonb),
  ('Chic Sofa (Black)', 'Chic Sofa (Black).', 0, cat_sofas_loveseats, '/images/products/chic-sofa-black.jpg', 0, 10, '[]'::jsonb),
  ('White Dotted Throne Sofa', 'White Dotted Throne Sofa.', 0, cat_sofas_loveseats, '/images/products/white-dotted-throne-sofa.jpg', 0, 10, '[]'::jsonb);

  -- Kids Backdrops
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_kids_backdrops, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_kids_backdrops, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_kids_backdrops, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Dreamland Train', 'Dreamland Train.', 0, cat_kids_backdrops, '/images/products/dreamland-train.jpg', 0, 10, '[]'::jsonb),
  ('Princess Express Train', 'Princess Express Train.', 0, cat_kids_backdrops, '/images/products/princess-express-train.jpg', 0, 10, '[]'::jsonb),
  ('Story Book', 'Story Book.', 0, cat_kids_backdrops, '/images/products/story-book.jpg', 0, 10, '[]'::jsonb),
  ('Royal Castle', 'Royal Castle.', 0, cat_kids_backdrops, '/images/products/royal-castle.jpg', 0, 10, '[]'::jsonb),
  ('Blast Zone Magic Castle', 'Blast Zone Magic Castle.', 0, cat_kids_backdrops, '/images/products/blast-zone-magic-castle.jpg', 0, 10, '[]'::jsonb);

  -- Kids Chairs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_kids_chairs, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_kids_chairs, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_kids_chairs, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Kids Bow Back Chair', 'Kids Bow Back Chair.', 0, cat_kids_chairs, '/images/products/kids-bow-back-chair.jpg', 0, 10, '[]'::jsonb),
  ('kids Chiavari Blue Chair', 'kids Chiavari Blue Chair.', 0, cat_kids_chairs, '/images/products/kids-chiavari-blue-chair.jpg', 0, 10, '[]'::jsonb),
  ('KIDS White Samsonite Chair', 'KIDS White Samsonite Chair.', 0, cat_kids_chairs, '/images/products/kids-white-samsonite-chair.jpg', 0, 10, '[]'::jsonb),
  ('Kids Bamboo Chair (Pink)', 'Kids Bamboo Chair (Pink).', 0, cat_kids_chairs, '/images/products/kids-bamboo-chair-pink.jpg', 0, 10, '[]'::jsonb);

  -- Kids Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_kids_tables, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_kids_tables, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_kids_tables, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('KIDS 6FT TABLE', 'KIDS 6FT TABLE.', 0, cat_kids_tables, '/images/products/kids-6ft-table.jpg', 0, 10, '[]'::jsonb);

  -- Kids Thrones
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_kids_thrones, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_kids_thrones, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_kids_thrones, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Kids Bow Back Chair', 'Kids Bow Back Chair.', 0, cat_kids_thrones, '/images/products/kids-bow-back-chair.jpg', 0, 10, '[]'::jsonb),
  ('Kids King Throne Chair (White)', 'Kids King Throne Chair (White).', 0, cat_kids_thrones, '/images/products/kids-king-throne-chair-white.jpg', 0, 10, '[]'::jsonb);

  -- LED Signs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_led_signs, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_led_signs, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_led_signs, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Happy Birthday LED Sign', 'Happy Birthday LED Sign.', 0, cat_led_signs, '/images/products/happy-birthday-led-sign.jpg', 0, 10, '[]'::jsonb),
  ('Let''s Party LED Sign', 'Let''s Party LED Sign.', 0, cat_led_signs, '/images/products/let-s-party-led-sign.jpg', 0, 10, '[]'::jsonb);

  -- Lit Letters & Numbers
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_lit_letters_and_numbers, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_lit_letters_and_numbers, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_lit_letters_and_numbers, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('BABY MARQUEE', 'BABY MARQUEE.', 0, cat_lit_letters_and_numbers, '/images/products/baby-marquee.jpg', 0, 10, '[]'::jsonb),
  ('OH BABY MARQUEE', 'OH BABY MARQUEE.', 0, cat_lit_letters_and_numbers, '/images/products/oh-baby-marquee.jpg', 0, 10, '[]'::jsonb),
  ('BLACK MARQUEE NUMBERS', 'BLACK MARQUEE NUMBERS.', 0, cat_lit_letters_and_numbers, '/images/products/black-marquee-numbers.jpg', 0, 10, '[]'::jsonb),
  ('MARQUEE LETTER', 'MARQUEE LETTER.', 0, cat_lit_letters_and_numbers, '/images/products/marquee-letter.jpg', 0, 10, '[]'::jsonb),
  ('LARGE MARQUEE CROSS WITH LIGHT', 'LARGE MARQUEE CROSS WITH LIGHT.', 0, cat_lit_letters_and_numbers, '/images/products/large-marquee-cross-with-light.jpg', 0, 10, '[]'::jsonb),
  ('WHITE MARQUEE NUMBER', 'WHITE MARQUEE NUMBER.', 0, cat_lit_letters_and_numbers, '/images/products/white-marquee-number.jpg', 0, 10, '[]'::jsonb);

  -- Luxury Thrones
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_thrones, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_thrones, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_thrones, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Hendrix Velvet Flared Arm Loveseats', 'Hendrix Velvet Flared Arm Loveseats.', 0, cat_thrones, '/images/products/hendrix-velvet-flared-arm-loveseats.jpg', 0, 10, '[]'::jsonb),
  ('Gold Dust Throne', 'Gold Dust Throne.', 0, cat_thrones, '/images/products/gold-dust-throne.jpg', 0, 10, '[]'::jsonb),
  ('Mid Night Throne', 'Mid Night Throne.', 0, cat_thrones, '/images/products/mid-night-throne.jpg', 0, 10, '[]'::jsonb),
  ('Emerald Pearl Throne', 'Emerald Pearl Throne.', 0, cat_thrones, '/images/products/emerald-pearl-throne.jpg', 0, 10, '[]'::jsonb),
  ('Silver Pearl Throne', 'Silver Pearl Throne.', 0, cat_thrones, '/images/products/silver-pearl-throne.jpg', 0, 10, '[]'::jsonb),
  ('White Peal Throne Chair', 'White Peal Throne Chair.', 0, cat_thrones, '/images/products/white-peal-throne-chair.jpg', 0, 10, '[]'::jsonb),
  ('Red Throne', 'Red Throne.', 0, cat_thrones, '/images/products/red-throne.jpg', 0, 10, '[]'::jsonb),
  ('Kids Velvet Pink Throne', 'Kids Velvet Pink Throne.', 0, cat_thrones, '/images/products/kids-velvet-pink-throne.jpg', 0, 10, '[]'::jsonb),
  ('White Princess Throne Sofa Chair', 'White Princess Throne Sofa Chair.', 0, cat_thrones, '/images/products/white-princess-throne-sofa-chair.jpg', 0, 10, '[]'::jsonb),
  ('King Throne sofa chair', 'King Throne sofa chair.', 0, cat_thrones, '/images/products/king-throne-sofa-chair.jpg', 0, 10, '[]'::jsonb),
  ('Cassie Loveseat (Gold)', 'Cassie Loveseat (Gold).', 0, cat_thrones, '/images/products/cassie-loveseat-gold.jpg', 0, 10, '[]'::jsonb),
  ('Cage Gold Chair (White Cushion)', 'Cage Gold Chair (White Cushion).', 0, cat_thrones, '/images/products/cage-gold-chair-white-cushion.jpg', 0, 10, '[]'::jsonb),
  ('Cage Gold Chair (Black Cushion)', 'Cage Gold Chair (Black Cushion).', 0, cat_thrones, '/images/products/cage-gold-chair-black-cushion.jpg', 0, 10, '[]'::jsonb),
  ('Lux Throne Chair (Black)', 'Lux Throne Chair (Black).', 0, cat_thrones, '/images/products/lux-throne-chair-black.jpg', 0, 10, '[]'::jsonb),
  ('Canopy Throne Chair (White)', 'Canopy Throne Chair (White).', 0, cat_thrones, '/images/products/canopy-throne-chair-white.jpg', 0, 10, '[]'::jsonb),
  ('Lux Throne Chair (Gold)', 'Lux Throne Chair (Gold).', 0, cat_thrones, '/images/products/lux-throne-chair-gold.jpg', 0, 10, '[]'::jsonb),
  ('Lux Throne Chair (Silver)', 'Lux Throne Chair (Silver).', 0, cat_thrones, '/images/products/lux-throne-chair-silver.jpg', 0, 10, '[]'::jsonb);

  -- Pedestals & Plinths
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_pedestals_plinths, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_pedestals_plinths, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_pedestals_plinths, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Slatted  Pedestal', 'Slatted  Pedestal.', 0, cat_pedestals_plinths, '/images/products/slatted-pedestal.jpg', 0, 10, '[]'::jsonb),
  ('Sliver Pedestal', 'Sliver Pedestal.', 0, cat_pedestals_plinths, '/images/products/sliver-pedestal.jpg', 0, 10, '[]'::jsonb),
  ('BLACK COLUMNS', 'BLACK COLUMNS.', 0, cat_pedestals_plinths, '/images/products/black-columns.jpg', 0, 10, '[]'::jsonb),
  ('3 PIECE SET OF METAL CYLINDER PEDESTALS DISPLAY - SILVER', '3 PIECE SET OF METAL CYLINDER PEDESTALS DISPLAY - SILVER.', 0, cat_pedestals_plinths, '/images/products/3-piece-set-of-metal-cylinder-pedestals-display-silver.jpg', 0, 10, '[]'::jsonb),
  ('Royal Blue Columns', 'Royal Blue Columns.', 0, cat_pedestals_plinths, '/images/products/royal-blue-columns.jpg', 0, 10, '[]'::jsonb),
  ('Ruth Pedestals (Gold)', 'Ruth Pedestals (Gold).', 0, cat_pedestals_plinths, '/images/products/ruth-pedestals-gold.jpg', 0, 10, '[]'::jsonb),
  ('Gold Square Pedestals', 'Gold Square Pedestals.', 0, cat_pedestals_plinths, '/images/products/gold-square-pedestals.jpg', 0, 10, '[]'::jsonb),
  ('Ruth Pedestals (Silver)', 'Ruth Pedestals (Silver).', 0, cat_pedestals_plinths, '/images/products/ruth-pedestals-silver.jpg', 0, 10, '[]'::jsonb),
  ('Cylinder Acrylic Pedestals (White)', 'Cylinder Acrylic Pedestals (White).', 0, cat_pedestals_plinths, '/images/products/cylinder-acrylic-pedestals-white.jpg', 0, 10, '[]'::jsonb);

  -- Shelves
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_shelves, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_shelves, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_shelves, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Charice Shelf', 'Charice Shelf.', 0, cat_shelves, '/images/products/charice-shelf.jpg', 0, 10, '[]'::jsonb);

  -- Sweets Carts
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_sweets_carts, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_sweets_carts, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_sweets_carts, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Prime cycle cart', 'Prime cycle cart.', 0, cat_sweets_carts, '/images/products/prime-cycle-cart.jpg', 0, 10, '[]'::jsonb),
  ('Pumpkin Cart', 'Pumpkin Cart.', 0, cat_sweets_carts, '/images/products/pumpkin-cart.jpg', 0, 10, '[]'::jsonb),
  ('White Rustic cart', 'White Rustic cart.', 0, cat_sweets_carts, '/images/products/white-rustic-cart.jpg', 0, 10, '[]'::jsonb),
  ('All White Cart', 'All White Cart.', 0, cat_sweets_carts, '/images/products/all-white-cart.jpg', 0, 10, '[]'::jsonb),
  ('White Wagon Cart', 'White Wagon Cart.', 0, cat_sweets_carts, '/images/products/white-wagon-cart.jpg', 0, 10, '[]'::jsonb);

  -- Charger Plates
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_charger_plates, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_charger_plates, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_charger_plates, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Plain Red Chargers', 'Plain Red Chargers.', 0, cat_charger_plates, '/images/products/plain-red-chargers.jpg', 0, 10, '[]'::jsonb),
  ('Eclipse Gold Charger', 'Eclipse Gold Charger.', 0, cat_charger_plates, '/images/products/eclipse-gold-charger.jpg', 0, 10, '[]'::jsonb),
  ('Natural Tone Charger', 'Natural Tone Charger.', 0, cat_charger_plates, '/images/products/natural-tone-charger.jpg', 0, 10, '[]'::jsonb),
  ('Reef Charger Plate (Pink)', 'Reef Charger Plate (Pink).', 0, cat_charger_plates, '/images/products/reef-charger-plate-pink.jpg', 0, 10, '[]'::jsonb),
  ('Reef Charger Plate (Navy Blue)', 'Reef Charger Plate (Navy Blue).', 0, cat_charger_plates, '/images/products/reef-charger-plate-navy-blue.jpg', 0, 10, '[]'::jsonb),
  ('Reef Charger Plate (Purple)', 'Reef Charger Plate (Purple).', 0, cat_charger_plates, '/images/products/reef-charger-plate-purple.jpg', 0, 10, '[]'::jsonb),
  ('Reef Charger Plate (Gold)', 'Reef Charger Plate (Gold).', 0, cat_charger_plates, '/images/products/reef-charger-plate-gold.jpg', 0, 10, '[]'::jsonb),
  ('Reef Charger Plate (Black)', 'Reef Charger Plate (Black).', 0, cat_charger_plates, '/images/products/reef-charger-plate-black.jpg', 0, 10, '[]'::jsonb),
  ('Reef Charger Plate (Aqua Blue)', 'Reef Charger Plate (Aqua Blue).', 0, cat_charger_plates, '/images/products/reef-charger-plate-aqua-blue.jpg', 0, 10, '[]'::jsonb),
  ('Reef Charger Plate (Baby Blue)', 'Reef Charger Plate (Baby Blue).', 0, cat_charger_plates, '/images/products/reef-charger-plate-baby-blue.jpg', 0, 10, '[]'::jsonb),
  ('Reef Charger Plate (Burgundy)', 'Reef Charger Plate (Burgundy).', 0, cat_charger_plates, '/images/products/reef-charger-plate-burgundy.jpg', 0, 10, '[]'::jsonb),
  ('Reef Charger Plate (Silver)', 'Reef Charger Plate (Silver).', 0, cat_charger_plates, '/images/products/reef-charger-plate-silver.jpg', 0, 10, '[]'::jsonb);

  -- Flowers & Centerpieces
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_centerpeices_2, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_centerpeices_2, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_centerpeices_2, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
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
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_table_linens, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_table_linens, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_table_linens, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('SOLID STRIPE TABLECLOTH', 'SOLID STRIPE TABLECLOTH.', 0, cat_table_linens, '/images/products/solid-stripe-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('BEETHOVEN TABLECLOTH', 'BEETHOVEN TABLECLOTH.', 0, cat_table_linens, '/images/products/beethoven-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('CHECKS TABLECLOTH', 'CHECKS TABLECLOTH.', 0, cat_table_linens, '/images/products/checks-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('PLAID TABLECLOTH', 'PLAID TABLECLOTH.', 0, cat_table_linens, '/images/products/plaid-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('AWNING STRIPE TABLECLOTH', 'AWNING STRIPE TABLECLOTH.', 0, cat_table_linens, '/images/products/awning-stripe-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('VELVET TABLECLOTH', 'VELVET TABLECLOTH.', 0, cat_table_linens, 'https://placehold.co/600x400?text=VELVET%20TABLECLOTH', 0, 10, '[]'::jsonb),
  ('RACE CAR TABLECLOTH', 'RACE CAR TABLECLOTH.', 0, cat_table_linens, '/images/products/race-car-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('SEQUINS TABLECLOTH', 'SEQUINS TABLECLOTH.', 0, cat_table_linens, '/images/products/sequins-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('Flower on Sequin Taffeta Tablecloth 120" Round - Blush/Rose Gold', 'Flower on Sequin Taffeta Tablecloth 120" Round - Blush/Rose Gold.', 0, cat_table_linens, '/images/products/flower-on-sequin-taffeta-tablecloth-120-round-blush-rose-gold.jpg', 0, 10, '[]'::jsonb),
  ('Large Rosette Flower Tablecloth', 'Large Rosette Flower Tablecloth.', 0, cat_table_linens, '/images/products/large-rosette-flower-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('ROUND PINTUCK TABLECLOTH', 'ROUND PINTUCK TABLECLOTH.', 0, cat_table_linens, '/images/products/round-pintuck-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('ROUND PAYETTE SEQUIN TABLECLOTH IRIDESCENT', 'ROUND PAYETTE SEQUIN TABLECLOTH IRIDESCENT.', 0, cat_table_linens, '/images/products/round-payette-sequin-tablecloth-iridescent.jpg', 0, 10, '[]'::jsonb),
  ('1.	RECTANGULAR POLYESTER TABLECLOTH IN DIFFERENT COLOR', '1.	RECTANGULAR POLYESTER TABLECLOTH IN DIFFERENT COLOR.', 0, cat_table_linens, '/images/products/1-rectangular-polyester-tablecloth-in-different-color.jpg', 0, 10, '[]'::jsonb),
  ('ROUND POLYESTER TABLECLOTH', 'ROUND POLYESTER TABLECLOTH.', 0, cat_table_linens, '/images/products/round-polyester-tablecloth.jpg', 0, 10, '[]'::jsonb),
  ('ROUND SILK EMBROIDERED POLYESTER TABLECLOTH', 'ROUND SILK EMBROIDERED POLYESTER TABLECLOTH.', 0, cat_table_linens, '/images/products/round-silk-embroidered-polyester-tablecloth.jpg', 0, 10, '[]'::jsonb);

  -- Napkins & Rings
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_table_napkins_and_rings, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_table_napkins_and_rings, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_table_napkins_and_rings, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Burnt Orange)', 'Table Napkin (Burnt Orange).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-burnt-orange.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Emerald Green)', 'Table Napkin (Emerald Green).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-emerald-green.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Aqua Blue)', 'Table Napkin (Aqua Blue).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-aqua-blue.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Lavender)', 'Table Napkin (Lavender).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-lavender.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Medium Pink)', 'Table Napkin (Medium Pink).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-medium-pink.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Silver)', 'Table Napkin (Silver).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-silver.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Purple)', 'Table Napkin (Purple).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-purple.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (White)', 'Table Napkin (White).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-white.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Champagne)', 'Table Napkin (Champagne).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-champagne.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Coral)', 'Table Napkin (Coral).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-coral.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Magenta Violet)', 'Table Napkin (Magenta Violet).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-magenta-violet.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Pewter)', 'Table Napkin (Pewter).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-pewter.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Gold Antique)', 'Table Napkin (Gold Antique).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-gold-antique.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Burgundy)', 'Table Napkin (Burgundy).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-burgundy.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Chocolate Brown)', 'Table Napkin (Chocolate Brown).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-chocolate-brown.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Apple Red)', 'Table Napkin (Apple Red).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-apple-red.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Black)', 'Table Napkin (Black).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-black.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Royal Blue)', 'Table Napkin (Royal Blue).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-royal-blue.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Bright Gold)', 'Table Napkin (Bright Gold).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-bright-gold.jpg', 0, 10, '[]'::jsonb),
  ('Table Napkin (Kelly Green)', 'Table Napkin (Kelly Green).', 0, cat_table_napkins_and_rings, '/images/products/table-napkin-kelly-green.jpg', 0, 10, '[]'::jsonb);

  -- Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_dining_tables, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_dining_tables, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_dining_tables, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('White lux table', 'White lux table.', 0, cat_dining_tables, '/images/products/white-lux-table.jpg', 0, 10, '[]'::jsonb),
  ('BANQUET ROUND PARTY TABLES', 'BANQUET ROUND PARTY TABLES.', 0, cat_dining_tables, '/images/products/banquet-round-party-tables.jpg', 0, 10, '[]'::jsonb),
  ('RECTANGULAR BANQUET TABLES', 'RECTANGULAR BANQUET TABLES.', 0, cat_dining_tables, '/images/products/rectangular-banquet-tables.jpg', 0, 10, '[]'::jsonb),
  ('gold mirrior table', 'gold mirrior table.', 0, cat_dining_tables, '/images/products/gold-mirrior-table.jpg', 0, 10, '[]'::jsonb),
  ('Gold Serpentine table', 'Gold Serpentine table.', 0, cat_dining_tables, '/images/products/gold-serpentine-table.jpg', 0, 10, '[]'::jsonb),
  ('Vogue Triangular Table', 'Vogue Triangular Table.', 0, cat_dining_tables, '/images/products/vogue-triangular-table.jpg', 0, 10, '[]'::jsonb),
  ('Fab Glass Table', 'Fab Glass Table.', 0, cat_dining_tables, '/images/products/fab-glass-table.jpg', 0, 10, '[]'::jsonb),
  ('Clear Rectangular Table', 'Clear Rectangular Table.', 0, cat_dining_tables, '/images/products/clear-rectangular-table.jpg', 0, 10, '[]'::jsonb),
  ('Olivia Rectangular Table', 'Olivia Rectangular Table.', 0, cat_dining_tables, '/images/products/olivia-rectangular-table.jpg', 0, 10, '[]'::jsonb);

  -- Tents
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Ultimate Party in a Box', 'Ultimate Party in a Box.', 0, cat_tent, '/images/products/ultimate-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Baby Shower Party in a Box', 'Baby Shower Party in a Box.', 0, cat_tent, '/images/products/baby-shower-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Graduation Party in a Box', 'Graduation Party in a Box.', 0, cat_tent, '/images/products/graduation-party-in-a-box.jpg', 0, 10, '[]'::jsonb),
  ('Pickup Security Deposit', 'Pickup Security Deposit.', 0, cat_tent, '/images/products/pickup-security-deposit.jpg', 0, 10, '[]'::jsonb),
  ('Tent Installation', 'Tent Installation.', 0, cat_tent, '/images/products/tent-installation.jpg', 0, 10, '[]'::jsonb),
  ('Instillation', 'Instillation.', 0, cat_tent, '/images/products/instillation.jpg', 0, 10, '[]'::jsonb),
  ('White Bounce House  - 3in1  bouncey House for Kids', 'White Bounce House  - 3in1  bouncey House for Kids.', 0, cat_tent, '/images/products/white-bounce-house-3in1-bouncey-house-for-kids.jpg', 0, 10, '[]'::jsonb),
  ('OUTDOOR SETTINGS #1', 'OUTDOOR SETTINGS #1.', 0, cat_tent, '/images/products/outdoor-settings-1.jpg', 0, 10, '[]'::jsonb),
  ('OUTDOOR SETTINGS #2', 'OUTDOOR SETTINGS #2.', 0, cat_tent, '/images/products/outdoor-settings-2.jpg', 0, 10, '[]'::jsonb),
  ('LED CABANA', 'LED CABANA.', 0, cat_tent, '/images/products/led-cabana.jpg', 0, 10, '[]'::jsonb),
  ('SINGLE CABANA W/SOFA & TABLE', 'SINGLE CABANA W/SOFA & TABLE.', 0, cat_tent, '/images/products/single-cabana-w-sofa-table.jpg', 0, 10, '[]'::jsonb),
  ('10X10 TENT', '10X10 TENT.', 0, cat_tent, '/images/products/10x10-tent.jpg', 0, 10, '[]'::jsonb),
  ('20X30 TENT', '20X30 TENT.', 0, cat_tent, '/images/products/20x30-tent.jpg', 0, 10, '[]'::jsonb),
  ('OUTDOOR PACKAGE #4', 'OUTDOOR PACKAGE #4.', 0, cat_tent, '/images/products/outdoor-package-4.jpg', 0, 10, '[]'::jsonb),
  ('OUTDOOR PACKAGE #3', 'OUTDOOR PACKAGE #3.', 0, cat_tent, '/images/products/outdoor-package-3.jpg', 0, 10, '[]'::jsonb),
  ('OUTDOOR PACKAGE #2', 'OUTDOOR PACKAGE #2.', 0, cat_tent, '/images/products/outdoor-package-2.jpg', 0, 10, '[]'::jsonb),
  ('OUTDOOR PACKAGE #1', 'OUTDOOR PACKAGE #1.', 0, cat_tent, '/images/products/outdoor-package-1.jpg', 0, 10, '[]'::jsonb),
  ('Fringe Umbrella', 'Fringe Umbrella.', 0, cat_tent, '/images/products/fringe-umbrella.jpg', 0, 10, '[]'::jsonb),
  ('Market Umbrella', 'Market Umbrella.', 0, cat_tent, '/images/products/market-umbrella.jpg', 0, 10, '[]'::jsonb),
  ('20x 40 Tent', '20x 40 Tent.', 0, cat_tent, '/images/products/20x-40-tent.jpg', 0, 10, '[]'::jsonb),
  ('Tent 20x20', 'Tent 20x20.', 0, cat_tent, '/images/products/tent-20x20.jpg', 0, 10, '[]'::jsonb);

END $$;

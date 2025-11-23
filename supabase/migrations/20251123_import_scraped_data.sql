-- Migration to import scraped data from primeluxevents.com

-- Create Categories
DO $$
DECLARE
  -- Batch 0 (Initial)
  cat_chairs uuid;
  cat_tables uuid;
  cat_backdrops uuid;
  cat_bar_stools uuid;
  
  -- Batch 1 (Walls & Decor)
  cat_flower_walls uuid;
  cat_shimmer_walls uuid;
  cat_soft_touch_walls uuid;
  cat_decor_props uuid;
  cat_led_signs uuid;
  cat_lit_letters uuid;

  -- Batch 2 (Furniture & Kids)
  cat_bar_counters uuid;
  cat_bar_tables uuid;
  cat_benches uuid;
  cat_sofas uuid;
  cat_kids_backdrops uuid;
  cat_kids_chairs uuid;
  cat_kids_tables uuid;
  cat_kids_thrones uuid;

  -- Batch 3 (Table Settings & Misc)
  cat_charger_plates uuid;
  cat_dinnerware uuid;
  cat_flowers uuid;
  cat_linens uuid;
  cat_napkins uuid;
  cat_misc uuid;
  cat_pedestals uuid;
  cat_shelves uuid;
  cat_sweets_carts uuid;

  -- Batch 4 (Missing Categories)
  cat_flooring uuid;
  cat_buffet uuid;
  cat_cake_tables uuid;
  cat_chafing uuid;
  cat_cooking uuid;
  cat_tents uuid;

BEGIN

  -- ==========================================
  -- CREATE CATEGORIES
  -- ==========================================

  -- Chairs
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Chairs', 'chairs', 'Elegant seating for every occasion.', 'https://placehold.co/600x400?text=Chairs', true)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_chairs;

  -- Tables
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Tables', 'tables', 'Dining and banquet tables.', 'https://placehold.co/600x400?text=Tables', true)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_tables;

  -- Backdrops & Panels
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Backdrops & Panels', 'backdrops-panels', 'Stunning backdrops for photos and decor.', 'https://placehold.co/600x400?text=Backdrops', true)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_backdrops;

  -- Bar Stools
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Bar Stools', 'bar-stools', 'Stylish bar seating.', 'https://placehold.co/600x400?text=Bar+Stools', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_bar_stools;

  -- Flower Walls
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Flower Walls', 'flower-walls', 'Beautiful floral backdrops.', 'https://placehold.co/600x400?text=Flower+Walls', true)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_flower_walls;

  -- Shimmer Walls
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Shimmer Walls', 'shimmer-walls', 'Glittering shimmer walls.', 'https://placehold.co/600x400?text=Shimmer+Walls', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_shimmer_walls;

  -- Soft Touch Walls
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Soft Touch Walls', 'soft-touch-walls', 'Velvet and soft texture walls.', 'https://placehold.co/600x400?text=Soft+Touch+Walls', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_soft_touch_walls;

  -- Decorations Props
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Decorations & Props', 'decorations-props', 'Unique props for your event.', 'https://placehold.co/600x400?text=Decor+Props', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_decor_props;

  -- LED Signs
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('LED Signs', 'led-signs', 'Bright neon LED signs.', 'https://placehold.co/600x400?text=LED+Signs', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_led_signs;

  -- Lit Letters and Numbers
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Lit Letters & Numbers', 'lit-letters-and-numbers', 'Marquee letters and numbers.', 'https://placehold.co/600x400?text=Marquee', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_lit_letters;

  -- Bar Counters
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Bar Counters', 'bar-counters', 'Portable bars for events.', 'https://placehold.co/600x400?text=Bar+Counters', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_bar_counters;

  -- Bar Tables
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Bar Tables', 'bar-tables', 'Cocktail and high-top tables.', 'https://placehold.co/600x400?text=Bar+Tables', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_bar_tables;

  -- Benches & Ottomans
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Benches & Ottomans', 'benches-ottomans', 'Comfortable lounge seating.', 'https://placehold.co/600x400?text=Benches', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_benches;

  -- Sofas & Loveseats
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Sofas & Loveseats', 'sofas-loveseats', 'Luxury sofas and loveseats.', 'https://placehold.co/600x400?text=Sofas', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_sofas;

  -- Kids Backdrops
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Kids Backdrops', 'kids-backdrops', 'Fun backdrops for kids parties.', 'https://placehold.co/600x400?text=Kids+Backdrops', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_kids_backdrops;

  -- Kids Chairs
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Kids Chairs', 'kids-chairs', 'Seating sized for children.', 'https://placehold.co/600x400?text=Kids+Chairs', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_kids_chairs;

  -- Kids Tables
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Kids Tables', 'kids-tables', 'Tables sized for children.', 'https://placehold.co/600x400?text=Kids+Tables', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_kids_tables;

  -- Kids Thrones
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Kids Thrones', 'kids-thrones', 'Special throne chairs for kids.', 'https://placehold.co/600x400?text=Kids+Thrones', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_kids_thrones;

  -- Charger Plates
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Charger Plates', 'charger-plates', 'Decorative charger plates.', 'https://placehold.co/600x400?text=Charger+Plates', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_charger_plates;

  -- Dinnerware
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Dinnerware', 'dinnerware', 'Plates, glasses, and cutlery.', 'https://placehold.co/600x400?text=Dinnerware', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_dinnerware;

  -- Flowers & Centerpieces
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Flowers & Centerpieces', 'flowers-centerpieces', 'Floral arrangements and centerpieces.', 'https://placehold.co/600x400?text=Flowers', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_flowers;

  -- Table Linens
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Table Linens', 'table-linens', 'Tablecloths and runners.', 'https://placehold.co/600x400?text=Linens', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_linens;

  -- Table Napkins and Rings
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Napkins & Rings', 'table-napkins-rings', 'Napkins and napkin rings.', 'https://placehold.co/600x400?text=Napkins', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_napkins;

  -- Misc
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Misc', 'misc', 'Miscellaneous rental items.', 'https://placehold.co/600x400?text=Misc', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_misc;

  -- Pedestals & Plinths
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Pedestals & Plinths', 'pedestals-plinths', 'Display pedestals and plinths.', 'https://placehold.co/600x400?text=Pedestals', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_pedestals;

  -- Shelves
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Shelves', 'shelves', 'Display shelves.', 'https://placehold.co/600x400?text=Shelves', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_shelves;

  -- Sweets Carts
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Sweets Carts', 'sweets-carts', 'Carts for sweets and displays.', 'https://placehold.co/600x400?text=Sweets+Carts', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_sweets_carts;

  -- Flooring
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Flooring & Staging', 'flooring-staging', 'Dance floors and staging.', 'https://placehold.co/600x400?text=Flooring', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_flooring;

  -- Buffet
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Buffet Service', 'buffet-service', 'Buffet equipment and stands.', 'https://placehold.co/600x400?text=Buffet', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_buffet;

  -- Cake Tables
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Cake Tables', 'cake-tables', 'Tables for cakes and desserts.', 'https://placehold.co/600x400?text=Cake+Tables', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_cake_tables;

  -- Chafing Dishes
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Chafing Dishes', 'chafing-dishes', 'Food warmers and chafers.', 'https://placehold.co/600x400?text=Chafing+Dishes', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_chafing;

  -- Cooking
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Cooking & Prep', 'cooking-prep', 'Kitchen and cooking equipment.', 'https://placehold.co/600x400?text=Cooking', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_cooking;

  -- Tents
  INSERT INTO categories (name, slug, description, image_url, is_featured)
  VALUES ('Tents', 'tents', 'Outdoor tents and canopies.', 'https://placehold.co/600x400?text=Tents', false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_tents;


  -- ==========================================
  -- INSERT PRODUCTS
  -- ==========================================

    -- Chairs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Bamboo Chair', 'Bamboo Chair.', 700, cat_chairs, 'https://placehold.co/600x400?text=Bamboo+Chair+(Gold)', 700, 10, '[{"id": "color", "name": "Color", "options": [{"id": "gold", "label": "Gold", "priceAdjustment": 0}, {"id": "silver", "label": "Silver", "priceAdjustment": 0}]}]'::jsonb),
  ('Chiavari Chair', 'Chiavari Chair.', 700, cat_chairs, 'https://placehold.co/600x400?text=TRANSLUCENT+CHIAVARI+CHAIR', 700, 10, '[{"id": "color", "name": "Color", "options": [{"id": "translucent", "label": "Translucent", "priceAdjustment": 0}, {"id": "black", "label": "Black", "priceAdjustment": 0}]}]'::jsonb),
  ('Folding Acrylic Chair (gold)', 'Folding Acrylic Chair (gold).', 1125, cat_chairs, 'https://placehold.co/600x400?text=Folding+Acrylic+Chair+(Gold)', 1125, 10, '[]'::jsonb),
  ('Heart Chair (gold)', 'Heart Chair (gold).', 1200, cat_chairs, 'https://placehold.co/600x400?text=Heart+Chair+(Gold)', 1200, 10, '[]'::jsonb),
  ('O Back Chair', 'O Back Chair.', 1800, cat_chairs, 'https://placehold.co/600x400?text=O+Back+Gold+Chair', 1800, 10, '[{"id": "color", "name": "Color", "options": [{"id": "gold", "label": "Gold", "priceAdjustment": 0}, {"id": "silver", "label": "Silver", "priceAdjustment": 0}]}]'::jsonb),
  ('Black Padded Chair', 'Black Padded Chair.', 350, cat_chairs, 'https://placehold.co/600x400?text=BLACK+PADDED+CHAIR', 350, 10, '[]'::jsonb),
  ('Prime Pink Royalty Chair', 'Prime Pink Royalty Chair.', 1440, cat_chairs, 'https://placehold.co/600x400?text=PRIME+PINK+ROYALTY+CHAIR', 1440, 10, '[]'::jsonb),
  ('Padded Folding Chair', 'Padded Folding Chair.', 350, cat_chairs, 'https://placehold.co/600x400?text=Padded+Folding+Chair', 350, 10, '[]'::jsonb),
  ('Clear Round Elegance', 'Clear Round Elegance.', 750, cat_chairs, 'https://placehold.co/600x400?text=CLEAR+ROUND+ELEGANCE', 750, 10, '[]'::jsonb),
  ('White Samsonite Chair', 'White Samsonite Chair.', 250, cat_chairs, 'https://placehold.co/600x400?text=White+Samsonite+Chair', 250, 10, '[]'::jsonb);


  -- Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Banquet Round Party Tables', 'Banquet Round Party Tables.', 1100, cat_tables, 'https://placehold.co/600x400?text=BANQUET+ROUND+PARTY+TABLES', 1100, 50, '[]'::jsonb),
  ('Fab Glass Table', 'Fab Glass Table.', 25000, cat_tables, 'https://placehold.co/600x400?text=Fab+Glass+Table', 25000, 50, '[]'::jsonb),
  ('Olivia Rectangular Table', 'Olivia Rectangular Table.', 35000, cat_tables, 'https://placehold.co/600x400?text=Olivia+Rectangular+Table', 35000, 50, '[]'::jsonb),
  ('Rectangular Banquet Tables', 'Rectangular Banquet Tables.', 1100, cat_tables, 'https://placehold.co/600x400?text=RECTANGULAR+BANQUET+TABLES', 1100, 50, '[]'::jsonb),
  ('Clear Rectangular Table', 'Clear Rectangular Table.', 25000, cat_tables, 'https://placehold.co/600x400?text=Clear+Rectangular+Table', 25000, 50, '[]'::jsonb),
  ('Gold Serpentine Table', 'Gold Serpentine Table.', 22500, cat_tables, 'https://placehold.co/600x400?text=Gold+Serpentine+table', 22500, 50, '[]'::jsonb),
  ('Vogue Triangular Table', 'Vogue Triangular Table.', 35000, cat_tables, 'https://placehold.co/600x400?text=Vogue+Triangular+Table', 35000, 50, '[]'::jsonb),
  ('White Lux Table', 'White Lux Table.', 1100, cat_tables, 'https://placehold.co/600x400?text=White+lux+table', 1100, 50, '[]'::jsonb),
  ('Gold Mirrior Table', 'Gold Mirrior Table.', 25000, cat_tables, 'https://placehold.co/600x400?text=gold+mirrior+table', 25000, 50, '[]'::jsonb);


-- Backdrops
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Alice Flower Box 6ft x 4ft', 'Alice Flower Box 6ft x 4ft.', 35000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_f4b792a69c944adca8bf39fdc5049db5~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_f4b792a69c944adca8bf39fdc5049db5~mv2.jpg', 35000, 10, '[]'::jsonb),
  ('Ana Set', 'Ana Set.', 60000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_44ec157181004e7eb71c5e932d5b11f8~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_44ec157181004e7eb71c5e932d5b11f8~mv2.jpg', 60000, 10, '[]'::jsonb),
  ('Boxwood Wall 6ft x 3ft', 'Boxwood Wall 6ft x 3ft.', 22500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_a58afd965db24fa086929fab3b00571a~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_a58afd965db24fa086929fab3b00571a~mv2.png', 22500, 10, '[]'::jsonb),
  ('Clover Wave Acrh', 'Clover Wave Acrh.', 27500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_a0ed9e68ba844511805208fe9b1ce21d~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_a0ed9e68ba844511805208fe9b1ce21d~mv2.png', 27500, 10, '[]'::jsonb),
  ('F&m Arch Wall', 'F&m Arch Wall.', 15000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_9d51ac5ad17f4048a607e3989f4d6c15~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_9d51ac5ad17f4048a607e3989f4d6c15~mv2.jpg', 15000, 10, '[]'::jsonb),
  ('Fanta Shelf Wall | 8ft x 8ft', 'Fanta Shelf Wall | 8ft x 8ft.', 27500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_dcf9e12c7a54464c82e7594cae4f23e5~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_dcf9e12c7a54464c82e7594cae4f23e5~mv2.png', 27500, 10, '[]'::jsonb),
  ('Fresh Kicks Display 6ft', 'Fresh Kicks Display 6ft.', 22500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_1ffbd887af024dd2b4501eadfbfa62d4~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_1ffbd887af024dd2b4501eadfbfa62d4~mv2.jpg', 22500, 10, '[]'::jsonb),
  ('Jolie"s Backdrop', 'Jolie"s Backdrop.', 65000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_81e9c17f83b64f7fa5ec01fffde8a332~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_81e9c17f83b64f7fa5ec01fffde8a332~mv2.jpg', 65000, 10, '[]'::jsonb),
  ('Luxe Tote', 'Luxe Tote.', 65000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_7ac2093b20774d64805374ab07dbec48~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_7ac2093b20774d64805374ab07dbec48~mv2.png', 65000, 10, '[]'::jsonb),
  ('Moon 7ft', 'Moon 7ft.', 17500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_76b247dbc6e44e9b90be6eef0acc8768~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_76b247dbc6e44e9b90be6eef0acc8768~mv2.png', 17500, 10, '[]'::jsonb),
  ('Rustic Red Barn Wall', 'Rustic Red Barn Wall.', 27500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_b79c0f9d01804a95bc3b22c179a1bac0~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_b79c0f9d01804a95bc3b22c179a1bac0~mv2.png', 27500, 10, '[]'::jsonb),
  ('Santorini Wall Package', 'Santorini Wall Package.', 100000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_d4b38484fc8f4dff9a60afc21e435e52~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_d4b38484fc8f4dff9a60afc21e435e52~mv2.png', 100000, 10, '[]'::jsonb),
  ('Sapphire Acrh', 'Sapphire Acrh.', 25000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_7e5bde18cb914fb2a26c5af24003c4fb~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_7e5bde18cb914fb2a26c5af24003c4fb~mv2.png', 25000, 10, '[]'::jsonb),
  ('Scottsdale Arch', 'Scottsdale Arch.', 37500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_c74ec89aecc1453c9483f15c759ea512~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_c74ec89aecc1453c9483f15c759ea512~mv2.png', 37500, 10, '[]'::jsonb),
  ('Store Front', 'Store Front.', 45000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_0d85b7b282504b0cbe2e48fef8da89bb~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_0d85b7b282504b0cbe2e48fef8da89bb~mv2.png', 45000, 10, '[]'::jsonb),
  ('Story Book', 'Story Book.', 27500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_a9fc3b4477ef4593994344b4e222a9aa~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_a9fc3b4477ef4593994344b4e222a9aa~mv2.png', 27500, 10, '[]'::jsonb),
  ('Sugar Blossom Patisserie 🌸🍩', 'Sugar Blossom Patisserie 🌸🍩.', 50000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_6a2669ec7f3548af802309eccd44ec5f~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_6a2669ec7f3548af802309eccd44ec5f~mv2.png', 50000, 10, '[]'::jsonb),
  ('The Crain Wall', 'The Crain Wall.', 12500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_c2ba7100b4b248cba24693813efa9b18~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_c2ba7100b4b248cba24693813efa9b18~mv2.png', 12500, 10, '[]'::jsonb),
  ('Trio Wedding Gold Arch', 'Trio Wedding Gold Arch.', 105000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_54f2bd57be634107a4e786290f28d004~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_54f2bd57be634107a4e786290f28d004~mv2.png', 105000, 10, '[]'::jsonb),
  ('Waves of Elegance Backdrop 8x8ft', 'Waves of Elegance Backdrop 8x8ft.', 45000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_07f5bc9b83214effac3c4f5241d59128~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_07f5bc9b83214effac3c4f5241d59128~mv2.jpg', 45000, 10, '[]'::jsonb);


-- Bar Stools
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Lux Bar Stool', 'Lux Bar Stool.', 2500, cat_bar_stools, 'https://placehold.co/600x400?text=LUX+GOLD+BAR+STOOL', 2500, 10, '[{"id": "color", "name": "Color", "options": [{"id": "gold", "label": "Gold", "priceAdjustment": 0}, {"id": "silver", "label": "Silver", "priceAdjustment": 0}]}]'::jsonb),
  ('O Back Gold Bar Stool', 'O Back Gold Bar Stool.', 2500, cat_bar_stools, 'https://placehold.co/600x400?text=O+Back+Gold+Bar+Stool', 2500, 10, '[]'::jsonb),
  ('Stylish Vintage Barstool 24”', 'Stylish Vintage Barstool 24”.', 1019, cat_bar_stools, 'https://placehold.co/600x400?text=Stylish+Vintage+Barstool+24”', 1019, 10, '[]'::jsonb),
  ('Stylish Vintage Barstool 30”', 'Stylish Vintage Barstool 30”.', 1200, cat_bar_stools, 'https://placehold.co/600x400?text=Stylish+Vintage+Barstool+30”', 1200, 10, '[]'::jsonb);


  -- Flower Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Flower Wall & Balloon', 'Flower Wall & Balloon.', 52200, cat_flower_walls, 'https://placehold.co/600x400?text=FLOWER+WALL+&+BALLOON', 52200, 10, '[]'::jsonb),
  ('Red Flower Wall Backdrop', 'Red Flower Wall Backdrop.', 40000, cat_flower_walls, 'https://placehold.co/600x400?text=RED+FLOWER+WALL+BACKDROP', 40000, 10, '[]'::jsonb),
  ('Flower Wall (touch of Pink)', 'Flower Wall (touch of Pink).', 25000, cat_flower_walls, 'https://placehold.co/600x400?text=Flower+Wall+(Touch+of+Pink)', 25000, 10, '[]'::jsonb),
  ('Grand Flower Wall Backdrop', 'Grand Flower Wall Backdrop.', 40000, cat_flower_walls, 'https://placehold.co/600x400?text=Grand+Flower+Wall+Backdrop', 40000, 10, '[]'::jsonb);


  -- Shimmer Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Shimmer Wall', 'Shimmer Wall.', 22500, cat_shimmer_walls, 'https://placehold.co/600x400?text=Shimmer+Wall+(Gold)', 22500, 10, '[{"id": "color", "name": "Color", "options": [{"id": "gold", "label": "Gold", "priceAdjustment": 0}, {"id": "black", "label": "Black", "priceAdjustment": 0}, {"id": "silver", "label": "Silver", "priceAdjustment": 0}]}]'::jsonb);


  -- Soft Touch Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Soft Touch Wall (black)', 'Soft Touch Wall (black).', 15000, cat_soft_touch_walls, 'https://placehold.co/600x400?text=Soft+Touch+Wall+(Black)', 15000, 10, '[]'::jsonb);


  -- Decorations Props
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Elephant', 'Elephant.', 22500, cat_decor_props, 'https://placehold.co/600x400?text=Elephant', 22500, 10, '[]'::jsonb),
  ('Giraffe', 'Giraffe.', 22500, cat_decor_props, 'https://placehold.co/600x400?text=Giraffe', 22500, 10, '[]'::jsonb),
  ('Gold Number Stand', 'Gold Number Stand.', 5000, cat_decor_props, 'https://placehold.co/600x400?text=Gold+Number+Stand', 5000, 10, '[]'::jsonb),
  ('Table Top Elephant', 'Table Top Elephant.', 1000, cat_decor_props, 'https://placehold.co/600x400?text=Table+Top+Elephant', 1000, 10, '[]'::jsonb),
  ('Telephone Booth', 'Telephone Booth.', 27500, cat_decor_props, 'https://placehold.co/600x400?text=Telephone+Booth', 27500, 10, '[]'::jsonb),
  ('Green Tree', 'Green Tree.', 5000, cat_decor_props, 'https://placehold.co/600x400?text=Green+Tree', 5000, 10, '[]'::jsonb),
  ('Trio Wedding Gold Arch', 'Trio Wedding Gold Arch.', 105000, cat_decor_props, 'https://placehold.co/600x400?text=Trio+Wedding+Gold+Arch', 105000, 10, '[]'::jsonb),
  ('Zebra', 'Zebra.', 12500, cat_decor_props, 'https://placehold.co/600x400?text=Zebra', 12500, 10, '[]'::jsonb);


  -- LED Signs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Happy Birthday LED Sign', 'Happy Birthday LED Sign.', 7500, cat_led_signs, 'https://placehold.co/600x400?text=Happy+Birthday+LED+Sign', 7500, 10, '[]'::jsonb);


  -- Lit Letters
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Large Marquee Cross with Light', 'Large Marquee Cross with Light.', 12500, cat_lit_letters, 'https://placehold.co/600x400?text=LARGE+MARQUEE+CROSS+WITH+LIGHT', 12500, 10, '[]'::jsonb),
  ('Baby Marquee', 'Baby Marquee.', 50500, cat_lit_letters, 'https://placehold.co/600x400?text=BABY+MARQUEE', 50500, 10, '[]'::jsonb),
  ('Marquee Letter', 'Marquee Letter.', 12500, cat_lit_letters, 'https://placehold.co/600x400?text=MARQUEE+LETTER', 12500, 10, '[]'::jsonb),
  ('White Marquee Number', 'White Marquee Number.', 8500, cat_lit_letters, 'https://placehold.co/600x400?text=WHITE+MARQUEE+NUMBER', 8500, 10, '[]'::jsonb),
  ('Black Marquee Numbers', 'Black Marquee Numbers.', 10000, cat_lit_letters, 'https://placehold.co/600x400?text=BLACK+MARQUEE+NUMBERS', 10000, 10, '[]'::jsonb),
  ('Oh Baby Marquee', 'Oh Baby Marquee.', 50500, cat_lit_letters, 'https://placehold.co/600x400?text=OH+BABY+MARQUEE', 50500, 10, '[]'::jsonb);


-- Bar Counters
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('White Formica Bar', 'White Formica Bar.', 7500, cat_bar_counters, 'https://placehold.co/600x400?text=White+Formica+Bar', 7500, 10, '[]'::jsonb),
  ('Grass Bar', 'Grass Bar.', 15000, cat_bar_counters, 'https://placehold.co/600x400?text=GRASS+BAR', 15000, 10, '[]'::jsonb),
  ('Laminate Black Bar', 'Laminate Black Bar.', 7500, cat_bar_counters, 'https://placehold.co/600x400?text=Laminate+black+bar', 7500, 10, '[]'::jsonb),
  ('Lux Bar', 'Lux Bar.', 35000, cat_bar_counters, 'https://placehold.co/600x400?text=Lux+Bar', 35000, 10, '[]'::jsonb),
  ('Malibu Bar 6ft', 'Malibu Bar 6ft.', 32500, cat_bar_counters, 'https://placehold.co/600x400?text=Malibu+Bar+6ft', 32500, 10, '[]'::jsonb),
  ('White Champagne Wall', 'White Champagne Wall.', 15000, cat_bar_counters, 'https://placehold.co/600x400?text=White+CHAMPAGNE+WALL', 15000, 10, '[]'::jsonb),
  ('Black Champagne Wall', 'Black Champagne Wall.', 18000, cat_bar_counters, 'https://placehold.co/600x400?text=Black+Champagne+Wall', 18000, 10, '[]'::jsonb),
  ('Walnut Laminate Bar', 'Walnut Laminate Bar.', 7500, cat_bar_counters, 'https://placehold.co/600x400?text=Walnut+laminate+bar', 7500, 10, '[]'::jsonb);


  -- Bar Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Cocktail Tables', 'Cocktail Tables.', 1450, cat_bar_tables, 'https://placehold.co/600x400?text=COCKTAIL+TABLES', 1450, 10, '[]'::jsonb),
  ('Circle Bar Table', 'Circle Bar Table.', 10000, cat_bar_tables, 'https://placehold.co/600x400?text=Circle+Bar+Table+(Silver)', 10000, 10, '[{"id": "color", "name": "Color", "options": [{"id": "silver", "label": "Silver", "priceAdjustment": 0}, {"id": "gold", "label": "Gold", "priceAdjustment": 0}]}]'::jsonb),
  ('Highboy Cocktail Round Spandex Table Cover', 'Highboy Cocktail Round Spandex Table Cover.', 1350, cat_bar_tables, 'https://placehold.co/600x400?text=Highboy+Cocktail+Round+Spandex+Table+cover', 1350, 10, '[]'::jsonb),
  ('LED Cocktable Table', 'LED Cocktable Table.', 3500, cat_bar_tables, 'https://placehold.co/600x400?text=LED+COCKTABLE+TABLE', 3500, 10, '[]'::jsonb),
  ('LED Champagne Table', 'LED Champagne Table.', 5000, cat_bar_tables, 'https://placehold.co/600x400?text=Led+Champagne+table', 5000, 10, '[]'::jsonb),
  ('Spandex Tablecloth for Cocktail Tables', 'Spandex Tablecloth for Cocktail Tables.', 1350, cat_bar_tables, 'https://placehold.co/600x400?text=Spandex+Tablecloth+for+Cocktail+Tables', 1350, 10, '[]'::jsonb),
  ('Trisha Bar Table', 'Trisha Bar Table.', 10000, cat_bar_tables, 'https://placehold.co/600x400?text=Trisha+Bar+Table+(Silver)', 10000, 10, '[{"id": "color", "name": "Color", "options": [{"id": "silver", "label": "Silver", "priceAdjustment": 0}, {"id": "gold", "label": "Gold", "priceAdjustment": 0}]}]'::jsonb),
  ('White Cocktail', 'White Cocktail.', 1100, cat_bar_tables, 'https://placehold.co/600x400?text=White+cocktail', 1100, 10, '[]'::jsonb);


  -- Benches & Ottomans
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Cage Sofa', 'Cage Sofa.', 20625, cat_benches, 'https://placehold.co/600x400?text=Cage+sofa', 20625, 10, '[]'::jsonb),
  ('Pink Elegance Loveseat', 'Pink Elegance Loveseat.', 19500, cat_benches, 'https://placehold.co/600x400?text=Pink+Elegance+Loveseat', 19500, 10, '[]'::jsonb),
  ('Elegance Lux Loveseat', 'Elegance Lux Loveseat.', 19500, cat_benches, 'https://placehold.co/600x400?text=Elegance+Lux+Loveseat', 19500, 10, '[]'::jsonb),
  ('Hendrix 52"Velvet Flared Arm Loveseat', 'Hendrix 52"Velvet Flared Arm Loveseat.', 20000, cat_benches, 'https://placehold.co/600x400?text=Hendrix+52"+Velvet+Flared+Arm+Loveseat', 20000, 10, '[]'::jsonb),
  ('Lounge Circles', 'Lounge Circles.', 6500, cat_benches, 'https://placehold.co/600x400?text=Lounge+Circles', 6500, 10, '[]'::jsonb),
  ('Single Velvet Lux', 'Single Velvet Lux.', 19500, cat_benches, 'https://placehold.co/600x400?text=Single+Velvet+Lux', 19500, 10, '[]'::jsonb);


  -- Sofas & Loveseats
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('3 Piece Lux Set', '3 Piece Lux Set.', 27000, cat_sofas, 'https://placehold.co/600x400?text=3+PIECE+LUX+SET', 27000, 10, '[]'::jsonb),
  ('Cage Sofa', 'Cage Sofa.', 20625, cat_sofas, 'https://placehold.co/600x400?text=Cage+sofa', 20625, 10, '[]'::jsonb),
  ('Chic Sofa (black)', 'Chic Sofa (black).', 30000, cat_sofas, 'https://placehold.co/600x400?text=Chic+Sofa+(Black)', 30000, 10, '[]'::jsonb),
  ('White Dotted Throne Sofa', 'White Dotted Throne Sofa.', 24000, cat_sofas, 'https://placehold.co/600x400?text=White+Dotted+Throne+Sofa', 24000, 10, '[]'::jsonb),
  ('Hendrix Velvet Flared Arm Loveseats', 'Hendrix Velvet Flared Arm Loveseats.', 16000, cat_sofas, 'https://placehold.co/600x400?text=Hendrix+Velvet+Flared+Arm+Loveseats', 16000, 10, '[]'::jsonb),
  ('Lux Sofa', 'Lux Sofa.', 15000, cat_sofas, 'https://placehold.co/600x400?text=Lux+Sofa', 15000, 10, '[]'::jsonb),
  ('Lux Pink Sofa', 'Lux Pink Sofa.', 20000, cat_sofas, 'https://placehold.co/600x400?text=Lux+Pink+sofa', 20000, 10, '[]'::jsonb),
  ('Nude Sofa', 'Nude Sofa.', 20000, cat_sofas, 'https://placehold.co/600x400?text=NUDE+SOFA', 20000, 10, '[]'::jsonb),
  ('Wave Sofa', 'Wave Sofa.', 16000, cat_sofas, 'https://placehold.co/600x400?text=Wave+sofa', 16000, 10, '[]'::jsonb),
  ('Fancy Royal Sofa', 'Fancy Royal Sofa.', 24650, cat_sofas, 'https://placehold.co/600x400?text=fancy+Royal+Sofa', 24650, 10, '[]'::jsonb);


  -- Kids Backdrops
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Blast Zone Magic Castle', 'Blast Zone Magic Castle.', 27500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Blast+Zone+Magic+Castle', 27500, 10, '[]'::jsonb),
  ('Royal Castle', 'Royal Castle.', 47500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Royal+Castle', 47500, 10, '[]'::jsonb),
  ('Dreamland Train', 'Dreamland Train.', 42500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Dreamland+Train', 42500, 10, '[]'::jsonb),
  ('Princess Express Train', 'Princess Express Train.', 42500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Princess+Express+Train', 42500, 10, '[]'::jsonb),
  ('Story Book', 'Story Book.', 27500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Story+Book', 27500, 10, '[]'::jsonb);


  -- Kids Chairs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Kids White Samsonite Chair', 'Kids White Samsonite Chair.', 225, cat_kids_chairs, 'https://placehold.co/600x400?text=KIDS+White+Samsonite+Chair', 225, 10, '[]'::jsonb),
  ('Kids Bamboo Chair (pink)', 'Kids Bamboo Chair (pink).', 500, cat_kids_chairs, 'https://placehold.co/600x400?text=Kids+Bamboo+Chair+(Pink)', 500, 10, '[]'::jsonb),
  ('Kids Bow Back Chair', 'Kids Bow Back Chair.', 500, cat_kids_chairs, 'https://placehold.co/600x400?text=Kids+Bow+Back+Chair', 500, 10, '[]'::jsonb),
  ('Kids Chiavari Blue Chair', 'Kids Chiavari Blue Chair.', 500, cat_kids_chairs, 'https://placehold.co/600x400?text=kids+Chiavari+Blue+Chair', 500, 10, '[]'::jsonb);


  -- Kids Thrones
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Kids Bow Back Chair', 'Kids Bow Back Chair.', 12000, cat_kids_thrones, 'https://placehold.co/600x400?text=Kids+Bow+Back+Chair', 12000, 10, '[]'::jsonb),
  ('Kids King Throne Chair (white)', 'Kids King Throne Chair (white).', 12000, cat_kids_thrones, 'https://placehold.co/600x400?text=Kids+King+Throne+Chair+(White)', 12000, 10, '[]'::jsonb);


  -- Charger Plates
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Eclipse Gold Charger', 'Eclipse Gold Charger.', 650, cat_charger_plates, 'https://placehold.co/600x400?text=Eclipse+Gold+Charger', 650, 50, '[]'::jsonb),
  ('Natural Tone Charger', 'Natural Tone Charger.', 100, cat_charger_plates, 'https://placehold.co/600x400?text=Natural+Tone+Charger', 100, 50, '[]'::jsonb),
  ('Plain Red Chargers', 'Plain Red Chargers.', 650, cat_charger_plates, 'https://placehold.co/600x400?text=Plain+Red+Chargers', 650, 50, '[]'::jsonb),
  ('Reef Charger Plate', 'Reef Charger Plate.', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Charger+Plate+(Pink)', 350, 50, '[{"id": "color", "name": "Color", "options": [{"id": "pink", "label": "Pink", "priceAdjustment": 0}, {"id": "navy", "label": "Navy", "priceAdjustment": 0}, {"id": "purple", "label": "Purple", "priceAdjustment": 0}, {"id": "gold", "label": "Gold", "priceAdjustment": 0}, {"id": "black", "label": "Black", "priceAdjustment": 0}, {"id": "aqua", "label": "Aqua", "priceAdjustment": 0}, {"id": "baby", "label": "Baby", "priceAdjustment": 0}, {"id": "burgundy", "label": "Burgundy", "priceAdjustment": 0}, {"id": "silver", "label": "Silver", "priceAdjustment": 0}]}]'::jsonb);


  -- Dinnerware
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Bentley Stainless Steel Spoon', 'Bentley Stainless Steel Spoon.', 95, cat_dinnerware, 'https://placehold.co/600x400?text=Bentley+stainless+steel+spoon', 95, 50, '[]'::jsonb),
  ('Blanc Wine Glass', 'Blanc Wine Glass.', 135, cat_dinnerware, 'https://placehold.co/600x400?text=Blanc+Wine+Glass', 135, 50, '[]'::jsonb),
  ('Classic Black Plate 10.5in', 'Classic Black Plate 10.5in.', 105, cat_dinnerware, 'https://placehold.co/600x400?text=Classic+Black+Plate+10.5+in', 105, 50, '[]'::jsonb),
  ('Classic Black Plate 7.5in', 'Classic Black Plate 7.5in.', 99, cat_dinnerware, 'https://placehold.co/600x400?text=Classic+Black+Plate+7.5+in', 99, 50, '[]'::jsonb),
  ('White Dessert Plate', 'White Dessert Plate.', 99, cat_dinnerware, 'https://placehold.co/600x400?text=White+Dessert+Plate', 99, 50, '[]'::jsonb),
  ('White Dinner Plate 10.5in', 'White Dinner Plate 10.5in.', 105, cat_dinnerware, 'https://placehold.co/600x400?text=White+Dinner+Plate+10.5+in', 105, 50, '[]'::jsonb),
  ('Champagne Flute 6.25oz', 'Champagne Flute 6.25oz.', 125, cat_dinnerware, 'https://placehold.co/600x400?text=Champagne+Flute+6.25oz', 125, 50, '[]'::jsonb),
  ('Glass Carafe 1 Liter', 'Glass Carafe 1 Liter.', 600, cat_dinnerware, 'https://placehold.co/600x400?text=Glass+Carafe+1+liter', 600, 50, '[]'::jsonb),
  ('Glass Pint Jar 16oz', 'Glass Pint Jar 16oz.', 125, cat_dinnerware, 'https://placehold.co/600x400?text=Glass+Pint+Jar+16oz', 125, 50, '[]'::jsonb),
  ('Modern Luxury Matte Gold Silverware', 'Modern Luxury Matte Gold Silverware.', 195, cat_dinnerware, 'https://placehold.co/600x400?text=Modern+luxury+Matte+Gold+Silverware', 195, 50, '[]'::jsonb),
  ('White Plate 7.5in', 'White Plate 7.5in.', 99, cat_dinnerware, 'https://placehold.co/600x400?text=White+Plate+7.5+in', 99, 50, '[]'::jsonb),
  ('Gold Rim Dinner Plates 10.5in', 'Gold Rim Dinner Plates 10.5in.', 125, cat_dinnerware, 'https://placehold.co/600x400?text=Gold+Rim+Dinner+Plates+10.5+in', 125, 50, '[]'::jsonb),
  ('Rocks / Old Fashioned Glass', 'Rocks / Old Fashioned Glass.', 135, cat_dinnerware, 'https://placehold.co/600x400?text=Rocks+/+Old+Fashioned+Glass', 135, 50, '[]'::jsonb),
  ('Stainless Steel Steak Knives', 'Stainless Steel Steak Knives.', 99, cat_dinnerware, 'https://placehold.co/600x400?text=Stainless+Steel+Steak+Knives', 99, 50, '[]'::jsonb),
  ('Stemless Glass 20.5oz', 'Stemless Glass 20.5oz.', 135, cat_dinnerware, 'https://placehold.co/600x400?text=Stemless+Glass+20.5oz', 135, 50, '[]'::jsonb),
  ('Stoneware Mug 12oz', 'Stoneware Mug 12oz.', 99, cat_dinnerware, 'https://placehold.co/600x400?text=Stoneware+Mug+12oz', 99, 50, '[]'::jsonb),
  ('The Drop Flatware Stainless Steel Silverware', 'The Drop Flatware Stainless Steel Silverware.', 105, cat_dinnerware, 'https://placehold.co/600x400?text=The+Drop+Flatware+Stainless+Steel+Silverware', 105, 50, '[]'::jsonb),
  ('White Serving Coupe Bone China Plate', 'White Serving Coupe Bone China Plate.', 95, cat_dinnerware, 'https://placehold.co/600x400?text=White+serving+Coupe+Bone+China+Plate', 95, 50, '[]'::jsonb);


  -- Flowers & Centerpieces
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('3 Goblets', '3 Goblets.', 3500, cat_flowers, 'https://placehold.co/600x400?text=3+GOBLETS', 3500, 10, '[]'::jsonb),
  ('Elegant Candles', 'Elegant Candles.', 6500, cat_flowers, 'https://placehold.co/600x400?text=ELEGANT+CANDLES', 6500, 10, '[]'::jsonb),
  ('Floral Ball', 'Floral Ball.', 3500, cat_flowers, 'https://placehold.co/600x400?text=FLORAL+BALL', 3500, 10, '[]'::jsonb),
  ('Flower Runner', 'Flower Runner.', 12000, cat_flowers, 'https://placehold.co/600x400?text=Flower+Runner+(Pink)', 12000, 10, '[{"id": "color", "name": "Color", "options": [{"id": "pink", "label": "Pink", "priceAdjustment": 0}, {"id": "purple", "label": "Purple", "priceAdjustment": 0}]}]'::jsonb),
  ('Flower Runner (purple & Pink)', 'Flower Runner (purple & Pink).', 37500, cat_flowers, 'https://placehold.co/600x400?text=Flower+Runner+(Purple+&+Pink)', 37500, 10, '[]'::jsonb),
  ('Lux Triangle W/flowers', 'Lux Triangle W/flowers.', 8500, cat_flowers, 'https://placehold.co/600x400?text=LUX+TRIANGLE+W/FLOWERS', 8500, 10, '[]'::jsonb),
  ('Peach Time Centerpiece', 'Peach Time Centerpiece.', 4500, cat_flowers, 'https://placehold.co/600x400?text=Peach+Time+Centerpiece', 4500, 10, '[]'::jsonb),
  ('Spring Valley Centerpiece', 'Spring Valley Centerpiece.', 4500, cat_flowers, 'https://placehold.co/600x400?text=Spring+Valley+Centerpiece', 4500, 10, '[]'::jsonb),
  ('The Elegance Centerpiece', 'The Elegance Centerpiece.', 4500, cat_flowers, 'https://placehold.co/600x400?text=The+Elegance+Centerpiece', 4500, 10, '[]'::jsonb),
  ('Green Tree', 'Green Tree.', 6500, cat_flowers, 'https://placehold.co/600x400?text=Green+Tree', 6500, 10, '[]'::jsonb);


  -- Table Linens
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Awning Stripe Tablecloth', 'Awning Stripe Tablecloth.', 2500, cat_linens, 'https://placehold.co/600x400?text=AWNING+STRIPE+TABLECLOTH', 2500, 100, '[]'::jsonb),
  ('Beethoven Tablecloth', 'Beethoven Tablecloth.', 2500, cat_linens, 'https://placehold.co/600x400?text=BEETHOVEN+TABLECLOTH', 2500, 100, '[]'::jsonb),
  ('Checks Tablecloth', 'Checks Tablecloth.', 2500, cat_linens, 'https://placehold.co/600x400?text=CHECKS+TABLECLOTH', 2500, 100, '[]'::jsonb),
  ('Flower on Sequin Taffeta Tablecloth 120"Round', 'Flower on Sequin Taffeta Tablecloth 120"Round.', 2500, cat_linens, 'https://placehold.co/600x400?text=Flower+on+Sequin+Taffeta+Tablecloth+120"+Round', 2500, 100, '[]'::jsonb),
  ('Large Rosette Flower Tablecloth', 'Large Rosette Flower Tablecloth.', 5000, cat_linens, 'https://placehold.co/600x400?text=Large+Rosette+Flower+Tablecloth', 5000, 100, '[]'::jsonb),
  ('Plaid Tablecloth', 'Plaid Tablecloth.', 2500, cat_linens, 'https://placehold.co/600x400?text=PLAID+TABLECLOTH', 2500, 100, '[]'::jsonb),
  ('Race Car Tablecloth', 'Race Car Tablecloth.', 3300, cat_linens, 'https://placehold.co/600x400?text=RACE+CAR+TABLECLOTH', 3300, 100, '[]'::jsonb),
  ('Rectangular Polyester Tablecloth', 'Rectangular Polyester Tablecloth.', 1500, cat_linens, 'https://placehold.co/600x400?text=RECTANGULAR+POLYESTER+TABLECLOTH', 1500, 100, '[]'::jsonb),
  ('Round Payette Sequin Tablecloth Iridescent', 'Round Payette Sequin Tablecloth Iridescent.', 4000, cat_linens, 'https://placehold.co/600x400?text=ROUND+PAYETTE+SEQUIN+TABLECLOTH+IRIDESCENT', 4000, 100, '[]'::jsonb),
  ('Round Pintuck Tablecloth', 'Round Pintuck Tablecloth.', 2500, cat_linens, 'https://placehold.co/600x400?text=ROUND+PINTUCK+TABLECLOTH', 2500, 100, '[]'::jsonb),
  ('Round Polyester Tablecloth', 'Round Polyester Tablecloth.', 1500, cat_linens, 'https://placehold.co/600x400?text=ROUND+POLYESTER+TABLECLOTH', 1500, 100, '[]'::jsonb),
  ('Round Silk Embroidered Polyester Tablecloth', 'Round Silk Embroidered Polyester Tablecloth.', 2500, cat_linens, 'https://placehold.co/600x400?text=ROUND+SILK+EMBROIDERED+POLYESTER+TABLECLOTH', 2500, 100, '[]'::jsonb),
  ('Sequins Tablecloth', 'Sequins Tablecloth.', 2500, cat_linens, 'https://placehold.co/600x400?text=SEQUINS+TABLECLOTH', 2500, 100, '[]'::jsonb),
  ('Solid Stripe Tablecloth', 'Solid Stripe Tablecloth.', 2500, cat_linens, 'https://placehold.co/600x400?text=SOLID+STRIPE+TABLECLOTH', 2500, 100, '[]'::jsonb),
  ('Velvet Tablecloth', 'Velvet Tablecloth.', 2500, cat_linens, 'https://placehold.co/600x400?text=VELVET+TABLECLOTH', 2500, 100, '[]'::jsonb);


  -- Napkins
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Table Napkin (any Color)', 'Table Napkin (any Color).', 250, cat_napkins, 'https://placehold.co/600x400?text=Table+Napkin+(Any+Color)', 250, 100, '[]'::jsonb);


  -- Misc
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Nude Columns', 'Nude Columns.', 20000, cat_misc, 'https://placehold.co/600x400?text=NUDE+COLUMNS', 20000, 10, '[]'::jsonb),
  ('Columns', 'Columns.', 20000, cat_misc, 'https://placehold.co/600x400?text=Green+Columns', 20000, 10, '[{"id": "color", "name": "Color", "options": [{"id": "green", "label": "Green", "priceAdjustment": 0}, {"id": "pink", "label": "Pink", "priceAdjustment": 0}, {"id": "blush", "label": "Blush", "priceAdjustment": 0}, {"id": "hot", "label": "Hot", "priceAdjustment": 0}, {"id": "purple", "label": "Purple", "priceAdjustment": 0}]}]'::jsonb);


  -- Pedestals
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('3 Piece Set of Metal Cylinder Pedestals Display - Silver', '3 Piece Set of Metal Cylinder Pedestals Display - Silver.', 15000, cat_pedestals, 'https://placehold.co/600x400?text=3+PIECE+SET+OF+METAL+CYLINDER+PEDESTALS+DISPLAY+-+', 15000, 10, '[]'::jsonb),
  ('Black Columns', 'Black Columns.', 20000, cat_pedestals, 'https://placehold.co/600x400?text=BLACK+COLUMNS', 20000, 10, '[]'::jsonb),
  ('Royal Blue Columns', 'Royal Blue Columns.', 20000, cat_pedestals, 'https://placehold.co/600x400?text=Royal+Blue+Columns', 20000, 10, '[]'::jsonb),
  ('Cylinder Acrylic Pedestals (white)', 'Cylinder Acrylic Pedestals (white).', 16000, cat_pedestals, 'https://placehold.co/600x400?text=Cylinder+Acrylic+Pedestals+(White)', 16000, 10, '[]'::jsonb),
  ('Silver Pedestal', 'Silver Pedestal.', 6000, cat_pedestals, 'https://placehold.co/600x400?text=Silver+Pedestal', 6000, 10, '[]'::jsonb),
  ('Ruth Pedestals', 'Ruth Pedestals.', 22500, cat_pedestals, 'https://placehold.co/600x400?text=Ruth+Pedestals+(Gold)', 22500, 10, '[{"id": "color", "name": "Color", "options": [{"id": "gold", "label": "Gold", "priceAdjustment": 0}, {"id": "silver", "label": "Silver", "priceAdjustment": 0}]}]'::jsonb),
  ('Slatted Pedestal', 'Slatted Pedestal.', 6000, cat_pedestals, 'https://placehold.co/600x400?text=Slatted+Pedestal', 6000, 10, '[]'::jsonb),
  ('Gold Square Pedestals', 'Gold Square Pedestals.', 8000, cat_pedestals, 'https://placehold.co/600x400?text=Gold+Square+Pedestals', 8000, 10, '[]'::jsonb);


  -- Shelves
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Charice Shelf', 'Charice Shelf.', 15000, cat_shelves, 'https://placehold.co/600x400?text=Charice+Shelf', 15000, 10, '[]'::jsonb);


  -- Sweets Carts
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('All White Cart', 'All White Cart.', 25000, cat_sweets_carts, 'https://placehold.co/600x400?text=All+White+Cart', 25000, 10, '[]'::jsonb),
  ('Prime Cycle Cart', 'Prime Cycle Cart.', 20000, cat_sweets_carts, 'https://placehold.co/600x400?text=Prime+cycle+cart', 20000, 10, '[]'::jsonb),
  ('Pumpkin Cart', 'Pumpkin Cart.', 20000, cat_sweets_carts, 'https://placehold.co/600x400?text=Pumpkin+Cart', 20000, 10, '[]'::jsonb),
  ('White Rustic Cart', 'White Rustic Cart.', 30000, cat_sweets_carts, 'https://placehold.co/600x400?text=White+Rustic+cart', 30000, 10, '[]'::jsonb),
  ('White Wagon Cart', 'White Wagon Cart.', 22500, cat_sweets_carts, 'https://placehold.co/600x400?text=White+Wagon+Cart', 22500, 10, '[]'::jsonb);


  -- Cake Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Boy Treat Table', 'Boy Treat Table.', 15000, cat_cake_tables, 'https://placehold.co/600x400?text=BOY+Treat+Table', 15000, 10, '[]'::jsonb),
  ('Diamond Cake Table (gold)', 'Diamond Cake Table (gold).', 16000, cat_cake_tables, 'https://placehold.co/600x400?text=Diamond+Cake+Table+(Gold)', 16000, 10, '[]'::jsonb),
  ('Girl Treat Table', 'Girl Treat Table.', 17500, cat_cake_tables, 'https://placehold.co/600x400?text=GIRL+Treat+Table', 17500, 10, '[]'::jsonb),
  ('LED Roses Table', 'LED Roses Table.', 15000, cat_cake_tables, 'https://placehold.co/600x400?text=LED+ROSES+TABLE', 15000, 10, '[]'::jsonb),
  ('Squeeze Me Stand', 'Squeeze Me Stand.', 12500, cat_cake_tables, 'https://placehold.co/600x400?text=Squeeze+Me+Stand+(Blue)', 12500, 10, '[{"id": "color", "name": "Color", "options": [{"id": "blue", "label": "Blue", "priceAdjustment": 0}, {"id": "pink", "label": "Pink", "priceAdjustment": 0}]}]'::jsonb);


  -- Tents
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('10x10 Tent', '10x10 Tent.', 15000, cat_tents, 'https://placehold.co/600x400?text=10x10+Tent', 15000, 10, '[]'::jsonb),
  ('20x20 Tent', '20x20 Tent.', 47500, cat_tents, 'https://placehold.co/600x400?text=20x20+Tent', 47500, 10, '[]'::jsonb),
  ('20x30 Tent', '20x30 Tent.', 67500, cat_tents, 'https://placehold.co/600x400?text=20x30+Tent', 67500, 10, '[]'::jsonb),
  ('20x40 Tent', '20x40 Tent.', 87500, cat_tents, 'https://placehold.co/600x400?text=20x40+Tent', 87500, 10, '[]'::jsonb),
  ('LED Cabana', 'LED Cabana.', 71500, cat_tents, 'https://placehold.co/600x400?text=LED+Cabana', 71500, 10, '[]'::jsonb),
  ('Outdoor Package #1', 'Outdoor Package #1.', 99000, cat_tents, 'https://placehold.co/600x400?text=Outdoor+Package+#1', 99000, 10, '[]'::jsonb),
  ('Outdoor Package #2', 'Outdoor Package #2.', 129350, cat_tents, 'https://placehold.co/600x400?text=Outdoor+Package+#2', 129350, 10, '[]'::jsonb),
  ('Outdoor Package #3', 'Outdoor Package #3.', 114500, cat_tents, 'https://placehold.co/600x400?text=Outdoor+Package+#3', 114500, 10, '[]'::jsonb),
  ('Outdoor Package #4', 'Outdoor Package #4.', 168150, cat_tents, 'https://placehold.co/600x400?text=Outdoor+Package+#4', 168150, 10, '[]'::jsonb),
  ('Single Cabana', 'Single Cabana.', 65000, cat_tents, 'https://placehold.co/600x400?text=Single+Cabana', 65000, 10, '[]'::jsonb),
  ('Tent Installation', 'Tent Installation.', 12500, cat_tents, 'https://placehold.co/600x400?text=Tent+Installation', 12500, 10, '[]'::jsonb);


  -- Buffet Service
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Gold Cake Stand', 'Gold Cake Stand.', 5000, cat_buffet, 'https://placehold.co/600x400?text=Gold+Cake+Stand', 5000, 10, '[]'::jsonb),
  ('White Wagon Cart', 'White Wagon Cart.', 22500, cat_buffet, 'https://placehold.co/600x400?text=White+Wagon+Cart', 22500, 10, '[]'::jsonb),
  ('White Serving Coupe Bone China Plate', 'White Serving Coupe Bone China Plate.', 95, cat_buffet, 'https://placehold.co/600x400?text=White+serving+Coupe+Bone+China+Plate', 95, 10, '[]'::jsonb);


  -- Chafing Dishes
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('6 Burner Stove', '6 Burner Stove.', 15000, cat_chafing, 'https://placehold.co/600x400?text=6+BURNER+STOVE', 15000, 10, '[]'::jsonb),
  ('Char Griller', 'Char Griller.', 12500, cat_chafing, 'https://placehold.co/600x400?text=Char+Griller', 12500, 10, '[]'::jsonb),
  ('Food Warmer', 'Food Warmer.', 4500, cat_chafing, 'https://placehold.co/600x400?text=Food+warmer', 4500, 10, '[]'::jsonb);


  -- Cooking & Prep
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Classic Half Size Round Chafer', 'Classic Half Size Round Chafer.', 2500, cat_cooking, 'https://placehold.co/600x400?text=Classic+Half+Size+Round+Chafer', 2500, 10, '[]'::jsonb),
  ('Deluxe 4 qt. Round Gold Accent Chafer', 'Deluxe 4 qt. Round Gold Accent Chafer.', 1500, cat_cooking, 'https://placehold.co/600x400?text=Deluxe+4+Qt.+Round+Gold+Accent+Chafer', 1500, 10, '[]'::jsonb),
  ('Deluxe 8 qt. Full Size Gold Accent Chafer', 'Deluxe 8 qt. Full Size Gold Accent Chafer.', 2500, cat_cooking, 'https://placehold.co/600x400?text=Deluxe+8+Qt.+Full+Size+Gold+Accent+Chafer', 2500, 10, '[]'::jsonb),
  ('Economy 8 qt. Full Size Stainless Steel Chafer', 'Economy 8 qt. Full Size Stainless Steel Chafer.', 1500, cat_cooking, 'https://placehold.co/600x400?text=Economy+8+Qt.+Full+Size+Stainless+Steel+Chafe', 1500, 10, '[]'::jsonb),
  ('Elite Dripless Rectangular Chafer with Gold', 'Elite Dripless Rectangular Chafer with Gold.', 4500, cat_cooking, 'https://placehold.co/600x400?text=Elite+Dripless+Rectangular+Chafer+with+Gold', 4500, 10, '[]'::jsonb),
  ('Food Warmer', 'Food Warmer.', 4500, cat_cooking, 'https://placehold.co/600x400?text=Food+warmer', 4500, 10, '[]'::jsonb),
  ('Full Size Chafer Choice Classic 8 qt.', 'Full Size Chafer Choice Classic 8 qt..', 2500, cat_cooking, 'https://placehold.co/600x400?text=Full+Size+Chafer+Choice+Classic+8+Qt.', 2500, 10, '[]'::jsonb),
  ('Renaissance Chafer', 'Renaissance Chafer.', 3000, cat_cooking, 'https://placehold.co/600x400?text=Renaissance+Chafer', 3000, 10, '[]'::jsonb);


  -- Flooring & Staging
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Dance Floor 3x3', 'Dance Floor 3x3.', 3200, cat_flooring, 'https://placehold.co/600x400?text=Dance+Floor+3x3', 3200, 10, '[]'::jsonb),
  ('Installation', 'Installation.', 12500, cat_flooring, 'https://placehold.co/600x400?text=Installation', 12500, 10, '[]'::jsonb),
  ('Pure White Stage 8x8', 'Pure White Stage 8x8.', 80000, cat_flooring, 'https://placehold.co/600x400?text=Pure+white+Stage+8x8', 80000, 10, '[]'::jsonb);


  -- Kids Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES
  ('Kids 6ft Table', 'Kids 6ft Table.', 1500, cat_kids_tables, 'https://placehold.co/600x400?text=KIDS+6FT+TABLE', 1500, 10, '[]'::jsonb);


END $$;

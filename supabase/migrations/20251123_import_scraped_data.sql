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
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('TRANSLUCENT CHIAVARI CHAIR', 'TRANSLUCENT CHIAVARI CHAIR.', 700, cat_chairs, 'https://placehold.co/600x400?text=TRANSLUCENT+CHIAVARI+CHAIR', 700, 10),
  ('CLEAR ROUND ELEGANCE', 'CLEAR ROUND ELEGANCE.', 750, cat_chairs, 'https://placehold.co/600x400?text=CLEAR+ROUND+ELEGANCE', 750, 10),
  ('Padded Folding Chair', 'Padded Folding Chair.', 350, cat_chairs, 'https://placehold.co/600x400?text=Padded+Folding+Chair', 350, 10),
  ('BLACK PADDED CHAIR', 'BLACK PADDED CHAIR.', 350, cat_chairs, 'https://placehold.co/600x400?text=BLACK+PADDED+CHAIR', 350, 10),
  ('BLACK CHIAVARI CHAIR', 'BLACK CHIAVARI CHAIR.', 700, cat_chairs, 'https://placehold.co/600x400?text=BLACK+CHIAVARI+CHAIR', 700, 10),
  ('PRIME PINK ROYALTY CHAIR', 'PRIME PINK ROYALTY CHAIR.', 1440, cat_chairs, 'https://placehold.co/600x400?text=PRIME+PINK+ROYALTY+CHAIR', 1440, 10),
  ('White Samsonite Chair', 'White Samsonite Chair.', 250, cat_chairs, 'https://placehold.co/600x400?text=White+Samsonite+Chair', 250, 10),
  ('O Back Gold Chair', 'O Back Gold Chair.', 1800, cat_chairs, 'https://placehold.co/600x400?text=O+Back+Gold+Chair', 1800, 10),
  ('O Back Silver Chair', 'O Back Silver Chair.', 1800, cat_chairs, 'https://placehold.co/600x400?text=O+Back+Silver+Chair', 1800, 10),
  ('Heart Chair (Gold)', 'Heart Chair (Gold).', 1200, cat_chairs, 'https://placehold.co/600x400?text=Heart+Chair+(Gold)', 1200, 10),
  ('Bamboo Chair (Gold)', 'Bamboo Chair (Gold).', 700, cat_chairs, 'https://placehold.co/600x400?text=Bamboo+Chair+(Gold)', 700, 10),
  ('Bamboo Chair (Silver)', 'Bamboo Chair (Silver).', 700, cat_chairs, 'https://placehold.co/600x400?text=Bamboo+Chair+(Silver)', 700, 10),
  ('Folding Acrylic Chair (Gold)', 'Folding Acrylic Chair (Gold).', 1125, cat_chairs, 'https://placehold.co/600x400?text=Folding+Acrylic+Chair+(Gold)', 1125, 10);

  -- Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('White lux table', 'White lux table.', 1100, cat_tables, 'https://placehold.co/600x400?text=White+lux+table', 1100, 50),
  ('BANQUET ROUND PARTY TABLES', 'BANQUET ROUND PARTY TABLES.', 1100, cat_tables, 'https://placehold.co/600x400?text=BANQUET+ROUND+PARTY+TABLES', 1100, 50),
  ('RECTANGULAR BANQUET TABLES', 'RECTANGULAR BANQUET TABLES.', 1100, cat_tables, 'https://placehold.co/600x400?text=RECTANGULAR+BANQUET+TABLES', 1100, 50),
  ('gold mirrior table', 'gold mirrior table.', 25000, cat_tables, 'https://placehold.co/600x400?text=gold+mirrior+table', 25000, 50),
  ('Gold Serpentine table', 'Gold Serpentine table.', 22500, cat_tables, 'https://placehold.co/600x400?text=Gold+Serpentine+table', 22500, 50),
  ('Vogue Triangular Table', 'Vogue Triangular Table.', 35000, cat_tables, 'https://placehold.co/600x400?text=Vogue+Triangular+Table', 35000, 50),
  ('Fab Glass Table', 'Fab Glass Table.', 25000, cat_tables, 'https://placehold.co/600x400?text=Fab+Glass+Table', 25000, 50),
  ('Clear Rectangular Table', 'Clear Rectangular Table.', 25000, cat_tables, 'https://placehold.co/600x400?text=Clear+Rectangular+Table', 25000, 50),
  ('Olivia Rectangular Table', 'Olivia Rectangular Table.', 35000, cat_tables, 'https://placehold.co/600x400?text=Olivia+Rectangular+Table', 35000, 50);

-- Backdrops
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Scottsdale Arch', 'Scottsdale Arch.', 37500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_c74ec89aecc1453c9483f15c759ea512~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_c74ec89aecc1453c9483f15c759ea512~mv2.png', 37500, 10),
  ('Sapphire acrh', 'Sapphire acrh.', 25000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_7e5bde18cb914fb2a26c5af24003c4fb~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_7e5bde18cb914fb2a26c5af24003c4fb~mv2.png', 25000, 10),
  ('Clover wave Acrh', 'Clover wave Acrh.', 27500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_a0ed9e68ba844511805208fe9b1ce21d~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_a0ed9e68ba844511805208fe9b1ce21d~mv2.png', 27500, 10),
  ('Ana set', 'Ana set.', 60000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_44ec157181004e7eb71c5e932d5b11f8~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_44ec157181004e7eb71c5e932d5b11f8~mv2.jpg', 60000, 10),
  ('Waves of Elegance Backdrop 8x8ft', 'Waves of Elegance Backdrop 8x8ft.', 45000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_07f5bc9b83214effac3c4f5241d59128~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_07f5bc9b83214effac3c4f5241d59128~mv2.jpg', 45000, 10),
  ('JOLIE"S BACKDROP', 'JOLIE"S BACKDROP.', 65000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_81e9c17f83b64f7fa5ec01fffde8a332~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_81e9c17f83b64f7fa5ec01fffde8a332~mv2.jpg', 65000, 10),
  ('Story Book', 'Story Book.', 27500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_a9fc3b4477ef4593994344b4e222a9aa~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_a9fc3b4477ef4593994344b4e222a9aa~mv2.png', 27500, 10),
  ('Fresh Kicks Display 6ft', 'Fresh Kicks Display 6ft.', 22500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_1ffbd887af024dd2b4501eadfbfa62d4~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_1ffbd887af024dd2b4501eadfbfa62d4~mv2.jpg', 22500, 10),
  ('Moon 7ft', 'Moon 7ft.', 17500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_76b247dbc6e44e9b90be6eef0acc8768~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_76b247dbc6e44e9b90be6eef0acc8768~mv2.png', 17500, 10),
  ('Santorini wall package', 'Santorini wall package.', 100000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_d4b38484fc8f4dff9a60afc21e435e52~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_d4b38484fc8f4dff9a60afc21e435e52~mv2.png', 100000, 10),
  ('Boxwood Wall 6ft x 3ft', 'Boxwood Wall 6ft x 3ft.', 22500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_a58afd965db24fa086929fab3b00571a~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_a58afd965db24fa086929fab3b00571a~mv2.png', 22500, 10),
  ('Sugar Blossom Patisserie 🌸🍩', 'Sugar Blossom Patisserie 🌸🍩.', 50000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_6a2669ec7f3548af802309eccd44ec5f~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_6a2669ec7f3548af802309eccd44ec5f~mv2.png', 50000, 10),
  ('Rustic Red Barn Wall', 'Rustic Red Barn Wall.', 27500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_b79c0f9d01804a95bc3b22c179a1bac0~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_b79c0f9d01804a95bc3b22c179a1bac0~mv2.png', 27500, 10),
  ('F&M Arch Wall', 'F&M Arch Wall.', 15000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_9d51ac5ad17f4048a607e3989f4d6c15~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_9d51ac5ad17f4048a607e3989f4d6c15~mv2.jpg', 15000, 10),
  ('Fanta Shelf Wall | 8ft x 8ft', 'Fanta Shelf Wall | 8ft x 8ft.', 27500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_dcf9e12c7a54464c82e7594cae4f23e5~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_dcf9e12c7a54464c82e7594cae4f23e5~mv2.png', 27500, 10),
  ('Trio Wedding Gold Arch', 'Trio Wedding Gold Arch.', 105000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_54f2bd57be634107a4e786290f28d004~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_54f2bd57be634107a4e786290f28d004~mv2.png', 105000, 10),
  ('The Crain wall', 'The Crain wall.', 12500, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_c2ba7100b4b248cba24693813efa9b18~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_c2ba7100b4b248cba24693813efa9b18~mv2.png', 12500, 10),
  ('Alice flower box 6ft x 4ft', 'Alice flower box 6ft x 4ft.', 35000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_f4b792a69c944adca8bf39fdc5049db5~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_f4b792a69c944adca8bf39fdc5049db5~mv2.jpg', 35000, 10),
  ('Luxe Tote', 'Luxe Tote.', 65000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_7ac2093b20774d64805374ab07dbec48~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_7ac2093b20774d64805374ab07dbec48~mv2.png', 65000, 10),
  ('Store Front', 'Store Front.', 45000, cat_backdrops, 'https://static.wixstatic.com/media/938d0f_0d85b7b282504b0cbe2e48fef8da89bb~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_0d85b7b282504b0cbe2e48fef8da89bb~mv2.png', 45000, 10);

-- Bar Stools
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('LUX GOLD BAR STOOL', 'LUX GOLD BAR STOOL.', 2500, cat_bar_stools, 'https://placehold.co/600x400?text=LUX+GOLD+BAR+STOOL', 2500, 10),
  ('Stylish Vintage Barstool 30”', 'Stylish Vintage Barstool 30”.', 1200, cat_bar_stools, 'https://placehold.co/600x400?text=Stylish+Vintage+Barstool+30”', 1200, 10),
  ('Stylish Vintage Barstool 24”', 'Stylish Vintage Barstool 24”.', 1019, cat_bar_stools, 'https://placehold.co/600x400?text=Stylish+Vintage+Barstool+24”', 1019, 10),
  ('LUX SILVER BAR STOOL', 'LUX SILVER BAR STOOL.', 2000, cat_bar_stools, 'https://placehold.co/600x400?text=LUX+SILVER+BAR+STOOL', 2000, 10),
  ('O Back Gold Bar Stool', 'O Back Gold Bar Stool.', 2500, cat_bar_stools, 'https://placehold.co/600x400?text=O+Back+Gold+Bar+Stool', 2500, 10);

  -- Flower Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('RED FLOWER WALL BACKDROP', 'RED FLOWER WALL BACKDROP.', 40000, cat_flower_walls, 'https://placehold.co/600x400?text=RED+FLOWER+WALL+BACKDROP', 40000, 10),
  ('Grand Flower Wall Backdrop', 'Grand Flower Wall Backdrop.', 40000, cat_flower_walls, 'https://placehold.co/600x400?text=Grand+Flower+Wall+Backdrop', 40000, 10),
  ('FLOWER WALL & BALLOON', 'FLOWER WALL & BALLOON.', 52200, cat_flower_walls, 'https://placehold.co/600x400?text=FLOWER+WALL+&+BALLOON', 52200, 10),
  ('Flower Wall (Touch of Pink)', 'Flower Wall (Touch of Pink).', 25000, cat_flower_walls, 'https://placehold.co/600x400?text=Flower+Wall+(Touch+of+Pink)', 25000, 10);

  -- Shimmer Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Shimmer Wall (Gold)', 'Shimmer Wall (Gold).', 22500, cat_shimmer_walls, 'https://placehold.co/600x400?text=Shimmer+Wall+(Gold)', 22500, 10),
  ('Shimmer Wall (Black)', 'Shimmer Wall (Black).', 22500, cat_shimmer_walls, 'https://placehold.co/600x400?text=Shimmer+Wall+(Black)', 22500, 10),
  ('Shimmer Wall (Silver)', 'Shimmer Wall (Silver).', 22500, cat_shimmer_walls, 'https://placehold.co/600x400?text=Shimmer+Wall+(Silver)', 22500, 10);

  -- Soft Touch Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Soft Touch Wall (Black)', 'Soft Touch Wall (Black).', 15000, cat_soft_touch_walls, 'https://placehold.co/600x400?text=Soft+Touch+Wall+(Black)', 15000, 10);

  -- Decorations Props
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Green Tree', 'Green Tree.', 5000, cat_decor_props, 'https://placehold.co/600x400?text=Green+Tree', 5000, 10),
  ('Trio Wedding Gold Arch', 'Trio Wedding Gold Arch.', 105000, cat_decor_props, 'https://placehold.co/600x400?text=Trio+Wedding+Gold+Arch', 105000, 10),
  ('Telephone Booth', 'Telephone Booth.', 27500, cat_decor_props, 'https://placehold.co/600x400?text=Telephone+Booth', 27500, 10),
  ('Zebra', 'Zebra.', 12500, cat_decor_props, 'https://placehold.co/600x400?text=Zebra', 12500, 10),
  ('Giraffe', 'Giraffe.', 22500, cat_decor_props, 'https://placehold.co/600x400?text=Giraffe', 22500, 10),
  ('Elephant', 'Elephant.', 22500, cat_decor_props, 'https://placehold.co/600x400?text=Elephant', 22500, 10),
  ('Table Top Elephant', 'Table Top Elephant.', 1000, cat_decor_props, 'https://placehold.co/600x400?text=Table+Top+Elephant', 1000, 10),
  ('Gold Number Stand', 'Gold Number Stand.', 5000, cat_decor_props, 'https://placehold.co/600x400?text=Gold+Number+Stand', 5000, 10);

  -- LED Signs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Happy Birthday LED Sign', 'Happy Birthday LED Sign.', 7500, cat_led_signs, 'https://placehold.co/600x400?text=Happy+Birthday+LED+Sign', 7500, 10),
  ('Let''s Party LED Sign', 'Let''s Party LED Sign.', 7500, cat_led_signs, 'https://placehold.co/600x400?text=Let''s+Party+LED+Sign', 7500, 10);

  -- Lit Letters
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('BABY MARQUEE', 'BABY MARQUEE.', 50500, cat_lit_letters, 'https://placehold.co/600x400?text=BABY+MARQUEE', 50500, 10),
  ('OH BABY MARQUEE', 'OH BABY MARQUEE.', 50500, cat_lit_letters, 'https://placehold.co/600x400?text=OH+BABY+MARQUEE', 50500, 10),
  ('BLACK MARQUEE NUMBERS', 'BLACK MARQUEE NUMBERS.', 10000, cat_lit_letters, 'https://placehold.co/600x400?text=BLACK+MARQUEE+NUMBERS', 10000, 10),
  ('MARQUEE LETTER', 'MARQUEE LETTER.', 12500, cat_lit_letters, 'https://placehold.co/600x400?text=MARQUEE+LETTER', 12500, 10),
  ('LARGE MARQUEE CROSS WITH LIGHT', 'LARGE MARQUEE CROSS WITH LIGHT.', 12500, cat_lit_letters, 'https://placehold.co/600x400?text=LARGE+MARQUEE+CROSS+WITH+LIGHT', 12500, 10),
  ('WHITE MARQUEE NUMBER', 'WHITE MARQUEE NUMBER.', 8500, cat_lit_letters, 'https://placehold.co/600x400?text=WHITE+MARQUEE+NUMBER', 8500, 10);

-- Bar Counters
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Malibu Bar 6ft', 'Malibu Bar 6ft.', 32500, cat_bar_counters, 'https://placehold.co/600x400?text=Malibu+Bar+6ft', 32500, 10),
  ('Lux Bar', 'Lux Bar.', 35000, cat_bar_counters, 'https://placehold.co/600x400?text=Lux+Bar', 35000, 10),
  ('White CHAMPAGNE WALL', 'White CHAMPAGNE WALL.', 15000, cat_bar_counters, 'https://placehold.co/600x400?text=White+CHAMPAGNE+WALL', 15000, 10),
  ('Black Champagne Wall', 'Black Champagne Wall.', 18000, cat_bar_counters, 'https://placehold.co/600x400?text=Black+Champagne+Wall', 18000, 10),
  ('Walnut laminate bar', 'Walnut laminate bar.', 7500, cat_bar_counters, 'https://placehold.co/600x400?text=Walnut+laminate+bar', 7500, 10),
  ('White Formica Bar', 'White Formica Bar.', 7500, cat_bar_counters, 'https://placehold.co/600x400?text=White+Formica+Bar', 7500, 10),
  ('Laminate black bar', 'Laminate black bar.', 7500, cat_bar_counters, 'https://placehold.co/600x400?text=Laminate+black+bar', 7500, 10),
  ('GRASS BAR', 'GRASS BAR.', 15000, cat_bar_counters, 'https://placehold.co/600x400?text=GRASS+BAR', 15000, 10);

  -- Bar Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('White cocktail', 'White cocktail.', 1100, cat_bar_tables, 'https://placehold.co/600x400?text=White+cocktail', 1100, 10),
  ('Led Champagne table', 'Led Champagne table.', 5000, cat_bar_tables, 'https://placehold.co/600x400?text=Led+Champagne+table', 5000, 10),
  ('Highboy Cocktail Round Spandex Table cover', 'Highboy Cocktail Round Spandex Table cover.', 1350, cat_bar_tables, 'https://placehold.co/600x400?text=Highboy+Cocktail+Round+Spandex+Table+cover', 1350, 10),
  ('COCKTAIL TABLES', 'COCKTAIL TABLES.', 1450, cat_bar_tables, 'https://placehold.co/600x400?text=COCKTAIL+TABLES', 1450, 10),
  ('Spandex Tablecloth for Cocktail Tables', 'Spandex Tablecloth for Cocktail Tables.', 1350, cat_bar_tables, 'https://placehold.co/600x400?text=Spandex+Tablecloth+for+Cocktail+Tables', 1350, 10),
  ('LED COCKTABLE TABLE', 'LED COCKTABLE TABLE.', 3500, cat_bar_tables, 'https://placehold.co/600x400?text=LED+COCKTABLE+TABLE', 3500, 10),
  ('Trisha Bar Table (Silver)', 'Trisha Bar Table (Silver).', 10000, cat_bar_tables, 'https://placehold.co/600x400?text=Trisha+Bar+Table+(Silver)', 10000, 10),
  ('Trisha Bar Table (Gold)', 'Trisha Bar Table (Gold).', 10000, cat_bar_tables, 'https://placehold.co/600x400?text=Trisha+Bar+Table+(Gold)', 10000, 10),
  ('Circle Bar Table (Silver)', 'Circle Bar Table (Silver).', 10000, cat_bar_tables, 'https://placehold.co/600x400?text=Circle+Bar+Table+(Silver)', 10000, 10),
  ('Circle Bar Table (Gold)', 'Circle Bar Table (Gold).', 10000, cat_bar_tables, 'https://placehold.co/600x400?text=Circle+Bar+Table+(Gold)', 10000, 10);

  -- Benches & Ottomans
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Single Velvet Lux', 'Single Velvet Lux.', 19500, cat_benches, 'https://placehold.co/600x400?text=Single+Velvet+Lux', 19500, 10),
  ('Pink Elegance Loveseat', 'Pink Elegance Loveseat.', 19500, cat_benches, 'https://placehold.co/600x400?text=Pink+Elegance+Loveseat', 19500, 10),
  ('Elegance Lux Loveseat', 'Elegance Lux Loveseat.', 19500, cat_benches, 'https://placehold.co/600x400?text=Elegance+Lux+Loveseat', 19500, 10),
  ('Lounge Circles', 'Lounge Circles.', 6500, cat_benches, 'https://placehold.co/600x400?text=Lounge+Circles', 6500, 10),
  ('Hendrix 52" Velvet Flared Arm Loveseat', 'Hendrix 52" Velvet Flared Arm Loveseat.', 20000, cat_benches, 'https://placehold.co/600x400?text=Hendrix+52"+Velvet+Flared+Arm+Loveseat', 20000, 10),
  ('Cage sofa', 'Cage sofa.', 20625, cat_benches, 'https://placehold.co/600x400?text=Cage+sofa', 20625, 10);

  -- Sofas & Loveseats
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Wave sofa', 'Wave sofa.', 16000, cat_sofas, 'https://placehold.co/600x400?text=Wave+sofa', 16000, 10),
  ('Hendrix Velvet Flared Arm Loveseats', 'Hendrix Velvet Flared Arm Loveseats.', 16000, cat_sofas, 'https://placehold.co/600x400?text=Hendrix+Velvet+Flared+Arm+Loveseats', 16000, 10),
  ('Lux Sofa', 'Lux Sofa.', 15000, cat_sofas, 'https://placehold.co/600x400?text=Lux+Sofa', 15000, 10),
  ('Cage sofa', 'Cage sofa.', 20625, cat_sofas, 'https://placehold.co/600x400?text=Cage+sofa', 20625, 10),
  ('3 PIECE LUX SET', '3 PIECE LUX SET.', 27000, cat_sofas, 'https://placehold.co/600x400?text=3+PIECE+LUX+SET', 27000, 10),
  ('Lux Pink sofa', 'Lux Pink sofa.', 20000, cat_sofas, 'https://placehold.co/600x400?text=Lux+Pink+sofa', 20000, 10),
  ('fancy Royal Sofa', 'fancy Royal Sofa.', 24650, cat_sofas, 'https://placehold.co/600x400?text=fancy+Royal+Sofa', 24650, 10),
  ('NUDE SOFA', 'NUDE SOFA.', 20000, cat_sofas, 'https://placehold.co/600x400?text=NUDE+SOFA', 20000, 10),
  ('Chic Sofa (Black)', 'Chic Sofa (Black).', 30000, cat_sofas, 'https://placehold.co/600x400?text=Chic+Sofa+(Black)', 30000, 10),
  ('White Dotted Throne Sofa', 'White Dotted Throne Sofa.', 24000, cat_sofas, 'https://placehold.co/600x400?text=White+Dotted+Throne+Sofa', 24000, 10);

  -- Kids Backdrops
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Dreamland Train', 'Dreamland Train.', 42500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Dreamland+Train', 42500, 10),
  ('Princess Express Train', 'Princess Express Train.', 42500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Princess+Express+Train', 42500, 10),
  ('Story Book', 'Story Book.', 27500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Story+Book', 27500, 10),
  ('Royal Castle', 'Royal Castle.', 47500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Royal+Castle', 47500, 10),
  ('Blast Zone Magic Castle', 'Blast Zone Magic Castle.', 27500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Blast+Zone+Magic+Castle', 27500, 10);

  -- Kids Chairs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Kids Bow Back Chair', 'Kids Bow Back Chair.', 500, cat_kids_chairs, 'https://placehold.co/600x400?text=Kids+Bow+Back+Chair', 500, 10),
  ('kids Chiavari Blue Chair', 'kids Chiavari Blue Chair.', 500, cat_kids_chairs, 'https://placehold.co/600x400?text=kids+Chiavari+Blue+Chair', 500, 10),
  ('KIDS White Samsonite Chair', 'KIDS White Samsonite Chair.', 225, cat_kids_chairs, 'https://placehold.co/600x400?text=KIDS+White+Samsonite+Chair', 225, 10),
  ('Kids Bamboo Chair (Pink)', 'Kids Bamboo Chair (Pink).', 500, cat_kids_chairs, 'https://placehold.co/600x400?text=Kids+Bamboo+Chair+(Pink)', 500, 10);

  -- Kids Thrones
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Kids Bow Back Chair', 'Kids Bow Back Chair.', 12000, cat_kids_thrones, 'https://placehold.co/600x400?text=Kids+Bow+Back+Chair', 12000, 10),
  ('Kids King Throne Chair (White)', 'Kids King Throne Chair (White).', 12000, cat_kids_thrones, 'https://placehold.co/600x400?text=Kids+King+Throne+Chair+(White)', 12000, 10);

  -- Charger Plates
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Plain Red Chargers', 'Plain Red Chargers.', 650, cat_charger_plates, 'https://placehold.co/600x400?text=Plain+Red+Chargers', 650, 50),
  ('Eclipse Gold Charger', 'Eclipse Gold Charger.', 650, cat_charger_plates, 'https://placehold.co/600x400?text=Eclipse+Gold+Charger', 650, 50),
  ('Natural Tone Charger', 'Natural Tone Charger.', 100, cat_charger_plates, 'https://placehold.co/600x400?text=Natural+Tone+Charger', 100, 50),
  ('Reef Charger Plate (Pink)', 'Reef Charger Plate (Pink).', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Charger+Plate+(Pink)', 350, 50),
  ('Reef Charger Plate (Navy Blue)', 'Reef Charger Plate (Navy Blue).', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Charger+Plate+(Navy+Blue)', 350, 50),
  ('Reef Charger Plate (Purple)', 'Reef Charger Plate (Purple).', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Charger+Plate+(Purple)', 350, 50),
  ('Reef Charger Plate (Gold)', 'Reef Charger Plate (Gold).', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Charger+Plate+(Gold)', 350, 50),
  ('Reef Charger Plate (Black)', 'Reef Charger Plate (Black).', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Charger+Plate+(Black)', 350, 50),
  ('Reef Charger Plate (Aqua Blue)', 'Reef Charger Plate (Aqua Blue).', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Charger+Plate+(Aqua+Blue)', 350, 50),
  ('Reef Charger Plate (Baby Blue)', 'Reef Charger Plate (Baby Blue).', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Charger+Plate+(Baby+Blue)', 350, 50),
  ('Reef Charger Plate (Burgundy)', 'Reef Charger Plate (Burgundy).', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Charger+Plate+(Burgundy)', 350, 50),
  ('Reef Charger Plate (Silver)', 'Reef Charger Plate (Silver).', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Charger+Plate+(Silver)', 350, 50);

  -- Dinnerware
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('White Dessert Plate', 'White Dessert Plate.', 99, cat_dinnerware, 'https://placehold.co/600x400?text=White+Dessert+Plate', 99, 50),
  ('Blanc Wine Glass', 'Blanc Wine Glass.', 135, cat_dinnerware, 'https://placehold.co/600x400?text=Blanc+Wine+Glass', 135, 50),
  ('Rocks / Old Fashioned Glass', 'Rocks / Old Fashioned Glass.', 135, cat_dinnerware, 'https://placehold.co/600x400?text=Rocks+/+Old+Fashioned+Glass', 135, 50),
  ('Champagne Flute 6.25oz', 'Champagne Flute 6.25oz.', 125, cat_dinnerware, 'https://placehold.co/600x400?text=Champagne+Flute+6.25oz', 125, 50),
  ('Modern luxury Matte Gold Silverware', 'Modern luxury Matte Gold Silverware.', 195, cat_dinnerware, 'https://placehold.co/600x400?text=Modern+luxury+Matte+Gold+Silverware', 195, 50),
  ('Stoneware Mug 12oz', 'Stoneware Mug 12oz.', 99, cat_dinnerware, 'https://placehold.co/600x400?text=Stoneware+Mug+12oz', 99, 50),
  ('Stemless Glass 20.5oz', 'Stemless Glass 20.5oz.', 135, cat_dinnerware, 'https://placehold.co/600x400?text=Stemless+Glass+20.5oz', 135, 50),
  ('Stainless Steel Steak Knives', 'Stainless Steel Steak Knives.', 99, cat_dinnerware, 'https://placehold.co/600x400?text=Stainless+Steel+Steak+Knives', 99, 50),
  ('The Drop Flatware Stainless Steel Silverware', 'The Drop Flatware Stainless Steel Silverware.', 105, cat_dinnerware, 'https://placehold.co/600x400?text=The+Drop+Flatware+Stainless+Steel+Silverware', 105, 50),
  ('Bentley stainless steel spoon', 'Bentley stainless steel spoon.', 95, cat_dinnerware, 'https://placehold.co/600x400?text=Bentley+stainless+steel+spoon', 95, 50),
  ('White Plate 7.5 in', 'White Plate 7.5 in.', 99, cat_dinnerware, 'https://placehold.co/600x400?text=White+Plate+7.5+in', 99, 50),
  ('White Dinner Plate 10.5 in', 'White Dinner Plate 10.5 in.', 105, cat_dinnerware, 'https://placehold.co/600x400?text=White+Dinner+Plate+10.5+in', 105, 50),
  ('Classic Black Plate 10.5 in', 'Classic Black Plate 10.5 in.', 105, cat_dinnerware, 'https://placehold.co/600x400?text=Classic+Black+Plate+10.5+in', 105, 50),
  ('Classic Black Plate 7.5 in', 'Classic Black Plate 7.5 in.', 99, cat_dinnerware, 'https://placehold.co/600x400?text=Classic+Black+Plate+7.5+in', 99, 50),
  ('White serving Coupe Bone China Plate', 'White serving Coupe Bone China Plate.', 95, cat_dinnerware, 'https://placehold.co/600x400?text=White+serving+Coupe+Bone+China+Plate', 95, 50),
  ('Gold Rim Dinner Plates 10.5 in', 'Gold Rim Dinner Plates 10.5 in.', 125, cat_dinnerware, 'https://placehold.co/600x400?text=Gold+Rim+Dinner+Plates+10.5+in', 125, 50),
  ('Glass Pint Jar 16oz', 'Glass Pint Jar 16oz.', 125, cat_dinnerware, 'https://placehold.co/600x400?text=Glass+Pint+Jar+16oz', 125, 50),
  ('Glass Carafe 1 liter', 'Glass Carafe 1 liter.', 600, cat_dinnerware, 'https://placehold.co/600x400?text=Glass+Carafe+1+liter', 600, 50);

  -- Flowers & Centerpieces
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Green Tree', 'Green Tree.', 6500, cat_flowers, 'https://placehold.co/600x400?text=Green+Tree', 6500, 10),
  ('ELEGANT CANDLES', 'ELEGANT CANDLES.', 6500, cat_flowers, 'https://placehold.co/600x400?text=ELEGANT+CANDLES', 6500, 10),
  ('LUX TRIANGLE W/FLOWERS', 'LUX TRIANGLE W/FLOWERS.', 8500, cat_flowers, 'https://placehold.co/600x400?text=LUX+TRIANGLE+W/FLOWERS', 8500, 10),
  ('FLORAL BALL', 'FLORAL BALL.', 3500, cat_flowers, 'https://placehold.co/600x400?text=FLORAL+BALL', 3500, 10),
  ('3 GOBLETS', '3 GOBLETS.', 3500, cat_flowers, 'https://placehold.co/600x400?text=3+GOBLETS', 3500, 10),
  ('Spring Valley Centerpiece', 'Spring Valley Centerpiece.', 4500, cat_flowers, 'https://placehold.co/600x400?text=Spring+Valley+Centerpiece', 4500, 10),
  ('The Elegance Centerpiece', 'The Elegance Centerpiece.', 4500, cat_flowers, 'https://placehold.co/600x400?text=The+Elegance+Centerpiece', 4500, 10),
  ('Peach Time Centerpiece', 'Peach Time Centerpiece.', 4500, cat_flowers, 'https://placehold.co/600x400?text=Peach+Time+Centerpiece', 4500, 10),
  ('Flower Runner (Purple & Pink)', 'Flower Runner (Purple & Pink).', 37500, cat_flowers, 'https://placehold.co/600x400?text=Flower+Runner+(Purple+&+Pink)', 37500, 10),
  ('Flower Runner (Pink)', 'Flower Runner (Pink).', 12000, cat_flowers, 'https://placehold.co/600x400?text=Flower+Runner+(Pink)', 12000, 10),
  ('Flower Runner (Purple)', 'Flower Runner (Purple).', 12000, cat_flowers, 'https://placehold.co/600x400?text=Flower+Runner+(Purple)', 12000, 10);

  -- Table Linens
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('SOLID STRIPE TABLECLOTH', 'SOLID STRIPE TABLECLOTH.', 2500, cat_linens, 'https://placehold.co/600x400?text=SOLID+STRIPE+TABLECLOTH', 2500, 100),
  ('BEETHOVEN TABLECLOTH', 'BEETHOVEN TABLECLOTH.', 2500, cat_linens, 'https://placehold.co/600x400?text=BEETHOVEN+TABLECLOTH', 2500, 100),
  ('CHECKS TABLECLOTH', 'CHECKS TABLECLOTH.', 2500, cat_linens, 'https://placehold.co/600x400?text=CHECKS+TABLECLOTH', 2500, 100),
  ('PLAID TABLECLOTH', 'PLAID TABLECLOTH.', 2500, cat_linens, 'https://placehold.co/600x400?text=PLAID+TABLECLOTH', 2500, 100),
  ('AWNING STRIPE TABLECLOTH', 'AWNING STRIPE TABLECLOTH.', 2500, cat_linens, 'https://placehold.co/600x400?text=AWNING+STRIPE+TABLECLOTH', 2500, 100),
  ('VELVET TABLECLOTH', 'VELVET TABLECLOTH.', 2500, cat_linens, 'https://placehold.co/600x400?text=VELVET+TABLECLOTH', 2500, 100),
  ('RACE CAR TABLECLOTH', 'RACE CAR TABLECLOTH.', 3300, cat_linens, 'https://placehold.co/600x400?text=RACE+CAR+TABLECLOTH', 3300, 100),
  ('SEQUINS TABLECLOTH', 'SEQUINS TABLECLOTH.', 2500, cat_linens, 'https://placehold.co/600x400?text=SEQUINS+TABLECLOTH', 2500, 100),
  ('Flower on Sequin Taffeta Tablecloth 120" Round', 'Flower on Sequin Taffeta Tablecloth 120" Round.', 2500, cat_linens, 'https://placehold.co/600x400?text=Flower+on+Sequin+Taffeta+Tablecloth+120"+Round', 2500, 100),
  ('Large Rosette Flower Tablecloth', 'Large Rosette Flower Tablecloth.', 5000, cat_linens, 'https://placehold.co/600x400?text=Large+Rosette+Flower+Tablecloth', 5000, 100),
  ('ROUND PINTUCK TABLECLOTH', 'ROUND PINTUCK TABLECLOTH.', 2500, cat_linens, 'https://placehold.co/600x400?text=ROUND+PINTUCK+TABLECLOTH', 2500, 100),
  ('ROUND PAYETTE SEQUIN TABLECLOTH IRIDESCENT', 'ROUND PAYETTE SEQUIN TABLECLOTH IRIDESCENT.', 4000, cat_linens, 'https://placehold.co/600x400?text=ROUND+PAYETTE+SEQUIN+TABLECLOTH+IRIDESCENT', 4000, 100),
  ('RECTANGULAR POLYESTER TABLECLOTH', 'RECTANGULAR POLYESTER TABLECLOTH.', 1500, cat_linens, 'https://placehold.co/600x400?text=RECTANGULAR+POLYESTER+TABLECLOTH', 1500, 100),
  ('ROUND POLYESTER TABLECLOTH', 'ROUND POLYESTER TABLECLOTH.', 1500, cat_linens, 'https://placehold.co/600x400?text=ROUND+POLYESTER+TABLECLOTH', 1500, 100),
  ('ROUND SILK EMBROIDERED POLYESTER TABLECLOTH', 'ROUND SILK EMBROIDERED POLYESTER TABLECLOTH.', 2500, cat_linens, 'https://placehold.co/600x400?text=ROUND+SILK+EMBROIDERED+POLYESTER+TABLECLOTH', 2500, 100);

  -- Napkins
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Table Napkin (Any Color)', 'Table Napkin (Any Color).', 250, cat_napkins, 'https://placehold.co/600x400?text=Table+Napkin+(Any+Color)', 250, 100);

  -- Misc
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Green Columns', 'Green Columns.', 20000, cat_misc, 'https://placehold.co/600x400?text=Green+Columns', 20000, 10),
  ('Pink Columns', 'Pink Columns.', 20000, cat_misc, 'https://placehold.co/600x400?text=Pink+Columns', 20000, 10),
  ('Blush Columns', 'Blush Columns.', 20000, cat_misc, 'https://placehold.co/600x400?text=Blush+Columns', 20000, 10),
  ('Hot Pink Columns', 'Hot Pink Columns.', 20000, cat_misc, 'https://placehold.co/600x400?text=Hot+Pink+Columns', 20000, 10),
  ('Purple Columns', 'Purple Columns.', 20000, cat_misc, 'https://placehold.co/600x400?text=Purple+Columns', 20000, 10),
  ('NUDE COLUMNS', 'NUDE COLUMNS.', 20000, cat_misc, 'https://placehold.co/600x400?text=NUDE+COLUMNS', 20000, 10);

  -- Pedestals
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Slatted Pedestal', 'Slatted Pedestal.', 6000, cat_pedestals, 'https://placehold.co/600x400?text=Slatted+Pedestal', 6000, 10),
  ('Silver Pedestal', 'Silver Pedestal.', 6000, cat_pedestals, 'https://placehold.co/600x400?text=Silver+Pedestal', 6000, 10),
  ('BLACK COLUMNS', 'BLACK COLUMNS.', 20000, cat_pedestals, 'https://placehold.co/600x400?text=BLACK+COLUMNS', 20000, 10),
  ('3 PIECE SET OF METAL CYLINDER PEDESTALS DISPLAY - SILVER', '3 PIECE SET OF METAL CYLINDER PEDESTALS DISPLAY - SILVER.', 15000, cat_pedestals, 'https://placehold.co/600x400?text=3+PIECE+SET+OF+METAL+CYLINDER+PEDESTALS+DISPLAY+-+', 15000, 10),
  ('Royal Blue Columns', 'Royal Blue Columns.', 20000, cat_pedestals, 'https://placehold.co/600x400?text=Royal+Blue+Columns', 20000, 10),
  ('Ruth Pedestals (Gold)', 'Ruth Pedestals (Gold).', 22500, cat_pedestals, 'https://placehold.co/600x400?text=Ruth+Pedestals+(Gold)', 22500, 10),
  ('Gold Square Pedestals', 'Gold Square Pedestals.', 8000, cat_pedestals, 'https://placehold.co/600x400?text=Gold+Square+Pedestals', 8000, 10),
  ('Ruth Pedestals (Silver)', 'Ruth Pedestals (Silver).', 22500, cat_pedestals, 'https://placehold.co/600x400?text=Ruth+Pedestals+(Silver)', 22500, 10),
  ('Cylinder Acrylic Pedestals (White)', 'Cylinder Acrylic Pedestals (White).', 16000, cat_pedestals, 'https://placehold.co/600x400?text=Cylinder+Acrylic+Pedestals+(White)', 16000, 10);

  -- Shelves
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Charice Shelf', 'Charice Shelf.', 15000, cat_shelves, 'https://placehold.co/600x400?text=Charice+Shelf', 15000, 10);

  -- Sweets Carts
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Prime cycle cart', 'Prime cycle cart.', 20000, cat_sweets_carts, 'https://placehold.co/600x400?text=Prime+cycle+cart', 20000, 10),
  ('Pumpkin Cart', 'Pumpkin Cart.', 20000, cat_sweets_carts, 'https://placehold.co/600x400?text=Pumpkin+Cart', 20000, 10),
  ('White Rustic cart', 'White Rustic cart.', 30000, cat_sweets_carts, 'https://placehold.co/600x400?text=White+Rustic+cart', 30000, 10),
  ('All White Cart', 'All White Cart.', 25000, cat_sweets_carts, 'https://placehold.co/600x400?text=All+White+Cart', 25000, 10),
  ('White Wagon Cart', 'White Wagon Cart.', 22500, cat_sweets_carts, 'https://placehold.co/600x400?text=White+Wagon+Cart', 22500, 10);

  -- Cake Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('LED ROSES TABLE', 'LED ROSES TABLE.', 15000, cat_cake_tables, 'https://placehold.co/600x400?text=LED+ROSES+TABLE', 15000, 10),
  ('Squeeze Me Stand (Blue)', 'Squeeze Me Stand (Blue).', 12500, cat_cake_tables, 'https://placehold.co/600x400?text=Squeeze+Me+Stand+(Blue)', 12500, 10),
  ('Squeeze Me Stand (Pink)', 'Squeeze Me Stand (Pink).', 12500, cat_cake_tables, 'https://placehold.co/600x400?text=Squeeze+Me+Stand+(Pink)', 12500, 10),
  ('GIRL Treat Table', 'GIRL Treat Table.', 17500, cat_cake_tables, 'https://placehold.co/600x400?text=GIRL+Treat+Table', 17500, 10),
  ('BOY Treat Table', 'BOY Treat Table.', 15000, cat_cake_tables, 'https://placehold.co/600x400?text=BOY+Treat+Table', 15000, 10),
  ('Diamond Cake Table (Gold)', 'Diamond Cake Table (Gold).', 16000, cat_cake_tables, 'https://placehold.co/600x400?text=Diamond+Cake+Table+(Gold)', 16000, 10);

  -- Tents
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Tent Installation', 'Tent Installation.', 12500, cat_tents, 'https://placehold.co/600x400?text=Tent+Installation', 12500, 10),
  ('10x10 Tent', '10x10 Tent.', 15000, cat_tents, 'https://placehold.co/600x400?text=10x10+Tent', 15000, 10),
  ('20x30 Tent', '20x30 Tent.', 67500, cat_tents, 'https://placehold.co/600x400?text=20x30+Tent', 67500, 10),
  ('20x40 Tent', '20x40 Tent.', 87500, cat_tents, 'https://placehold.co/600x400?text=20x40+Tent', 87500, 10),
  ('20x20 Tent', '20x20 Tent.', 47500, cat_tents, 'https://placehold.co/600x400?text=20x20+Tent', 47500, 10),
  ('LED Cabana', 'LED Cabana.', 71500, cat_tents, 'https://placehold.co/600x400?text=LED+Cabana', 71500, 10),
  ('Single Cabana', 'Single Cabana.', 65000, cat_tents, 'https://placehold.co/600x400?text=Single+Cabana', 65000, 10),
  ('Outdoor Package #1', 'Outdoor Package #1.', 99000, cat_tents, 'https://placehold.co/600x400?text=Outdoor+Package+#1', 99000, 10),
  ('Outdoor Package #2', 'Outdoor Package #2.', 129350, cat_tents, 'https://placehold.co/600x400?text=Outdoor+Package+#2', 129350, 10),
  ('Outdoor Package #3', 'Outdoor Package #3.', 114500, cat_tents, 'https://placehold.co/600x400?text=Outdoor+Package+#3', 114500, 10),
  ('Outdoor Package #4', 'Outdoor Package #4.', 168150, cat_tents, 'https://placehold.co/600x400?text=Outdoor+Package+#4', 168150, 10);

  -- Buffet Service
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('White Wagon Cart', 'White Wagon Cart.', 22500, cat_buffet, 'https://placehold.co/600x400?text=White+Wagon+Cart', 22500, 10),
  ('White serving Coupe Bone China Plate', 'White serving Coupe Bone China Plate.', 95, cat_buffet, 'https://placehold.co/600x400?text=White+serving+Coupe+Bone+China+Plate', 95, 10),
  ('Gold Cake Stand', 'Gold Cake Stand.', 5000, cat_buffet, 'https://placehold.co/600x400?text=Gold+Cake+Stand', 5000, 10);

  -- Chafing Dishes
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('6 BURNER STOVE', '6 BURNER STOVE.', 15000, cat_chafing, 'https://placehold.co/600x400?text=6+BURNER+STOVE', 15000, 10),
  ('Char Griller', 'Char Griller.', 12500, cat_chafing, 'https://placehold.co/600x400?text=Char+Griller', 12500, 10),
  ('Food warmer', 'Food warmer.', 4500, cat_chafing, 'https://placehold.co/600x400?text=Food+warmer', 4500, 10);

  -- Cooking & Prep
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Food warmer', 'Food warmer.', 4500, cat_cooking, 'https://placehold.co/600x400?text=Food+warmer', 4500, 10),
  ('Elite Dripless Rectangular Chafer with Gold', 'Elite Dripless Rectangular Chafer with Gold.', 4500, cat_cooking, 'https://placehold.co/600x400?text=Elite+Dripless+Rectangular+Chafer+with+Gold', 4500, 10),
  ('Renaissance Chafer', 'Renaissance Chafer.', 3000, cat_cooking, 'https://placehold.co/600x400?text=Renaissance+Chafer', 3000, 10),
  ('Economy 8 Qt. Full Size Stainless Steel Chafer', 'Economy 8 Qt. Full Size Stainless Steel Chafer.', 1500, cat_cooking, 'https://placehold.co/600x400?text=Economy+8+Qt.+Full+Size+Stainless+Steel+Chafe', 1500, 10),
  ('Deluxe 8 Qt. Full Size Gold Accent Chafer', 'Deluxe 8 Qt. Full Size Gold Accent Chafer.', 2500, cat_cooking, 'https://placehold.co/600x400?text=Deluxe+8+Qt.+Full+Size+Gold+Accent+Chafer', 2500, 10),
  ('Deluxe 4 Qt. Round Gold Accent Chafer', 'Deluxe 4 Qt. Round Gold Accent Chafer.', 1500, cat_cooking, 'https://placehold.co/600x400?text=Deluxe+4+Qt.+Round+Gold+Accent+Chafer', 1500, 10),
  ('Classic Half Size Round Chafer', 'Classic Half Size Round Chafer.', 2500, cat_cooking, 'https://placehold.co/600x400?text=Classic+Half+Size+Round+Chafer', 2500, 10),
  ('Full Size Chafer Choice Classic 8 Qt.', 'Full Size Chafer Choice Classic 8 Qt..', 2500, cat_cooking, 'https://placehold.co/600x400?text=Full+Size+Chafer+Choice+Classic+8+Qt.', 2500, 10);

  -- Flooring & Staging
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Installation', 'Installation.', 12500, cat_flooring, 'https://placehold.co/600x400?text=Installation', 12500, 10),
  ('Dance Floor 3x3', 'Dance Floor 3x3.', 3200, cat_flooring, 'https://placehold.co/600x400?text=Dance+Floor+3x3', 3200, 10),
  ('QuickLock Staging 8''x8'' Indoor/Outdoor Stage System', 'QuickLock Staging 8''x8'' Indoor/Outdoor Stage System.', 45000, cat_flooring, 'https://placehold.co/600x400?text=QuickLock+Staging+8''x8''+Indoor/Outdoor+Stag', 45000, 10),
  ('Pure white Stage 8x8', 'Pure white Stage 8x8.', 80000, cat_flooring, 'https://placehold.co/600x400?text=Pure+white+Stage+8x8', 80000, 10),
  ('Acrylic Stage 8''x 8''', 'Acrylic Stage 8''x 8''.', 57500, cat_flooring, 'https://placehold.co/600x400?text=Acrylic+Stage+8''x+8''', 57500, 10);

  -- Kids Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('KIDS 6FT TABLE', 'KIDS 6FT TABLE.', 1500, cat_kids_tables, 'https://placehold.co/600x400?text=KIDS+6FT+TABLE', 1500, 10);

END $$;

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
  ('Banquet Round Party Table', 'Round banquet table for parties.', 1100, cat_tables, 'https://placehold.co/600x400?text=Round+Banquet+Table', 1100, 20),
  ('Rectangular Banquet Table', 'Rectangular banquet table.', 1100, cat_tables, 'https://placehold.co/600x400?text=Rectangular+Banquet+Table', 1100, 20),
  ('Gold Mirror Table', 'Luxurious gold mirror table.', 25000, cat_tables, 'https://placehold.co/600x400?text=Gold+Mirror+Table', 25000, 5),
  ('Gold Serpentine Table', 'Unique gold serpentine table.', 22500, cat_tables, 'https://placehold.co/600x400?text=Gold+Serpentine+Table', 22500, 5),
  ('Vogue Triangular Table', 'Modern vogue triangular table.', 35000, cat_tables, 'https://placehold.co/600x400?text=Vogue+Triangular+Table', 35000, 5),
  ('Fab Glass Table', 'Fabulous glass table.', 25000, cat_tables, 'https://placehold.co/600x400?text=Fab+Glass+Table', 25000, 5),
  ('Clear Rectangular Table', 'Modern clear rectangular table.', 25000, cat_tables, 'https://placehold.co/600x400?text=Clear+Rectangular+Table', 25000, 5),
  ('Olivia Rectangular Table', 'Elegant Olivia rectangular table.', 35000, cat_tables, 'https://placehold.co/600x400?text=Olivia+Rectangular+Table', 35000, 5);

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
  ('Grand Flower Wall Backdrop', 'Stunning grand flower wall.', 40000, cat_flower_walls, 'https://placehold.co/600x400?text=Grand+Flower+Wall', 40000, 2),
  ('Flower Wall & Balloon', 'Flower wall with balloon garland.', 52200, cat_flower_walls, 'https://placehold.co/600x400?text=Flower+Wall+Balloon', 52200, 2),
  ('Flower Wall (Touch of Pink)', 'Flower wall with pink accents.', 25000, cat_flower_walls, 'https://placehold.co/600x400?text=Flower+Wall+Pink', 25000, 2);

  -- Shimmer Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Shimmer Wall (Gold)', 'Gold shimmer wall.', 22500, cat_shimmer_walls, 'https://placehold.co/600x400?text=Shimmer+Wall+Gold', 22500, 3),
  ('Shimmer Wall (Black)', 'Black shimmer wall.', 22500, cat_shimmer_walls, 'https://placehold.co/600x400?text=Shimmer+Wall+Black', 22500, 3),
  ('Shimmer Wall (Silver)', 'Silver shimmer wall.', 22500, cat_shimmer_walls, 'https://placehold.co/600x400?text=Shimmer+Wall+Silver', 22500, 3);

  -- Soft Touch Walls
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Soft Touch Wall (Black)', 'Black soft touch wall.', 15000, cat_soft_touch_walls, 'https://placehold.co/600x400?text=Soft+Touch+Wall', 15000, 2);

  -- Decorations Props
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Trio Wedding Gold Arch', 'Set of 3 gold wedding arches.', 105000, cat_decor_props, 'https://placehold.co/600x400?text=Trio+Gold+Arch', 105000, 1),
  ('Telephone Booth', 'Classic telephone booth prop.', 27500, cat_decor_props, 'https://placehold.co/600x400?text=Telephone+Booth', 27500, 1),
  ('Zebra Prop', 'Life-size zebra prop.', 12500, cat_decor_props, 'https://placehold.co/600x400?text=Zebra', 12500, 1),
  ('Giraffe Prop', 'Life-size giraffe prop.', 22500, cat_decor_props, 'https://placehold.co/600x400?text=Giraffe', 22500, 1),
  ('Elephant Prop', 'Life-size elephant prop.', 22500, cat_decor_props, 'https://placehold.co/600x400?text=Elephant', 22500, 1),
  ('Table Top Elephant', 'Small table top elephant decor.', 1000, cat_decor_props, 'https://placehold.co/600x400?text=Table+Top+Elephant', 1000, 10),
  ('Gold Number Stand', 'Gold stand for numbers.', 5000, cat_decor_props, 'https://placehold.co/600x400?text=Gold+Number+Stand', 5000, 10);

  -- LED Signs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Happy Birthday LED Sign', 'Neon Happy Birthday sign.', 7500, cat_led_signs, 'https://placehold.co/600x400?text=Happy+Birthday+Sign', 7500, 5),
  ('Let''s Party LED Sign', 'Neon Let''s Party sign.', 7500, cat_led_signs, 'https://placehold.co/600x400?text=Lets+Party+Sign', 7500, 5);

  -- Lit Letters
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('OH BABY Marquee', 'Marquee letters spelling OH BABY.', 50500, cat_lit_letters, 'https://placehold.co/600x400?text=OH+BABY', 50500, 1),
  ('Black Marquee Numbers', 'Black marquee numbers (per digit).', 10000, cat_lit_letters, 'https://placehold.co/600x400?text=Black+Marquee+Numbers', 10000, 10),
  ('Marquee Letter', 'Individual marquee letter.', 12500, cat_lit_letters, 'https://placehold.co/600x400?text=Marquee+Letter', 12500, 50),
  ('Large Marquee Cross', 'Large marquee cross with lights.', 12500, cat_lit_letters, 'https://placehold.co/600x400?text=Marquee+Cross', 12500, 1),
  ('White Marquee Number', 'White marquee number (per digit).', 8500, cat_lit_letters, 'https://placehold.co/600x400?text=White+Marquee+Number', 8500, 10);

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
  ('LED Champagne Table', 'Illuminated champagne table.', 5000, cat_bar_tables, 'https://placehold.co/600x400?text=LED+Champagne+Table', 5000, 5),
  ('Highboy Cocktail Table Cover', 'Spandex cover for highboy tables.', 1350, cat_bar_tables, 'https://placehold.co/600x400?text=Highboy+Cover', 1350, 20),
  ('Cocktail Table', 'Standard cocktail table.', 1450, cat_bar_tables, 'https://placehold.co/600x400?text=Cocktail+Table', 1450, 20),
  ('LED Cocktail Table', 'Illuminated cocktail table.', 3500, cat_bar_tables, 'https://placehold.co/600x400?text=LED+Cocktail+Table', 3500, 10),
  ('Trisha Bar Table (Silver)', 'Silver Trisha bar table.', 10000, cat_bar_tables, 'https://placehold.co/600x400?text=Trisha+Silver', 10000, 5),
  ('Trisha Bar Table (Gold)', 'Gold Trisha bar table.', 10000, cat_bar_tables, 'https://placehold.co/600x400?text=Trisha+Gold', 10000, 5),
  ('Circle Bar Table (Silver)', 'Silver circle bar table.', 10000, cat_bar_tables, 'https://placehold.co/600x400?text=Circle+Silver', 10000, 5),
  ('Circle Bar Table (Gold)', 'Gold circle bar table.', 10000, cat_bar_tables, 'https://placehold.co/600x400?text=Circle+Gold', 10000, 5);

  -- Benches & Ottomans
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Pink Elegance Loveseat', 'Elegant pink loveseat.', 19500, cat_benches, 'https://placehold.co/600x400?text=Pink+Loveseat', 19500, 2),
  ('Elegance Lux Loveseat', 'Luxury elegance loveseat.', 19500, cat_benches, 'https://placehold.co/600x400?text=Elegance+Loveseat', 19500, 2),
  ('Lounge Circles', 'Circular lounge seating.', 6500, cat_benches, 'https://placehold.co/600x400?text=Lounge+Circles', 6500, 5),
  ('Hendrix Velvet Loveseat', 'Hendrix 52" velvet flared arm loveseat.', 20000, cat_benches, 'https://placehold.co/600x400?text=Hendrix+Loveseat', 20000, 2);

  -- Sofas & Loveseats
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Hendrix Velvet Sofa', 'Hendrix velvet flared arm sofa.', 16000, cat_sofas, 'https://placehold.co/600x400?text=Hendrix+Sofa', 16000, 2),
  ('Lux Sofa', 'Standard luxury sofa.', 15000, cat_sofas, 'https://placehold.co/600x400?text=Lux+Sofa', 15000, 2),
  ('Cage Sofa', 'Modern cage style sofa.', 20625, cat_sofas, 'https://placehold.co/600x400?text=Cage+Sofa', 20625, 2),
  ('3 Piece Lux Set', 'Complete 3-piece luxury furniture set.', 27000, cat_sofas, 'https://placehold.co/600x400?text=3+Piece+Set', 27000, 1),
  ('Lux Pink Sofa', 'Pink luxury sofa.', 20000, cat_sofas, 'https://placehold.co/600x400?text=Lux+Pink+Sofa', 20000, 1),
  ('Fancy Royal Sofa', 'Ornate royal style sofa.', 24650, cat_sofas, 'https://placehold.co/600x400?text=Royal+Sofa', 24650, 1),
  ('Nude Sofa', 'Nude colored sofa.', 20000, cat_sofas, 'https://placehold.co/600x400?text=Nude+Sofa', 20000, 1),
  ('Chic Sofa (Black)', 'Black chic sofa.', 30000, cat_sofas, 'https://placehold.co/600x400?text=Chic+Black+Sofa', 30000, 1),
  ('White Dotted Throne Sofa', 'White throne sofa with dots.', 24000, cat_sofas, 'https://placehold.co/600x400?text=Throne+Sofa', 24000, 1);

  -- Kids Backdrops
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Princess Express Train', 'Princess themed train backdrop.', 42500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Princess+Train', 42500, 1),
  ('Story Book Backdrop', 'Story book themed backdrop.', 27500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Story+Book', 27500, 1),
  ('Royal Castle', 'Royal castle backdrop.', 47500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Royal+Castle', 47500, 1),
  ('Blast Zone Magic Castle', 'Inflatable magic castle.', 27500, cat_kids_backdrops, 'https://placehold.co/600x400?text=Magic+Castle', 27500, 1);

  -- Kids Chairs
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Kids Chiavari Chair (Blue)', 'Blue Chiavari chair for kids.', 500, cat_kids_chairs, 'https://placehold.co/600x400?text=Kids+Chiavari+Blue', 500, 20),
  ('Kids White Samsonite Chair', 'White folding chair for kids.', 225, cat_kids_chairs, 'https://placehold.co/600x400?text=Kids+White+Samsonite', 225, 30),
  ('Kids Bamboo Chair (Pink)', 'Pink bamboo chair for kids.', 500, cat_kids_chairs, 'https://placehold.co/600x400?text=Kids+Bamboo+Pink', 500, 20);

  -- Kids Thrones
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Kids King Throne Chair (White)', 'White king throne chair for kids.', 12000, cat_kids_thrones, 'https://placehold.co/600x400?text=Kids+King+Throne', 12000, 2);

  -- Charger Plates
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Eclipse Gold Charger', 'Gold eclipse charger plate.', 650, cat_charger_plates, 'https://placehold.co/600x400?text=Eclipse+Gold', 650, 100),
  ('Natural Tone Charger', 'Natural tone charger plate.', 100, cat_charger_plates, 'https://placehold.co/600x400?text=Natural+Tone', 100, 100),
  ('Reef Charger Plate (Pink)', 'Pink reef charger plate.', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Pink', 350, 50),
  ('Reef Charger Plate (Gold)', 'Gold reef charger plate.', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Gold', 350, 50),
  ('Reef Charger Plate (Silver)', 'Silver reef charger plate.', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Silver', 350, 50),
  ('Reef Charger Plate (Black)', 'Black reef charger plate.', 350, cat_charger_plates, 'https://placehold.co/600x400?text=Reef+Black', 350, 50);

  -- Dinnerware
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Blanc Wine Glass', 'Elegant wine glass.', 135, cat_dinnerware, 'https://placehold.co/600x400?text=Wine+Glass', 135, 100),
  ('Champagne Flute', 'Classic champagne flute.', 125, cat_dinnerware, 'https://placehold.co/600x400?text=Champagne+Flute', 125, 100),
  ('Gold Flatware Set', 'Matte gold silverware.', 195, cat_dinnerware, 'https://placehold.co/600x400?text=Gold+Flatware', 195, 100),
  ('White Dinner Plate', '10.5 inch white dinner plate.', 105, cat_dinnerware, 'https://placehold.co/600x400?text=White+Dinner+Plate', 105, 100),
  ('Black Dinner Plate', '10.5 inch black dinner plate.', 105, cat_dinnerware, 'https://placehold.co/600x400?text=Black+Dinner+Plate', 105, 100),
  ('Gold Rim Dinner Plate', 'Dinner plate with gold rim.', 125, cat_dinnerware, 'https://placehold.co/600x400?text=Gold+Rim+Plate', 125, 100),
  ('Glass Carafe', '1 liter glass carafe.', 600, cat_dinnerware, 'https://placehold.co/600x400?text=Glass+Carafe', 600, 20);

  -- Flowers & Centerpieces
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Elegant Candles', 'Set of elegant candles.', 6500, cat_flowers, 'https://placehold.co/600x400?text=Candles', 6500, 10),
  ('Lux Triangle w/ Flowers', 'Triangle arch with flowers.', 8500, cat_flowers, 'https://placehold.co/600x400?text=Triangle+Flowers', 8500, 5),
  ('Floral Ball', 'Decorative floral ball.', 3500, cat_flowers, 'https://placehold.co/600x400?text=Floral+Ball', 3500, 10),
  ('Spring Valley Centerpiece', 'Spring themed centerpiece.', 4500, cat_flowers, 'https://placehold.co/600x400?text=Spring+Centerpiece', 4500, 10),
  ('Flower Runner (Purple & Pink)', 'Large flower runner.', 37500, cat_flowers, 'https://placehold.co/600x400?text=Flower+Runner', 37500, 2);

  -- Table Linens
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Velvet Tablecloth', 'Luxurious velvet tablecloth.', 2500, cat_linens, 'https://placehold.co/600x400?text=Velvet+Tablecloth', 2500, 20),
  ('Sequins Tablecloth', 'Sparkling sequins tablecloth.', 2500, cat_linens, 'https://placehold.co/600x400?text=Sequins+Tablecloth', 2500, 20),
  ('Large Rosette Tablecloth', 'Tablecloth with large rosettes.', 5000, cat_linens, 'https://placehold.co/600x400?text=Rosette+Tablecloth', 5000, 10),
  ('Payette Sequin Tablecloth', 'Iridescent payette sequin tablecloth.', 4000, cat_linens, 'https://placehold.co/600x400?text=Payette+Tablecloth', 4000, 10);

  -- Napkins
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Table Napkin (Any Color)', 'Cloth table napkin (various colors available).', 250, cat_napkins, 'https://placehold.co/600x400?text=Napkin', 250, 500);

  -- Misc
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Green Columns', 'Decorative green columns.', 20000, cat_misc, 'https://placehold.co/600x400?text=Green+Columns', 20000, 2),
  ('Pink Columns', 'Decorative pink columns.', 20000, cat_misc, 'https://placehold.co/600x400?text=Pink+Columns', 20000, 2);

  -- Pedestals
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Silver Pedestal', 'Silver display pedestal.', 6000, cat_pedestals, 'https://placehold.co/600x400?text=Silver+Pedestal', 6000, 4),
  ('Black Columns', 'Black display columns.', 20000, cat_pedestals, 'https://placehold.co/600x400?text=Black+Columns', 20000, 2),
  ('Cylinder Pedestals Set', 'Set of 3 metal cylinder pedestals.', 15000, cat_pedestals, 'https://placehold.co/600x400?text=Cylinder+Pedestals', 15000, 2),
  ('Ruth Pedestals (Gold)', 'Gold Ruth style pedestals.', 22500, cat_pedestals, 'https://placehold.co/600x400?text=Ruth+Gold', 22500, 2),
  ('Acrylic Pedestals (White)', 'White acrylic cylinder pedestals.', 16000, cat_pedestals, 'https://placehold.co/600x400?text=Acrylic+Pedestals', 16000, 2);

  -- Shelves
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Charice Shelf', 'Charice display shelf.', 15000, cat_shelves, 'https://placehold.co/600x400?text=Charice+Shelf', 15000, 2);

  -- Sweets Carts
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Pumpkin Cart', 'Pumpkin shaped cart.', 20000, cat_sweets_carts, 'https://placehold.co/600x400?text=Pumpkin+Cart', 20000, 1),
  ('White Rustic Cart', 'Rustic white cart.', 30000, cat_sweets_carts, 'https://placehold.co/600x400?text=Rustic+Cart', 30000, 1),
  ('All White Cart', 'Classic all white cart.', 25000, cat_sweets_carts, 'https://placehold.co/600x400?text=White+Cart', 25000, 1),
  ('White Wagon Cart', 'White wagon style cart.', 22500, cat_sweets_carts, 'https://placehold.co/600x400?text=Wagon+Cart', 22500, 1);

  -- Cake Tables
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('LED Roses Table', 'Table with LED roses.', 15000, cat_cake_tables, 'https://placehold.co/600x400?text=LED+Roses+Table', 15000, 2),
  ('Squeeze Me Stand (Blue)', 'Blue squeeze me stand.', 12500, cat_cake_tables, 'https://placehold.co/600x400?text=Squeeze+Me+Blue', 12500, 2),
  ('Squeeze Me Stand (Pink)', 'Pink squeeze me stand.', 12500, cat_cake_tables, 'https://placehold.co/600x400?text=Squeeze+Me+Pink', 12500, 2),
  ('Girl Treat Table', 'Treat table for girls.', 17500, cat_cake_tables, 'https://placehold.co/600x400?text=Girl+Treat+Table', 17500, 2),
  ('Boy Treat Table', 'Treat table for boys.', 15000, cat_cake_tables, 'https://placehold.co/600x400?text=Boy+Treat+Table', 15000, 2),
  ('Diamond Cake Table (Gold)', 'Gold diamond cake table.', 16000, cat_cake_tables, 'https://placehold.co/600x400?text=Diamond+Cake+Table', 16000, 2);

  -- Tents
  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES
  ('Tent Installation', 'Professional tent installation.', 12500, cat_tents, 'https://placehold.co/600x400?text=Tent+Install', 12500, 10),
  ('10x10 Tent', '10x10 foot tent.', 15000, cat_tents, 'https://placehold.co/600x400?text=10x10+Tent', 15000, 5),
  ('20x30 Tent', '20x30 foot tent.', 67500, cat_tents, 'https://placehold.co/600x400?text=20x30+Tent', 67500, 2),
  ('20x40 Tent', '20x40 foot tent.', 87500, cat_tents, 'https://placehold.co/600x400?text=20x40+Tent', 87500, 2),
  ('20x20 Tent', '20x20 foot tent.', 47500, cat_tents, 'https://placehold.co/600x400?text=20x20+Tent', 47500, 2),
  ('LED Cabana', 'Illuminated cabana.', 71500, cat_tents, 'https://placehold.co/600x400?text=LED+Cabana', 71500, 2),
  ('Single Cabana', 'Single cabana with sofa and table.', 65000, cat_tents, 'https://placehold.co/600x400?text=Single+Cabana', 65000, 2),
  ('Outdoor Package #1', 'Basic outdoor event package.', 99000, cat_tents, 'https://placehold.co/600x400?text=Outdoor+Pkg+1', 99000, 1),
  ('Outdoor Package #2', 'Standard outdoor event package.', 129350, cat_tents, 'https://placehold.co/600x400?text=Outdoor+Pkg+2', 129350, 1),
  ('Outdoor Package #3', 'Premium outdoor event package.', 114500, cat_tents, 'https://placehold.co/600x400?text=Outdoor+Pkg+3', 114500, 1),
  ('Outdoor Package #4', 'Deluxe outdoor event package.', 168150, cat_tents, 'https://placehold.co/600x400?text=Outdoor+Pkg+4', 168150, 1);

END $$;

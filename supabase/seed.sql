-- Seed Categories
INSERT INTO categories (name, slug, description) VALUES
('Seating', 'seating', 'Chairs, sofas, and lounge furniture'),
('Furniture', 'furniture', 'Tables, bars, and accent pieces'),
('Lighting', 'lighting', 'Chandeliers, lamps, and ambient lighting'),
('Tables', 'tables', 'Dining tables, cocktail tables, and side tables'),
('Tableware', 'tableware', 'Plates, glasses, and cutlery'),
('Decor', 'decor', 'Vases, candle holders, and decorative accents')
ON CONFLICT (name) DO NOTHING;

-- Seed Products (using placeholders for IDs, assuming categories exist)
-- Note: In a real scenario, we'd need to look up category IDs. 
-- For this seed, we'll assume the user runs this on a fresh DB or handles ID mapping.
-- Since we can't easily look up IDs in a simple seed file without PL/pgSQL, 
-- we will insert products and let the user assign categories in the admin panel if needed,
-- OR we can use a DO block to look them up.

DO $$
DECLARE
  seating_id uuid;
  furniture_id uuid;
  lighting_id uuid;
  tables_id uuid;
  tableware_id uuid;
  decor_id uuid;
BEGIN
  SELECT id INTO seating_id FROM categories WHERE slug = 'seating';
  SELECT id INTO furniture_id FROM categories WHERE slug = 'furniture';
  SELECT id INTO lighting_id FROM categories WHERE slug = 'lighting';
  SELECT id INTO tables_id FROM categories WHERE slug = 'tables';
  SELECT id INTO tableware_id FROM categories WHERE slug = 'tableware';
  SELECT id INTO decor_id FROM categories WHERE slug = 'decor';

  INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES
  ('Gilded Chiavari Chair', 'Classic elegance for any formal occasion. Features a gold finish and ivory cushion.', 1250, '/gold-chiavari-chair.jpg', seating_id, 100),
  ('Velvet Lounge Sofa', 'Mid-century modern velvet sofa in emerald green. Perfect for lounge areas.', 15000, '/emerald-green-velvet-sofa.jpg', furniture_id, 10),
  ('Crystal Chandelier', 'Statement lighting piece with genuine crystals. Adds immediate luxury.', 25000, '/crystal-chandelier.png', lighting_id, 5),
  ('Farmhouse Dining Table', 'Solid oak farmhouse table. Seats 8-10 guests comfortably.', 8500, '/rustic-wooden-dining-table.jpg', tables_id, 20),
  ('Gold Rim Charger Plate', 'Glass charger plate with delicate gold rim detailing.', 450, '/gold-rim-charger-plate.jpg', tableware_id, 200),
  ('Ghost Chair', 'Modern transparent acrylic chair. Adds a contemporary touch.', 1500, '/clear-ghost-chair.jpg', seating_id, 150),
  ('Vintage Brass Candlesticks', 'Set of 3 assorted vintage brass candlesticks.', 1800, '/vintage-brass-candlesticks.jpg', decor_id, 50),
  ('Marble Bar Counter', 'Luxurious white marble bar counter with gold trim.', 35000, '/marble-bar-counter.jpg', furniture_id, 3);
END $$;

-- Seed Content
INSERT INTO content (key, value, type) VALUES
('home.hero.title', 'Curating Unforgettable Moments of Luxury', 'text'),
('home.hero.subtitle', 'Premier event rentals and styling for weddings, galas, and corporate gatherings. Browse our collection and book directly online.', 'text'),
('home.hero.cta_primary', 'Rent Online', 'text'),
('home.hero.cta_secondary', 'How It Works', 'text'),

('home.values.title', 'The PrimeLux Standard', 'text'),
('home.values.description', 'We don''t just rent furniture; we curate experiences. Our commitment to excellence sets the foundation for unforgettable events.', 'text'),
('home.values.items', '[
  {
    "title": "Curated Excellence",
    "description": "Every piece in our collection is hand-selected for its craftsmanship, aesthetic appeal, and ability to transform a space."
  },
  {
    "title": "Uncompromising Quality",
    "description": "We maintain our inventory to the highest standards. Each item is inspected, cleaned, and perfected before it arrives at your event."
  },
  {
    "title": "Seamless Logistics",
    "description": "Our white-glove delivery team handles every detail of transport and setup, ensuring a stress-free experience from start to finish."
  },
  {
    "title": "Personalized Service",
    "description": "We believe in building relationships. Our dedicated design consultants work closely with you to bring your unique vision to life."
  }
]', 'json'),

('home.services.title', 'Our Services', 'text'),
('home.services.description', 'Beyond rentals, we provide comprehensive styling and logistical support to ensure your event is flawless.', 'text'),
('home.services.items', '[
  {
    "title": "Event Design & Styling",
    "description": "Our expert designers work with you to create a cohesive look for your event, from color palettes to floor plans."
  },
  {
    "title": "Delivery & Setup",
    "description": "White-glove delivery service including full setup and breakdown of all rental items."
  },
  {
    "title": "Custom Fabrication",
    "description": "Need something unique? Our workshop can build custom backdrops, bars, and decor pieces."
  },
  {
    "title": "Venue Consultation",
    "description": "We''ll visit your venue to recommend the best layout and rental items to maximize the space."
  }
]', 'json'),

('home.testimonials.title', 'Client Stories', 'text'),
('home.testimonials.description', 'Hear from those who have experienced the PrimeLux difference.', 'text'),
('home.testimonials.items', '[
  {
    "quote": "PrimeLux transformed our wedding venue into a dream. The velvet lounge furniture was the talk of the night, and the service was impeccable.",
    "author": "Isabella & Marcus",
    "role": "Wedding at The Plaza",
    "image": "/elegant-bride.png"
  },
  {
    "quote": "As an event planner, I need partners I can rely on. PrimeLux delivers consistency, quality, and style every single time. They are my go-to.",
    "author": "Sarah Jenkins",
    "role": "Senior Planner, Elite Events",
    "image": "/open-planner.png"
  },
  {
    "quote": "The attention to detail is unmatched. From the initial consultation to the final pickup, the team was professional, punctual, and a joy to work with.",
    "author": "David Chen",
    "role": "Corporate Gala Organizer",
    "image": "/diverse-executive-team.png"
  }
]', 'json'),

('catalog.header.title', 'The Collection', 'text'),
('catalog.header.subtitle', 'Browse our curated inventory of luxury event rentals.', 'text'),

('contact.header.title', 'Get in Touch', 'text'),
('contact.header.subtitle', 'We''d love to hear about your upcoming event. Fill out the form or contact us directly to start the conversation.', 'text'),
('contact.info.address', '123 Luxury Lane, Suite 100\nBeverly Hills, CA 90210', 'text'),
('contact.info.phone', '(310) 555-0123', 'text'),
('contact.info.email', 'hello@primeluxevents.com', 'text'),

('about.hero.title', 'Curating Extraordinary Moments', 'text'),
('about.hero.subtitle', 'PrimeLux Events is the premier destination for luxury event rentals, bringing your vision to life with our curated collection of exquisite furniture and decor.', 'text'),
('about.story.title', 'Our Story', 'text'),
('about.story.content', '[
  "Founded in 2010, PrimeLux Events began with a simple mission: to elevate the standard of event rentals. We noticed a gap in the market for truly high-end, well-maintained furniture that could transform a space rather than just fill it.",
  "Over the past decade, we have grown from a small boutique collection to a comprehensive design house, partnering with the world''s top event planners and designers to execute weddings, galas, and corporate gatherings of distinction.",
  "Our commitment goes beyond inventory. We believe in the art of hospitality, ensuring that every interaction, from the first quote to the final pickup, is seamless and professional."
]', 'json'),
('about.values.title', 'The PrimeLux Standard', 'text'),
('about.values.description', 'We hold ourselves to the highest standards of quality and service, ensuring your event is nothing short of perfection.', 'text'),
('about.values.items', '[
  {
    "title": "Curated Excellence",
    "description": "Every piece in our collection is hand-selected for its design, craftsmanship, and ability to make a statement."
  },
  {
    "title": "Impeccable Maintenance",
    "description": "Our inventory is meticulously inspected and maintained after every event to ensure it arrives in pristine condition."
  },
  {
    "title": "Seamless Logistics",
    "description": "Our experienced logistics team handles the complexities of delivery and setup, so you can focus on your guests."
  }
]', 'json'),
('about.cta.title', 'Ready to elevate your event?', 'text'),
('about.cta.subtitle', 'Browse our collection and build your quote online instantly.', 'text'),
('about.cta.primary', 'Start Your Quote', 'text'),
('about.cta.secondary', 'Contact Support', 'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

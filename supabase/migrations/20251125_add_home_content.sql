-- Add CMS content for home page sections that were previously hardcoded

-- CTA Section Content
INSERT INTO content (key, value, type) VALUES
('home.cta.title', 'Ready to plan your event?', 'text'),
('home.cta.description', 'Browse our full catalog, check availability, and secure your rentals instantly online.', 'text'),
('home.cta.primary', 'Start Your Quote', 'text'),
('home.cta.secondary', 'Contact Support', 'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Interactive Process Section Content
INSERT INTO content (key, value, type) VALUES
('home.process.title', 'Seamless Luxury Experience', 'text'),
('home.process.description', 'From inspiration to celebration, we make the rental process effortless.', 'text'),
('home.process.steps', '[
  {
    "id": 1,
    "title": "Browse & Discover",
    "description": "Explore our curated collection of premium furniture, decor, and lighting.",
    "icon": "Search"
  },
  {
    "id": 2,
    "title": "Select Your Favorites",
    "description": "Add items to your quote cart and customize quantities for your event size.",
    "icon": "MousePointerClick"
  },
  {
    "id": 3,
    "title": "Secure Your Date",
    "description": "Submit your quote request. We''ll confirm availability and send a custom proposal.",
    "icon": "CalendarCheck"
  },
  {
    "id": 4,
    "title": "Celebrate in Style",
    "description": "We handle delivery and setup so you can focus on enjoying your unforgettable event.",
    "icon": "PartyPopper"
  }
]', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Featured Categories Section Content
INSERT INTO content (key, value, type) VALUES
('home.categories.label', 'Curated Collections', 'text'),
('home.categories.title', 'Explore by Category', 'text'),
('home.categories.cta', 'View Full Catalog', 'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Featured Collection Section Content
INSERT INTO content (key, value, type) VALUES
('home.featured.title', 'Trending in the Catalog', 'text'),
('home.featured.description', 'Hand-picked pieces that define luxury and elegance.', 'text'),
('home.featured.cta', 'View All', 'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

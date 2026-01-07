-- Seed Portfolio Categories
INSERT INTO portfolio_categories (name, slug, description, cover_image) VALUES
('Weddings', 'weddings', 'Bespoke ceremonies and elegant receptions tailored to your unique love story.', '/images/about-hero.png'),
('Corporate Events', 'corporate', 'Professional galas, brand launches, and executive gatherings that make a lasting impression.', '/images/service-design.png'),
('Anniversaries', 'anniversaries', 'Celebrating milestones with intimate dinners and opulent celebrations of enduring love.', '/images/luxury_event_setup_celebration_1767781442112.png'),
('Baby Showers', 'baby-showers', 'Whimsical and charming celebrations welcoming the newest additions to your family.', '/images/luxury_furniture_collection_1767781427931.png'),
('Social Gatherings', 'social', 'Vibrant parties and chic rooftop cocktails designed for unforgettable memories.', '/images/service-setup.png')
ON CONFLICT (slug) DO NOTHING;

-- Seed Portfolio Images (using existing images as placeholders)
INSERT INTO portfolio_images (category_id, image_url, title, description, order_index)
SELECT 
    id, 
    cover_image, 
    name || ' Premier Setup', 
    'A glimpse into our exclusive ' || LOWER(name) || ' collection.',
    0
FROM portfolio_categories
ON CONFLICT DO NOTHING;

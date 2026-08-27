-- Ensure CMS content table exists (plux may never have received schema.sql)
-- Safe to re-run. Seeds default marketing copy when the table is empty.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.content (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  type text DEFAULT 'text',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public content is viewable by everyone." ON public.content;
CREATE POLICY "Public content is viewable by everyone."
  ON public.content FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update content." ON public.content;
CREATE POLICY "Admins can update content."
  ON public.content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can insert content." ON public.content;
CREATE POLICY "Admins can insert content."
  ON public.content FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Default seed for Site editor pages (only when table has no rows)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.content LIMIT 1) THEN
    RETURN;
  END IF;

  INSERT INTO public.content (key, value, type) VALUES
  ('about.hero.title', 'Curating Extraordinary Moments', 'text'),
  ('about.hero.description', 'PrimeLux Events is the premier destination for luxury event rentals, bringing your vision to life with our curated collection of exquisite furniture and decor.', 'text'),
  ('about.hero.image', '/luxury-event-setup-ballroom-chandelier.jpg', 'image'),
  ('about.story.title', 'Our Story', 'text'),
  ('about.story.p1', 'Founded in 2010, PrimeLux Events began with a simple mission: to elevate the standard of event rentals.', 'text'),
  ('about.story.p2', 'Over the past decade, we have grown from a small boutique collection to a comprehensive design house.', 'text'),
  ('about.story.p3', 'Our commitment goes beyond inventory. We believe in the art of hospitality.', 'text'),
  ('about.story.image', '/elegant-wedding-reception-table-setting.jpg', 'image'),
  ('about.values.title', 'The PrimeLux Standard', 'text'),
  ('about.values.description', 'We hold ourselves to the highest standards of quality and service.', 'text'),
  ('about.values.items', '[{"title":"Curated Excellence","description":"Every piece is hand-selected for design and craftsmanship."},{"title":"Impeccable Maintenance","description":"Inventory is inspected after every event."},{"title":"Seamless Logistics","description":"Our team handles delivery and setup."}]', 'json'),
  ('about.cta.title', 'Ready to elevate your event?', 'text'),
  ('about.cta.description', 'Browse our collection and build your quote online instantly.', 'text'),
  ('about.cta.primary', 'Start Your Quote', 'text'),
  ('about.cta.secondary', 'Contact Support', 'text'),

  ('contact.hero.title', 'Get in Touch', 'text'),
  ('contact.hero.description', 'We''d love to hear about your upcoming event. Our showroom is open by appointment.', 'text'),
  ('contact.info.address.title', 'Visit Our Showroom', 'text'),
  ('contact.info.address.value', '123 Luxury Lane, Suite 100\nBeverly Hills, CA 90210', 'text'),
  ('contact.info.address.hours', 'By Appointment Only', 'text'),
  ('contact.info.phone.title', 'Call Us', 'text'),
  ('contact.info.phone.value', '(310) 555-0123', 'text'),
  ('contact.info.phone.hours', 'Mon-Fri: 9am - 6pm', 'text'),
  ('contact.info.email.title', 'Email Us', 'text'),
  ('contact.info.email.value', 'hello@primeluxevents.com', 'text'),
  ('contact.form.title', 'Send us a Message', 'text'),

  ('howitworks.hero.title', 'The PrimeLux Experience', 'text'),
  ('howitworks.hero.description', 'From browsing to booking, control every detail of your event rentals online.', 'text'),
  ('howitworks.steps.list', '[{"title":"Browse & Select","description":"Explore our catalog and add items to your cart.","details":["Real-Time Availability","Detailed Specs"],"image":"/open-planner.png"},{"title":"Build Your Quote","description":"Adjust quantities and dates in your cart.","details":["Instant Pricing","Self-Service"],"image":"/design-consultation.jpg"},{"title":"Secure Reservation","description":"Book with a deposit through our portal.","details":["Instant Booking","Secure Payment"],"image":"/concierge-service.jpg"}]', 'json'),
  ('howitworks.concierge.title', 'Need a Custom Touch?', 'text'),
  ('howitworks.concierge.description', 'Our Concierge Team is available for large-scale productions.', 'text'),
  ('howitworks.concierge.button', 'Contact Concierge', 'text'),
  ('howitworks.concierge.list.title', 'What We Offer', 'text'),
  ('howitworks.concierge.list.item1', 'Custom furniture sourcing', 'text'),
  ('howitworks.concierge.list.item2', 'Complex event logistics coordination', 'text'),
  ('howitworks.concierge.list.item3', 'Dedicated event planning support', 'text'),
  ('howitworks.faq.title', 'Common Questions', 'text'),
  ('howitworks.faq.description', 'Everything you need to know about renting with us.', 'text'),
  ('howitworks.faq.button', 'View All FAQs', 'text'),
  ('howitworks.faq.list', '[{"question":"Can I book everything online?","answer":"Yes — browse, quote, and reserve entirely online."},{"question":"How far in advance should I book?","answer":"6–9 months is ideal for peak season."}]', 'json'),

  ('gallery.hero.title', 'Our Portfolio', 'text'),
  ('gallery.hero.description', 'Explore a curated selection of our most memorable events.', 'text'),
  ('gallery.images', '[{"id":"1","src":"/luxury-event-setup-ballroom-chandelier.jpg","alt":"Grand Ballroom Wedding","category":"Weddings"},{"id":"2","src":"/elegant-wedding-reception-table-setting.jpg","alt":"Outdoor Garden Reception","category":"Weddings"}]', 'json'),

  ('journal.hero.title', 'The Edit', 'text'),
  ('journal.hero.description', 'Trends, inspiration, and expert advice from the world of luxury events.', 'text'),
  ('journal.posts', '[{"id":"1","title":"2025 Wedding Trends","excerpt":"Discover why maximalism is making a comeback.","date":"October 12, 2024","image":"/luxury-event-setup-ballroom-chandelier.jpg","category":"Trends"}]', 'json')
  ON CONFLICT (key) DO NOTHING;
END $$;

NOTIFY pgrst, 'reload schema';

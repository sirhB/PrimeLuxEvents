-- About Page Content
INSERT INTO content (key, value, type) VALUES
('about.hero.title', 'Curating Extraordinary Moments', 'text'),
('about.hero.description', 'PrimeLux Events is the premier destination for luxury event rentals, bringing your vision to life with our curated collection of exquisite furniture and decor.', 'text'),
('about.hero.image', '/luxury-event-setup-ballroom-chandelier.jpg', 'image'),
('about.story.title', 'Our Story', 'text'),
('about.story.p1', 'Founded in 2010, PrimeLux Events began with a simple mission: to elevate the standard of event rentals. We noticed a gap in the market for truly high-end, well-maintained furniture that could transform a space rather than just fill it.', 'text'),
('about.story.p2', 'Over the past decade, we have grown from a small boutique collection to a comprehensive design house, partnering with the world''s top event planners and designers to execute weddings, galas, and corporate gatherings of distinction.', 'text'),
('about.story.p3', 'Our commitment goes beyond inventory. We believe in the art of hospitality, ensuring that every interaction, from the first quote to the final pickup, is seamless and professional.', 'text'),
('about.story.image', '/elegant-wedding-reception-table-setting.jpg', 'image'),
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
('about.cta.description', 'Browse our collection and build your quote online instantly.', 'text'),
('about.cta.primary', 'Start Your Quote', 'text'),
('about.cta.secondary', 'Contact Support', 'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Home Page Content
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
]', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Contact Page Content
INSERT INTO content (key, value, type) VALUES
('contact.hero.title', 'Get in Touch', 'text'),
('contact.hero.description', 'We''d love to hear about your upcoming event. Fill out the form or contact us directly to start the conversation.', 'text'),
('contact.info.address.title', 'Visit Our Showroom', 'text'),
('contact.info.address.value', '123 Luxury Lane, Suite 100\nBeverly Hills, CA 90210', 'text'),
('contact.info.phone.title', 'Call Us', 'text'),
('contact.info.phone.value', '(310) 555-0123', 'text'),
('contact.info.phone.hours', 'Mon-Fri: 9am - 6pm', 'text'),
('contact.info.email.title', 'Email Us', 'text'),
('contact.info.email.value', 'hello@primeluxevents.com', 'text'),
('contact.form.title', 'Send us a Message', 'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Services Page Content
INSERT INTO content (key, value, type) VALUES
('services.hero.title', 'Our Services', 'text'),
('services.hero.description', 'Beyond our exceptional inventory, we offer a suite of services designed to make your event planning experience seamless and stress-free.', 'text'),
('services.list.design.title', 'Design Consultation', 'text'),
('services.list.design.description', 'Not sure where to start? Our expert design team is here to help. We offer complimentary design consultations to help you curate the perfect look for your event. Whether you have a full mood board or just a vague idea, we''ll guide you through our collection to find pieces that bring your vision to life.', 'text'),
('services.list.design.features', '[
  "Personalized style recommendations",
  "Floor plan assistance",
  "Custom mood boards"
]', 'json'),
('services.list.design.image', '/service-design.png', 'image'),

('services.list.delivery.title', 'White Glove Delivery', 'text'),
('services.list.delivery.description', 'Our logistics team is the backbone of our operation. We pride ourselves on punctuality and professionalism. Our uniformed delivery crew handles every item with care, ensuring that your rentals arrive in perfect condition and on time, every time.', 'text'),
('services.list.delivery.features', '[
  "Scheduled delivery windows",
  "Real-time tracking updates",
  "Careful handling and protection"
]', 'json'),
('services.list.delivery.image', '/logistics-planning.jpg', 'image'),

('services.list.setup.title', 'Setup & Installation', 'text'),
('services.list.setup.description', 'Want to walk into a fully realized event? For an additional fee, our team can handle the complete setup and installation of your rentals. From placing chairs to hanging lighting, we ensure everything is positioned exactly according to your floor plan.', 'text'),
('services.list.setup.features', '[
  "Available as an add-on service",
  "Execution of detailed floor plans",
  "On-site styling assistance"
]', 'json'),
('services.list.setup.image', '/service-setup.png', 'image'),

('services.cta.title', 'Experience the PrimeLux Difference', 'text'),
('services.cta.description', 'Let us handle the details so you can enjoy the moment. Contact us today to discuss your event needs.', 'text'),
('services.cta.button', 'Get in Touch', 'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- How It Works Page Content
INSERT INTO content (key, value, type) VALUES
('howitworks.hero.title', 'The PrimeLux Experience', 'text'),
('howitworks.hero.description', 'We''ve refined the rental process into a seamless digital experience. From browsing to booking, control every detail of your event rentals online, on your time.', 'text'),
('howitworks.steps.list', '[
  {
    "title": "Browse & Select",
    "description": "Explore our extensive catalog of luxury furniture and decor online. Our platform allows you to view real-time availability, detailed specifications, and high-resolution images. Simply add items to your cart to start building your event.",
    "details": ["Real-Time Availability", "Detailed Product Specs", "Curated Collections"],
    "image": "/open-planner.png"
  },
  {
    "title": "Build Your Quote",
    "description": "Create a comprehensive quote instantly. Adjust quantities, select your event dates, and input venue details directly in your cart. No waiting for a salesperson—you have full control over your rental list and budget.",
    "details": ["Instant Pricing", "Self-Service Cart", "Budget Management"],
    "image": "/design-consultation.jpg"
  },
  {
    "title": "Secure Reservation",
    "description": "Ready to book? Secure your items immediately with a 50% deposit through our secure online portal. You''ll receive an instant confirmation and a detailed contract. Our logistics team will then reach out to coordinate the finer details.",
    "details": ["Instant Booking", "Secure Online Payment", "Immediate Confirmation"],
    "image": "/concierge-service.jpg"
  },
  {
    "title": "Professional Delivery",
    "description": "On the day of your event, our uniformed team arrives on time to deliver your items to a secure drop-off location. Need us to handle the heavy lifting? Full setup and installation services are available for an additional fee.",
    "details": ["Uniformed Delivery Team", "Scheduled Drop-off", "Setup Available (Add-on)"],
    "image": "/logistics-planning.jpg"
  },
  {
    "title": "Seamless Retrieval",
    "description": "Standard rentals cover a 24-hour period. We typically schedule pickup for the day following your event to ensure a stress-free conclusion. Same-night or custom pickup times can be arranged upon request.",
    "details": ["24-Hour Rental Period", "Next-Day Pickup", "Flexible Scheduling"],
    "image": "/event-breakdown.jpg"
  }
]', 'json'),
('howitworks.concierge.title', 'Need a Custom Touch?', 'text'),
('howitworks.concierge.description', 'While our platform is designed for self-service, our Concierge Team is available for large-scale productions requiring custom sourcing or complex logistics.', 'text'),
('howitworks.concierge.button', 'Contact Concierge', 'text'),
('howitworks.concierge.list.title', 'What We Offer', 'text'),
('howitworks.concierge.list.item1', 'Custom furniture sourcing', 'text'),
('howitworks.concierge.list.item2', 'Complex event logistics coordination', 'text'),
('howitworks.concierge.list.item3', 'Dedicated event planning support', 'text'),
('howitworks.faq.title', 'Common Questions', 'text'),
('howitworks.faq.description', 'Everything you need to know about renting with us.', 'text'),
('howitworks.faq.button', 'View All FAQs', 'text'),
('howitworks.faq.list', '[
  {
    "question": "Can I book everything online without talking to anyone?",
    "answer": "Yes! Our platform is designed for a complete self-service experience. You can browse, build your quote, and secure your rentals entirely online. If you need assistance, our support team is just a click away."
  },
  {
    "question": "How far in advance should I book?",
    "answer": "We recommend booking as soon as you have your venue and date secured. For peak wedding seasons (May-October), 6-9 months in advance is ideal to ensure availability of our most popular items."
  },
  {
    "question": "Do you offer delivery outside the metro area?",
    "answer": "Yes, we travel! We regularly service events up to 150 miles from our warehouse. Long-distance delivery fees are calculated based on mileage and crew requirements."
  },
  {
    "question": "Is setup included in the delivery fee?",
    "answer": "Our standard delivery fee covers drop-off at a designated location. Full setup and installation—placing chairs, styling lounges, etc.—is a separate service that can be added to your quote for an additional fee."
  }
]', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- FAQ Page Content
INSERT INTO content (key, value, type) VALUES
('faq.hero.title', 'Frequently Asked Questions', 'text'),
('faq.hero.description', 'Everything you need to know about renting with PrimeLux Events.', 'text'),
('faq.list', '[
  {
    "question": "How far in advance should I book?",
    "answer": "We recommend booking as soon as you have your date and venue secured. For peak seasons (spring and fall), we suggest booking 6-9 months in advance to ensure availability of your desired items. However, we can often accommodate last-minute requests depending on inventory."
  },
  {
    "question": "How long is the rental period?",
    "answer": "Our standard rental period is 24 hours. We typically deliver on the day of the event and pick up the following day. If you need the items for longer or require a same-night pickup, please let us know so we can adjust your quote accordingly."
  },
  {
    "question": "Do you offer delivery and setup?",
    "answer": "We offer professional delivery to your venue. Standard delivery includes drop-off at a designated area. Full setup and installation (placing furniture, styling decor) is available for an additional fee. Please request this service when building your quote so we can allocate the proper time and crew."
  },
  {
    "question": "What is your cancellation policy?",
    "answer": "Orders cancelled more than 30 days prior to the event date are eligible for a full refund less a 10% administrative fee. Cancellations made within 30 days of the event are subject to a 50% cancellation fee. Orders cannot be cancelled within 7 days of the scheduled delivery."
  },
  {
    "question": "Can I view the items in person?",
    "answer": "Absolutely. We invite you to visit our showroom in Beverly Hills to see our collection in person. Please contact us to schedule an appointment with one of our design consultants."
  },
  {
    "question": "Do you require a deposit?",
    "answer": "Yes, a 50% non-refundable deposit is required to secure your items for your date. The remaining balance is due 14 days prior to your event."
  },
  {
    "question": "What happens if an item is damaged?",
    "answer": "We charge a mandatory damage waiver fee on all rentals which covers minor wear and tear. However, significant damage, loss, or theft is the responsibility of the client and will be billed at the replacement cost of the item."
  }
]', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Gallery Page Content
INSERT INTO content (key, value, type) VALUES
('gallery.hero.title', 'Our Portfolio', 'text'),
('gallery.hero.description', 'Explore a curated selection of our most memorable events. From intimate gatherings to grand galas, see how our pieces bring visions to life.', 'text'),
('gallery.images', '[
  {
    "id": "1",
    "src": "/luxury-event-setup-ballroom-chandelier.jpg",
    "alt": "Grand Ballroom Wedding",
    "category": "Weddings"
  },
  {
    "id": "2",
    "src": "/elegant-wedding-reception-table-setting.jpg",
    "alt": "Outdoor Garden Reception",
    "category": "Weddings"
  },
  {
    "id": "3",
    "src": "/emerald-green-velvet-sofa.jpg",
    "alt": "Corporate Gala Lounge",
    "category": "Corporate"
  },
  {
    "id": "4",
    "src": "/gold-chiavari-chair.jpg",
    "alt": "Gold Themed Anniversary",
    "category": "Social"
  },
  {
    "id": "5",
    "src": "/rustic-wooden-dining-table.jpg",
    "alt": "Rustic Chic Dinner",
    "category": "Social"
  },
  {
    "id": "6",
    "src": "/crystal-chandelier.png",
    "alt": "Luxury Lighting Setup",
    "category": "Weddings"
  }
]', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Journal Page Content
INSERT INTO content (key, value, type) VALUES
('journal.hero.title', 'The Edit', 'text'),
('journal.hero.description', 'Trends, inspiration, and expert advice from the world of luxury events.', 'text'),
('journal.posts', '[
  {
    "id": "1",
    "title": "2025 Wedding Trends: The Return of Opulence",
    "excerpt": "From cascading florals to gold accents, discover why maximalism is making a comeback in luxury weddings.",
    "date": "October 12, 2024",
    "image": "/luxury-event-setup-ballroom-chandelier.jpg",
    "category": "Trends"
  },
  {
    "id": "2",
    "title": "Creating the Perfect Lounge Area",
    "excerpt": "Tips for designing comfortable and stylish conversation spaces for your corporate event or reception.",
    "date": "September 28, 2024",
    "image": "/emerald-green-velvet-sofa.jpg",
    "category": "Design"
  },
  {
    "id": "3",
    "title": "Lighting: The Secret to Atmosphere",
    "excerpt": "How to use chandeliers, pin-spots, and uplighting to transform any venue into a magical space.",
    "date": "September 15, 2024",
    "image": "/crystal-chandelier.png",
    "category": "Expert Advice"
  }
]', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Catalog Page Content
INSERT INTO content (key, value, type) VALUES
('catalog.hero.title', 'Rental Catalog', 'text'),
('catalog.hero.subtitle', 'Premium event rentals for unforgettable celebrations', 'text'),
('catalog.rental.policy.title', 'Rental Information', 'text'),
('catalog.rental.policy.description', 'All rentals include a 24-hour period with delivery and pickup. Extended rental periods and setup services available.', 'text'),
('catalog.delivery.zones', '["Beverly Hills", "Los Angeles", "Santa Monica", "Malibu", "Pasadena", "Orange County"]', 'json'),
('catalog.pricing.tiers', '{
  "daily": "Base daily rate for 1-day rentals",
  "weekend": "Special rate for 2-3 day weekend events",
  "weekly": "Discounted rate for 7+ day rentals"
}', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;


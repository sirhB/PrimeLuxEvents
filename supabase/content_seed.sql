-- About Page Content (ELI12: clear, professional, no luxury fluff)
INSERT INTO content (key, value, type) VALUES
('about.hero.title', 'Event rentals that look great and show up on time', 'text'),
('about.hero.description', 'PrimeLux Events rents furniture, lighting, and decor for weddings, parties, and company events. Browse online, book what you need, and we deliver.', 'text'),
('about.hero.image', '/luxury-event-setup-ballroom-chandelier.jpg', 'image'),
('about.story.title', 'Our Story', 'text'),
('about.story.p1', 'PrimeLux started because good event furniture was hard to find—pieces that looked nice, stayed clean, and actually arrived when promised. We built a warehouse and a simple online catalog to fix that.', 'text'),
('about.story.p2', 'Today we work with couples, planners, and businesses across Connecticut and nearby states. Whether it is a backyard wedding or a hotel ballroom, we help you pick pieces that fit the space and the budget.', 'text'),
('about.story.p3', 'We care about clear quotes, careful delivery, and a straightforward pickup. You should always know what you are getting and when it shows up.', 'text'),
('about.story.image', '/elegant-wedding-reception-table-setting.jpg', 'image'),
('about.values.title', 'How we work', 'text'),
('about.values.description', 'Simple standards we stick to on every order.', 'text'),
('about.values.items', '[
  {
    "title": "Solid pieces",
    "description": "We choose rentals that hold up well and photograph nicely—not just whatever is cheapest."
  },
  {
    "title": "Cleaned and checked",
    "description": "After every event we inspect and clean items before they go out again."
  },
  {
    "title": "Delivery you can plan around",
    "description": "Our crew handles transport and timing so you can focus on your guests."
  }
]', 'json'),
('about.cta.title', 'Ready to pick your rentals?', 'text'),
('about.cta.description', 'Browse the catalog and build a quote online in a few minutes.', 'text'),
('about.cta.primary', 'Start Your Quote', 'text'),
('about.cta.secondary', 'Contact Us', 'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Home Page Content
INSERT INTO content (key, value, type) VALUES
('home.hero.title', 'Event rentals for weddings and parties in Connecticut', 'text'),
('home.hero.subtitle', 'Furniture, lighting, tents, and decor you can browse and book online. We deliver to CT, RI, and MA.', 'text'),
('home.hero.cta_primary', 'Browse Catalog', 'text'),
('home.hero.cta_secondary', 'How It Works', 'text'),
('home.values.title', 'Why people book with us', 'text'),
('home.values.description', 'We rent the furniture and handle the logistics so planning your event feels more manageable.', 'text'),
('home.values.items', '[
  {
    "title": "Thoughtful inventory",
    "description": "Chairs, tables, lighting, linens, and more—chosen to mix well together and look good in photos."
  },
  {
    "title": "Quality you can count on",
    "description": "Every item is cleaned and checked before delivery so it arrives ready to use."
  },
  {
    "title": "Delivery and pickup",
    "description": "We bring items to your venue and pick them up after. Setup help is available if you need it."
  },
  {
    "title": "Real human help",
    "description": "Questions about sizing, quantities, or layout? Message us—we will walk you through it."
  }
]', 'json'),
('home.services.title', 'What we offer', 'text'),
('home.services.description', 'Rentals first—and support when you want a hand with design or setup.', 'text'),
('home.services.items', '[
  {
    "title": "Event layout help",
    "description": "We can help you map chairs, tables, and lounges so the room works for your guest count."
  },
  {
    "title": "Delivery and setup",
    "description": "Drop-off at your venue, with optional full setup and breakdown."
  },
  {
    "title": "Custom builds",
    "description": "Need a specific backdrop or bar? Ask us—we can build certain pieces in our shop."
  },
  {
    "title": "Venue walkthrough",
    "description": "We can visit the space with you and suggest what will fit best."
  }
]', 'json'),
('home.testimonials.title', 'What clients say', 'text'),
('home.testimonials.description', 'A few notes from recent events.', 'text'),
('home.testimonials.items', '[
  {
    "quote": "The lounge furniture looked amazing and the crew was on time. Guests kept asking where we got everything.",
    "author": "Isabella & Marcus",
    "role": "Wedding clients",
    "image": "/elegant-bride.png"
  },
  {
    "quote": "As a planner I need vendors who do what they say. PrimeLux is reliable on quality and timing.",
    "author": "Sarah Jenkins",
    "role": "Event planner",
    "image": "/open-planner.png"
  },
  {
    "quote": "Clear communication from quote to pickup. Easy to work with for a large company dinner.",
    "author": "David Chen",
    "role": "Corporate event organizer",
    "image": "/diverse-executive-team.png"
  }
]', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Contact Page Content (Shelton CT identity)
INSERT INTO content (key, value, type) VALUES
('contact.hero.title', 'Get in Touch', 'text'),
('contact.hero.description', 'Tell us about your event date and venue. Our Shelton showroom is available by appointment—use the form or call us to set up a visit.', 'text'),
('contact.info.address.title', 'Visit Our Showroom', 'text'),
('contact.info.address.value', '2 Research Dr\nShelton, CT 06484', 'text'),
('contact.info.address.hours', 'By Appointment Only', 'text'),
('contact.info.phone.title', 'Call Us', 'text'),
('contact.info.phone.value', '(203) 633-4744', 'text'),
('contact.info.phone.hours', 'Mon-Fri: 9am - 6pm', 'text'),
('contact.info.email.title', 'Email Us', 'text'),
('contact.info.email.value', 'primeluxevents@gmail.com', 'text'),
('contact.form.title', 'Send us a Message', 'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Services Page Content
INSERT INTO content (key, value, type) VALUES
('services.hero.title', 'Our Services', 'text'),
('services.hero.description', 'Rentals are the core. These extras help when you want design advice, delivery help, or on-site setup.', 'text'),
('services.list.design.title', 'Design Consultation', 'text'),
('services.list.design.description', 'Not sure what to order? We will help you pick pieces that match your venue, colors, and guest count. Bring a mood board or just a rough idea—we will walk the catalog with you.', 'text'),
('services.list.design.features', '[
  "Style recommendations",
  "Floor plan help",
  "Simple mood boards"
]', 'json'),
('services.list.design.image', '/service-design.png', 'image'),

('services.list.delivery.title', 'Delivery', 'text'),
('services.list.delivery.description', 'Our team delivers to your venue in a scheduled window. Items are wrapped and handled carefully so they arrive ready for your event.', 'text'),
('services.list.delivery.features', '[
  "Scheduled delivery windows",
  "Status updates",
  "Careful packing and handling"
]', 'json'),
('services.list.delivery.image', '/logistics-planning.jpg', 'image'),

('services.list.setup.title', 'Setup and Installation', 'text'),
('services.list.setup.description', 'Want the room ready when you walk in? For an added fee we can place furniture, hang lighting, and follow your floor plan so the space is set before guests arrive.', 'text'),
('services.list.setup.features', '[
  "Available as an add-on",
  "Follows your floor plan",
  "On-site placement help"
]', 'json'),
('services.list.setup.image', '/service-setup.png', 'image'),

('services.cta.title', 'Want help planning your order?', 'text'),
('services.cta.description', 'Tell us the date and venue—we will point you to the right rentals.', 'text'),
('services.cta.button', 'Get in Touch', 'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- How It Works Page Content
INSERT INTO content (key, value, type) VALUES
('howitworks.hero.title', 'How renting works', 'text'),
('howitworks.hero.description', 'Browse, build a quote, pay a deposit, and we deliver. Most of it you can do online without waiting on a sales call.', 'text'),
('howitworks.steps.list', '[
  {
    "title": "Browse and select",
    "description": "Look through furniture, lighting, tents, and decor. Check photos, details, and availability, then add items to your cart.",
    "details": ["Live availability", "Product details", "Clear categories"],
    "image": "/open-planner.png"
  },
  {
    "title": "Build your quote",
    "description": "Set quantities, event dates, and venue info in your cart. Pricing updates as you go so you can stay on budget.",
    "details": ["Instant pricing", "Self-serve cart", "Budget visibility"],
    "image": "/design-consultation.jpg"
  },
  {
    "title": "Reserve with a deposit",
    "description": "Pay a 50% deposit online to hold your items. You get confirmation right away, then we coordinate delivery details with you.",
    "details": ["Online booking", "Secure payment", "Instant confirmation"],
    "image": "/concierge-service.jpg"
  },
  {
    "title": "We deliver",
    "description": "On event day our crew drops off at your venue. Full setup is optional if you want help placing everything.",
    "details": ["On-time delivery", "Scheduled drop-off", "Setup available"],
    "image": "/logistics-planning.jpg"
  },
  {
    "title": "We pick up",
    "description": "Standard rentals cover about 24 hours. We usually pick up the next day. Same-night pickup can be arranged if needed.",
    "details": ["24-hour rental", "Next-day pickup", "Flexible timing"],
    "image": "/event-breakdown.jpg"
  }
]', 'json'),
('howitworks.concierge.title', 'Need something custom?', 'text'),
('howitworks.concierge.description', 'Most orders are self-serve. For large events or special sourcing, our team can help with logistics and one-off pieces.', 'text'),
('howitworks.concierge.button', 'Talk to Our Team', 'text'),
('howitworks.concierge.list.title', 'What We Offer', 'text'),
('howitworks.concierge.list.item1', 'Help finding special furniture', 'text'),
('howitworks.concierge.list.item2', 'Complex delivery planning', 'text'),
('howitworks.concierge.list.item3', 'Extra planning support for big events', 'text'),
('howitworks.faq.title', 'Common Questions', 'text'),
('howitworks.faq.description', 'Quick answers about renting with us.', 'text'),
('howitworks.faq.button', 'View All FAQs', 'text'),
('howitworks.faq.list', '[
  {
    "question": "Can I book everything online without talking to anyone?",
    "answer": "Yes. You can browse, build a quote, and reserve online. If you get stuck, our team is available by phone or message."
  },
  {
    "question": "How far in advance should I book?",
    "answer": "Book once you have a date and venue. For busy wedding months (May–October), 6–9 months ahead is safest for popular items."
  },
  {
    "question": "Do you deliver outside the local area?",
    "answer": "Yes. We regularly deliver within about 150 miles of our warehouse. Longer trips may include a mileage fee."
  },
  {
    "question": "Is setup included in the delivery fee?",
    "answer": "Standard delivery is drop-off at a designated spot. Full setup—placing chairs, arranging lounges, and so on—is an add-on you can include in your quote."
  }
]', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- FAQ Page Content
INSERT INTO content (key, value, type) VALUES
('faq.hero.title', 'Frequently Asked Questions', 'text'),
('faq.hero.description', 'Straight answers about renting with PrimeLux Events.', 'text'),
('faq.list', '[
  {
    "question": "How far in advance should I book?",
    "answer": "Book as soon as you have a date and venue. For spring and fall, 6–9 months ahead helps lock in popular items. Last-minute orders are sometimes possible if stock allows."
  },
  {
    "question": "How long is the rental period?",
    "answer": "Most rentals are about 24 hours—we deliver for the event and pick up the next day. Longer holds or same-night pickup can be arranged; we will adjust the quote."
  },
  {
    "question": "Do you offer delivery and setup?",
    "answer": "Yes. Delivery to your venue is available. Drop-off is included in standard delivery; full setup and styling is an optional add-on."
  },
  {
    "question": "What is your cancellation policy?",
    "answer": "Cancel more than 30 days before the event for a refund minus a 10% admin fee. Within 30 days, a 50% fee applies. Within 7 days of delivery, orders cannot be cancelled."
  },
  {
    "question": "Can I view the items in person?",
    "answer": "Yes. Visit our Shelton showroom by appointment. Call or message us to schedule a time."
  },
  {
    "question": "Do you require a deposit?",
    "answer": "A 50% deposit holds your items. The rest is due 14 days before the event."
  },
  {
    "question": "What happens if an item is damaged?",
    "answer": "A damage waiver covers light wear. Major damage, loss, or theft is billed at replacement cost."
  }
]', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Gallery Page Content
INSERT INTO content (key, value, type) VALUES
('gallery.hero.title', 'Our Portfolio', 'text'),
('gallery.hero.description', 'Real events where our rentals were used—weddings, parties, and company gatherings.', 'text'),
('gallery.images', '[
  {
    "id": "1",
    "src": "/luxury-event-setup-ballroom-chandelier.jpg",
    "alt": "Ballroom wedding setup",
    "category": "Weddings"
  },
  {
    "id": "2",
    "src": "/elegant-wedding-reception-table-setting.jpg",
    "alt": "Garden reception tables",
    "category": "Weddings"
  },
  {
    "id": "3",
    "src": "/emerald-green-velvet-sofa.jpg",
    "alt": "Lounge seating for a company event",
    "category": "Corporate"
  },
  {
    "id": "4",
    "src": "/gold-chiavari-chair.jpg",
    "alt": "Anniversary dinner chairs",
    "category": "Social"
  },
  {
    "id": "5",
    "src": "/rustic-wooden-dining-table.jpg",
    "alt": "Farm-style dinner tables",
    "category": "Social"
  },
  {
    "id": "6",
    "src": "/crystal-chandelier.png",
    "alt": "Hanging lighting over a reception",
    "category": "Weddings"
  }
]', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Journal Page Content
INSERT INTO content (key, value, type) VALUES
('journal.hero.title', 'Ideas and tips', 'text'),
('journal.hero.description', 'Practical notes on layouts, lighting, and planning from our team.', 'text'),
('journal.posts', '[
  {
    "id": "1",
    "title": "Wedding trends we are seeing this year",
    "excerpt": "What couples are asking for—from fuller florals to warmer metal accents—and how to rent for that look.",
    "date": "October 12, 2024",
    "image": "/luxury-event-setup-ballroom-chandelier.jpg",
    "category": "Trends"
  },
  {
    "id": "2",
    "title": "How to set up a comfortable lounge area",
    "excerpt": "Simple tips for seating groups so people can talk and rest during a reception or company event.",
    "date": "September 28, 2024",
    "image": "/emerald-green-velvet-sofa.jpg",
    "category": "Design"
  },
  {
    "id": "3",
    "title": "Lighting that changes the room",
    "excerpt": "How chandeliers, pin spots, and uplights can make a plain venue feel finished.",
    "date": "September 15, 2024",
    "image": "/crystal-chandelier.png",
    "category": "Tips"
  }
]', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

-- Catalog Page Content
INSERT INTO content (key, value, type) VALUES
('catalog.hero.title', 'Rental Catalog', 'text'),
('catalog.hero.subtitle', 'Furniture, lighting, tents, and decor for your event', 'text'),
('catalog.rental.policy.title', 'Rental Information', 'text'),
('catalog.rental.policy.description', 'Most rentals include a 24-hour period with delivery and pickup. Longer rentals and setup help are available.', 'text'),
('catalog.delivery.zones', '["Shelton", "Fairfield County", "New Haven County", "Hartford area", "Rhode Island", "Massachusetts"]', 'json'),
('catalog.pricing.tiers', '{
  "daily": "Base daily rate for 1-day rentals",
  "weekend": "Rate for 2–3 day weekend events",
  "weekly": "Lower rate for 7+ day rentals"
}', 'json')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type;

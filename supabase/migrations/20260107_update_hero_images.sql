-- Update Hero Images for various pages
UPDATE content SET value = '/images/about-hero.png' WHERE key = 'about.hero.image';
UPDATE content SET value = '/images/service-design.png' WHERE key = 'services.list.design.image';
UPDATE content SET value = '/images/service-setup.png' WHERE key = 'services.list.setup.image';
UPDATE content SET value = '/images/service-logistics.png' WHERE key = 'services.list.delivery.image';
UPDATE content SET value = '/images/journal-hero.png' WHERE key = 'journal.hero.image';
UPDATE content SET value = '/images/gallery-hero.png' WHERE key = 'gallery.hero.image';

-- Update How It Works steps with better images if available
-- Note: We are using some of the existing ones that were good, but updating the others
UPDATE content SET value = '[
  {
    "title": "Browse & Select",
    "description": "Explore our extensive catalog of luxury furniture and decor online. Our platform allows you to view real-time availability, detailed specifications, and high-resolution images. Simply add items to your cart to start building your event.",
    "details": ["Real-Time Availability", "Detailed Product Specs", "Curated Collections"],
    "image": "/images/luxury_furniture_collection_1767781427931.png"
  },
  {
    "title": "Build Your Quote",
    "description": "Create a comprehensive quote instantly. Adjust quantities, select your event dates, and input venue details directly in your cart. No waiting for a salesperson—you have full control over your rental list and budget.",
    "details": ["Instant Pricing", "Self-Service Cart", "Budget Management"],
    "image": "/images/luxury_selection_interface_1767781469895.png"
  },
  {
    "title": "Secure Reservation",
    "description": "Ready to book? Secure your items immediately with a 50% deposit through our secure online portal. You''ll receive an instant confirmation and a detailed contract. Our logistics team will then reach out to coordinate the finer details.",
    "details": ["Instant Booking", "Secure Online Payment", "Immediate Confirmation"],
    "image": "/images/luxury-event-hero.png"
  },
  {
    "title": "Professional Delivery",
    "description": "On the day of your event, our uniformed team arrives on time to deliver your items to a secure drop-off location. Need us to handle the heavy lifting? Full setup and installation services are available for an additional fee.",
    "details": ["Uniformed Delivery Team", "Scheduled Drop-off", "Setup Available (Add-on)"],
    "image": "/images/service-logistics.png"
  },
  {
    "title": "Seamless Retrieval",
    "description": "Standard rentals cover a 24-hour period. We typically schedule pickup for the day following your event to ensure a stress-free conclusion. Same-night or custom pickup times can be arranged upon request.",
    "details": ["24-Hour Rental Period", "Next-Day Pickup", "Flexible Scheduling"],
    "image": "/images/luxury_event_setup_celebration_1767781442112.png"
  }
]' WHERE key = 'howitworks.steps.list';

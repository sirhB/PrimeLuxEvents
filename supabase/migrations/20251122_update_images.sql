-- Update Services Page Images
UPDATE content SET value = '/service-design.png' WHERE key = 'services.list.design.image';
UPDATE content SET value = '/service-setup.png' WHERE key = 'services.list.setup.image';
UPDATE content SET value = '/logistics-planning.jpg' WHERE key = 'services.list.delivery.image';

-- Update How It Works Page Images
UPDATE content SET value = '[
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
]' WHERE key = 'howitworks.steps.list';

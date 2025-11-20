export interface Product {
  id: string
  name: string
  category: string
  price: number
  image: string
  description: string
  featured?: boolean
  dimensions?: string
  material?: string
  sku?: string
  relatedIds?: string[]
}

export const products: Product[] = [
  {
    id: "1",
    name: "Gilded Chiavari Chair",
    category: "Seating",
    price: 12.5,
    image: "/gold-chiavari-chair.jpg",
    description: "Classic elegance for any formal occasion. Features a gold finish and ivory cushion.",
    featured: true,
    dimensions: '16"W x 16"D x 36"H',
    material: "Wood, Faux Leather",
    sku: "CH-GLD-001",
    relatedIds: ["4", "5"],
  },
  {
    id: "2",
    name: "Velvet Lounge Sofa",
    category: "Furniture",
    price: 150.0,
    image: "/emerald-green-velvet-sofa.jpg",
    description: "Mid-century modern velvet sofa in emerald green. Perfect for lounge areas.",
    featured: true,
    dimensions: '84"W x 34"D x 30"H',
    material: "Velvet, Solid Wood",
    sku: "SF-GRN-002",
    relatedIds: ["8", "3"],
  },
  {
    id: "3",
    name: "Crystal Chandelier",
    category: "Lighting",
    price: 250.0,
    image: "/crystal-chandelier.png",
    description: "Statement lighting piece with genuine crystals. Adds immediate luxury.",
    featured: true,
    dimensions: '30" Dia x 36"H',
    material: "Crystal, Chrome",
    sku: "LT-CRY-003",
    relatedIds: ["2", "8"],
  },
  {
    id: "4",
    name: "Farmhouse Dining Table",
    category: "Tables",
    price: 85.0,
    image: "/rustic-wooden-dining-table.jpg",
    description: "Solid oak farmhouse table. Seats 8-10 guests comfortably.",
    featured: false,
    dimensions: '96"L x 40"W x 30"H',
    material: "Solid Oak",
    sku: "TB-FRM-004",
    relatedIds: ["1", "5"],
  },
  {
    id: "5",
    name: "Gold Rim Charger Plate",
    category: "Tableware",
    price: 4.5,
    image: "/gold-rim-charger-plate.jpg",
    description: "Glass charger plate with delicate gold rim detailing.",
    featured: false,
    dimensions: '13" Diameter',
    material: "Glass",
    sku: "TW-GLD-005",
    relatedIds: ["1", "4"],
  },
  {
    id: "6",
    name: "Ghost Chair",
    category: "Seating",
    price: 15.0,
    image: "/clear-ghost-chair.jpg",
    description: "Modern transparent acrylic chair. Adds a contemporary touch.",
    featured: true,
    dimensions: '15"W x 16"D x 36"H',
    material: "Acrylic",
    sku: "CH-CLR-006",
    relatedIds: ["8", "2"],
  },
  {
    id: "7",
    name: "Vintage Brass Candlesticks",
    category: "Decor",
    price: 18.0,
    image: "/vintage-brass-candlesticks.jpg",
    description: "Set of 3 assorted vintage brass candlesticks.",
    featured: false,
    dimensions: 'Assorted Heights (6"-10")',
    material: "Solid Brass",
    sku: "DC-BRS-007",
    relatedIds: ["4", "5"],
  },
  {
    id: "8",
    name: "Marble Bar Counter",
    category: "Furniture",
    price: 350.0,
    image: "/marble-bar-counter.jpg",
    description: "Luxurious white marble bar counter with gold trim.",
    featured: true,
    dimensions: '72"W x 24"D x 42"H',
    material: "Faux Marble, Wood, Metal",
    sku: "BR-MRB-008",
    relatedIds: ["2", "6"],
  },
]

export const categories = ["All", "Seating", "Furniture", "Lighting", "Tables", "Tableware", "Decor"]

export const services = [
  {
    title: "Event Design & Styling",
    description:
      "Our expert designers work with you to create a cohesive look for your event, from color palettes to floor plans.",
  },
  {
    title: "Delivery & Setup",
    description: "White-glove delivery service including full setup and breakdown of all rental items.",
  },
  {
    title: "Custom Fabrication",
    description: "Need something unique? Our workshop can build custom backdrops, bars, and decor pieces.",
  },
  {
    title: "Venue Consultation",
    description: "We'll visit your venue to recommend the best layout and rental items to maximize the space.",
  },
]

export const journalPosts = [
  {
    id: "1",
    title: "2025 Wedding Trends: The Return of Opulence",
    excerpt: "From cascading florals to gold accents, discover why maximalism is making a comeback in luxury weddings.",
    date: "October 12, 2024",
    image: "/luxury-event-setup-ballroom-chandelier.jpg",
    category: "Trends",
  },
  {
    id: "2",
    title: "Creating the Perfect Lounge Area",
    excerpt: "Tips for designing comfortable and stylish conversation spaces for your corporate event or reception.",
    date: "September 28, 2024",
    image: "/emerald-green-velvet-sofa.jpg",
    category: "Design",
  },
  {
    id: "3",
    title: "Lighting: The Secret to Atmosphere",
    excerpt: "How to use chandeliers, pin-spots, and uplighting to transform any venue into a magical space.",
    date: "September 15, 2024",
    image: "/crystal-chandelier.png",
    category: "Expert Advice",
  },
]

export const galleryImages = [
  {
    id: "1",
    src: "/luxury-event-setup-ballroom-chandelier.jpg",
    alt: "Grand Ballroom Wedding",
    category: "Weddings",
  },
  {
    id: "2",
    src: "/elegant-wedding-reception-table-setting.jpg",
    alt: "Outdoor Garden Reception",
    category: "Weddings",
  },
  {
    id: "3",
    src: "/emerald-green-velvet-sofa.jpg",
    alt: "Corporate Gala Lounge",
    category: "Corporate",
  },
  {
    id: "4",
    src: "/gold-chiavari-chair.jpg",
    alt: "Gold Themed Anniversary",
    category: "Social",
  },
  {
    id: "5",
    src: "/rustic-wooden-dining-table.jpg",
    alt: "Rustic Chic Dinner",
    category: "Social",
  },
  {
    id: "6",
    src: "/crystal-chandelier.png",
    alt: "Luxury Lighting Setup",
    category: "Weddings",
  },
]

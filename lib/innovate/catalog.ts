/** Seed catalogs for Innovate studios — swap to DB products later */

export const BACKDROP_FRAMES = [
  {
    id: 'arch-wall',
    label: 'Arch Wall Frame',
    description: 'Soft-curve silhouette for photo moments',
    rentalCents: 45000,
  },
  {
    id: 'velvet-panels',
    label: 'Velvet Panel Wall',
    description: 'Tufted panels with hidden frame hardware',
    rentalCents: 52000,
  },
  {
    id: 'greenery-grid',
    label: 'Greenery Grid',
    description: 'Modular botanical lattice',
    rentalCents: 48000,
  },
  {
    id: 'mirror-box',
    label: 'Mirror Box Frame',
    description: 'Reflective infinity-edge structure',
    rentalCents: 61000,
  },
] as const

export const FLOOR_MATERIALS = [
  {
    id: 'matte-vinyl',
    label: 'Matte Vinyl Wrap',
    description: 'Soft non-glare print',
    perSqFtCents: 450,
  },
  {
    id: 'metallic-gold',
    label: 'Metallic Gold Accents',
    description: 'Champagne metallic overlay',
    perSqFtCents: 780,
  },
  {
    id: 'marble-print',
    label: 'Marble Print Vinyl',
    description: 'High-resolution stone graphic',
    perSqFtCents: 620,
  },
] as const

export const AMBIENCE_PRESETS = [
  {
    id: 'daylight',
    label: 'Daylight',
    overlay: 'rgba(255, 248, 230, 0.15)',
    glow: 'rgba(255, 220, 160, 0.25)',
  },
  {
    id: 'warm-dusk',
    label: 'Warm Dusk',
    overlay: 'rgba(180, 90, 40, 0.28)',
    glow: 'rgba(255, 160, 80, 0.45)',
  },
  {
    id: 'winter-night',
    label: 'Dark Winter Night',
    overlay: 'rgba(20, 30, 60, 0.45)',
    glow: 'rgba(140, 180, 255, 0.35)',
  },
] as const

export const NEON_CHAR_CENTS = 850
export const NEON_BASE_CENTS = 17500
export const LOGO_FAB_CENTS = 12500

export type HardwareSku = {
  sku: string
  label: string
  unitPriceCents: number
  defaultQty: number
}

export const ATELIER_VIBES = [
  {
    id: 'winter-solstice',
    label: 'Winter Solstice',
    tagline: 'Cool whites, low fog, crystalline spark',
    palette: {
      primary: '#c8d8ef',
      secondary: '#1a2233',
      accent: '#e8f0ff',
    },
    hardware: [
      { sku: 'uplight-cool', label: 'Wireless LED Uplight (Cool)', unitPriceCents: 4500, defaultQty: 12 },
      { sku: 'fogger-low', label: 'Low-Lying Fogger', unitPriceCents: 18500, defaultQty: 1 },
      { sku: 'cold-spark', label: 'Cold-Spark Fountain Pair', unitPriceCents: 32000, defaultQty: 1 },
    ] satisfies HardwareSku[],
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour Gala',
    tagline: 'Champagne wash, soft projection bloom',
    palette: {
      primary: '#e8c07a',
      secondary: '#3a2a18',
      accent: '#ffe6b0',
    },
    hardware: [
      { sku: 'uplight-warm', label: 'Wireless LED Uplight (Warm)', unitPriceCents: 4500, defaultQty: 16 },
      { sku: 'projector-gobo', label: 'Gobo Projection Unit', unitPriceCents: 27500, defaultQty: 1 },
      { sku: 'pinspot', label: 'Pin Spot Kit', unitPriceCents: 9500, defaultQty: 4 },
    ] satisfies HardwareSku[],
  },
  {
    id: 'autumn-velvet',
    label: 'Moody Autumn Velvet',
    tagline: 'Amber pools, velvet shadow, haze',
    palette: {
      primary: '#b85c38',
      secondary: '#1c1210',
      accent: '#d4a574',
    },
    hardware: [
      { sku: 'uplight-amber', label: 'Wireless LED Uplight (Amber)', unitPriceCents: 4500, defaultQty: 14 },
      { sku: 'haze-machine', label: 'Atmospheric Haze Machine', unitPriceCents: 16500, defaultQty: 1 },
      { sku: 'candle-led', label: 'LED Taper Candle Set', unitPriceCents: 3200, defaultQty: 8 },
    ] satisfies HardwareSku[],
  },
  {
    id: 'midnight-noir',
    label: 'Midnight Noir',
    tagline: 'Deep indigo, laser edge, smoke plume',
    palette: {
      primary: '#4a5cff',
      secondary: '#0a0c12',
      accent: '#9aa8ff',
    },
    hardware: [
      { sku: 'uplight-indigo', label: 'Wireless LED Uplight (Indigo)', unitPriceCents: 4500, defaultQty: 18 },
      { sku: 'laser-fx', label: 'Laser FX Unit', unitPriceCents: 38000, defaultQty: 1 },
      { sku: 'fogger-plume', label: 'Vertical Fog Plume', unitPriceCents: 21000, defaultQty: 1 },
    ] satisfies HardwareSku[],
  },
] as const

export const BAR_BASES = [
  {
    id: 'marble-top',
    label: 'Marble-Top Bar',
    description: 'Polished stone surface, brass feet',
    rentalCents: 68500,
  },
  {
    id: 'tufted-velvet',
    label: 'Tufted Velvet Bar',
    description: 'Channel-tufted front, soft touch',
    rentalCents: 72500,
  },
  {
    id: 'led-underlit',
    label: 'LED-Underlit Panel Bar',
    description: 'Edge-lit acrylic with color control',
    rentalCents: 79000,
  },
] as const

export const BAR_ADDONS = [
  {
    id: 'ice-well',
    label: 'Built-in Ice Well',
    rentalCents: 8500,
  },
  {
    id: 'tap-tower',
    label: 'Tap Tower',
    rentalCents: 14500,
  },
  {
    id: 'glassware-rack',
    label: 'Overhead Glassware Rack',
    rentalCents: 9800,
  },
  {
    id: 'speed-rail',
    label: 'Speed Rail Set',
    rentalCents: 4200,
  },
] as const

export const BAR_WRAP_OPTIONS = [
  {
    id: 'none',
    label: 'No branded wrap',
    fabCents: 0,
  },
  {
    id: 'vinyl-wrap',
    label: 'Custom Vinyl Panel Wrap',
    fabCents: 18500,
  },
  {
    id: 'acrylic-plaque',
    label: 'Acrylic Logo Plaque',
    fabCents: 14500,
  },
] as const

export const VIP_HARDWARE = [
  {
    sku: 'kiosk-stand',
    label: 'Branded Check-In Kiosk Stand',
    unitPriceCents: 22500,
    defaultQty: 1,
  },
  {
    sku: 'badge-printer',
    label: 'Wireless Badge Printer',
    unitPriceCents: 8500,
    defaultQty: 1,
  },
  {
    sku: 'velvet-rope',
    label: 'Velvet Rope Entry Set',
    unitPriceCents: 6500,
    defaultQty: 1,
  },
] as const

export const VIP_SERVICE_CENTS = 15000

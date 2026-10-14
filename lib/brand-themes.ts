export const THEME_STORAGE_KEY = 'primelux-theme'
export const DEFAULT_THEME_ID = 'midnight-gold'

export type BrandTheme = {
  id: string
  name: string
  dark: string
  accent: string
  canvas: string
}

/** Public brand palettes. Derived shades live in styles/brand-themes.css. */
export const BRAND_THEMES: BrandTheme[] = [
  { id: 'midnight-gold', name: 'Midnight Gold', dark: '#0F1B2D', accent: '#C9A962', canvas: '#FAF7F2' },
  { id: 'black-tie', name: 'Black Tie', dark: '#111111', accent: '#D4AF37', canvas: '#F5F3EE' },
  { id: 'rose-soiree', name: 'Rosé Soirée', dark: '#2B1A2E', accent: '#B76E79', canvas: '#FBF6F6' },
  { id: 'emerald-gala', name: 'Emerald Gala', dark: '#0B3D2E', accent: '#B8955A', canvas: '#F7F3E9' },
  { id: 'sapphire-night', name: 'Sapphire Night', dark: '#1B2A4A', accent: '#C0C6D0', canvas: '#F4F6FA' },
  { id: 'champagne-blush', name: 'Champagne Blush', dark: '#2A211C', accent: '#E9D8B4', canvas: '#F3E1DD' },
  { id: 'velvet-bordeaux', name: 'Velvet Bordeaux', dark: '#4A0E1C', accent: '#C9A13B', canvas: '#FAF6F0' },
  { id: 'modern-monochrome', name: 'Modern Monochrome', dark: '#1E1E22', accent: '#A89F91', canvas: '#FFFFFF' },
  { id: 'lavender-luxe', name: 'Lavender Luxe', dark: '#1C1830', accent: '#D9C08A', canvas: '#F7F4FC' },
  { id: 'coastal-elegance', name: 'Coastal Elegance', dark: '#13293D', accent: '#A7C7C2', canvas: '#F2EBDD' },
  { id: 'royal-amethyst', name: 'Royal Amethyst', dark: '#3B1F5C', accent: '#CFAE5C', canvas: '#F8F6FB' },
]

export const BRAND_THEME_IDS = BRAND_THEMES.map((theme) => theme.id)

export function isBrandThemeId(value: string | null | undefined): value is string {
  return Boolean(value && BRAND_THEME_IDS.includes(value))
}

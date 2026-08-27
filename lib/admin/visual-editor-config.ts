import type { LucideIcon } from 'lucide-react'
import {
  LayoutTemplate,
  HelpCircle,
  Phone,
  Image as ImageIcon,
  BookOpen,
} from 'lucide-react'

export type VisualEditorPage = {
  id: string
  label: string
  icon: LucideIcon
  description: string
  publicPath: string
  keyPrefix: string
}

export const VISUAL_EDITOR_PAGES: VisualEditorPage[] = [
  {
    id: 'about',
    label: 'About Us',
    icon: LayoutTemplate,
    description: 'Edit your story, values, and team information.',
    publicPath: '/about',
    keyPrefix: 'about.',
  },
  {
    id: 'how-it-works',
    label: 'How It Works',
    icon: HelpCircle,
    description: 'Manage steps, FAQs, and process details.',
    publicPath: '/how-it-works',
    keyPrefix: 'howitworks.',
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: Phone,
    description: 'Update contact info, form settings, and location.',
    publicPath: '/contact',
    keyPrefix: 'contact.',
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: ImageIcon,
    description: 'Curate your portfolio and event showcases.',
    publicPath: '/gallery',
    keyPrefix: 'gallery.',
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: BookOpen,
    description: 'Write and manage blog posts and news.',
    publicPath: '/journal',
    keyPrefix: 'journal.',
  },
]

export const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  story: 'Story',
  values: 'Values',
  cta: 'Call to action',
  steps: 'Steps',
  concierge: 'Concierge',
  faq: 'FAQ',
  info: 'Contact info',
  form: 'Form',
  images: 'Images',
  posts: 'Posts',
  general: 'General',
}

export type FieldType = 'text' | 'textarea' | 'image' | 'json'

export function getFieldType(key: string, value: unknown): FieldType {
  if (key.includes('image')) return 'image'
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return 'json'
  if (typeof value === 'string' && value.length > 120) return 'textarea'
  return 'text'
}

export function getSectionLabel(section: string): string {
  return SECTION_LABELS[section] ?? section.replace(/[-_]/g, ' ')
}

export function getFieldLabel(key: string): string {
  const parts = key.split('.')
  const labelParts = parts.slice(2)
  if (labelParts.length === 0) return parts[parts.length - 1]?.replace(/[-_]/g, ' ') ?? key
  return labelParts.join(' ').replace(/[-_]/g, ' ')
}

export function getPageKeyPrefix(pageId: string): string {
  const page = VISUAL_EDITOR_PAGES.find((p) => p.id === pageId)
  return page?.keyPrefix ?? `${pageId}.`
}

export function getPublicPath(pageId: string): string {
  const page = VISUAL_EDITOR_PAGES.find((p) => p.id === pageId)
  return page?.publicPath ?? `/${pageId}`
}

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile'

export const PREVIEW_WIDTHS: Record<PreviewDevice, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

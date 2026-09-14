import type { InnovateDraft, InnovateQuote, InnovateStudioId } from './types'

const STORAGE_KEY = 'primelux-innovate-drafts'

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function loadDrafts(): InnovateDraft[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as InnovateDraft[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveDraft(quote: InnovateQuote, id?: string): InnovateDraft {
  const drafts = loadDrafts()
  const draftId = id ?? `${quote.studio}-${Date.now()}`
  const draft: InnovateDraft = {
    ...quote,
    id: draftId,
    updatedAt: new Date().toISOString(),
  }
  const next = [draft, ...drafts.filter((d) => d.id !== draftId)].slice(0, 24)
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  return draft
}

export function deleteDraft(id: string): void {
  if (!canUseStorage()) return
  const next = loadDrafts().filter((d) => d.id !== id)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function latestDraftForStudio(studio: InnovateStudioId): InnovateDraft | null {
  return loadDrafts().find((d) => d.studio === studio) ?? null
}

const VIP_GUESTS_KEY = 'primelux-innovate-vip-guests'
const VIP_EVENT_KEY = 'primelux-innovate-vip-event'

export type VipGuest = {
  id: string
  name: string
  email: string
  tier: 'standard' | 'vip' | 'vvip'
  checkedIn: boolean
  token: string
}

export type VipEventMeta = {
  name: string
  date: string
  venue: string
}

export function loadVipEvent(): VipEventMeta {
  if (!canUseStorage()) return { name: '', date: '', venue: '' }
  try {
    const raw = window.localStorage.getItem(VIP_EVENT_KEY)
    if (!raw) return { name: '', date: '', venue: '' }
    return JSON.parse(raw) as VipEventMeta
  } catch {
    return { name: '', date: '', venue: '' }
  }
}

export function saveVipEvent(meta: VipEventMeta): void {
  if (!canUseStorage()) return
  window.localStorage.setItem(VIP_EVENT_KEY, JSON.stringify(meta))
}

export function loadVipGuests(): VipGuest[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(VIP_GUESTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as VipGuest[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveVipGuests(guests: VipGuest[]): void {
  if (!canUseStorage()) return
  window.localStorage.setItem(VIP_GUESTS_KEY, JSON.stringify(guests))
}

export function makeGuestToken(): string {
  return `plx-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

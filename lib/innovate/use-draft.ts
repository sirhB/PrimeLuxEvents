'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getDraft } from './drafts'
import type { InnovateDraft, InnovateStudioId } from './types'

/**
 * Load a reopenable Innovate draft from `?draft=` and keep the id in sync
 * when the quote panel saves (so re-saves update the same draft).
 */
export function useInnovateDraft(studio: InnovateStudioId): {
  draftId: string | null
  initialDraft: InnovateDraft | null
  ready: boolean
  onDraftSaved: (id: string) => void
} {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const paramId = searchParams.get('draft')

  const [draftId, setDraftId] = useState<string | null>(null)
  const [initialDraft, setInitialDraft] = useState<InnovateDraft | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!paramId) {
      setDraftId(null)
      setInitialDraft(null)
      setReady(true)
      return
    }
    const draft = getDraft(paramId)
    if (draft && draft.studio === studio) {
      setDraftId(draft.id)
      setInitialDraft(draft)
    } else {
      setDraftId(null)
      setInitialDraft(null)
    }
    setReady(true)
  }, [paramId, studio])

  const onDraftSaved = useCallback(
    (id: string) => {
      setDraftId(id)
      const next = new URLSearchParams(searchParams.toString())
      next.set('draft', id)
      router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  return { draftId, initialDraft, ready, onDraftSaved }
}

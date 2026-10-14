'use client'

import { useCallback, useEffect, useState } from 'react'
import { SUITE_STORAGE_KEY, isSuiteId, type SuiteId } from '@/lib/suite'

function readSuite(): SuiteId {
  if (typeof document === 'undefined') return 'rentals'
  const fromDom = document.documentElement.dataset.suite
  if (isSuiteId(fromDom)) return fromDom
  try {
    const stored = localStorage.getItem(SUITE_STORAGE_KEY)
    if (isSuiteId(stored)) return stored
  } catch {
    /* private mode */
  }
  return 'rentals'
}

export function useSuite() {
  const [suite, setSuiteState] = useState<SuiteId>('rentals')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const next = readSuite()
    document.documentElement.dataset.suite = next
    setSuiteState(next)
    setReady(true)
  }, [])

  const setSuite = useCallback((next: SuiteId) => {
    try {
      localStorage.setItem(SUITE_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.suite = next
    setSuiteState(next)
  }, [])

  return { suite, setSuite, ready }
}

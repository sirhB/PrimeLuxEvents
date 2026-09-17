'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getOnlineSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true
}

/** True when the browser reports an online connection. */
export function useOnlineStatus() {
  return useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerSnapshot)
}

/** Banner shown when offline so staff know mutations need connection. */
export function NeedsConnectionBanner({ className }: { className?: string }) {
  const online = useOnlineStatus()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || online) return null

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200',
        className,
      )}
    >
      <WifiOff className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
      <div>
        <p className="font-semibold text-red-100">Needs connection</p>
        <p className="mt-0.5 text-red-200/80 font-light">
          You’re offline. Scan, stock, and task updates won’t save until you’re back online.
        </p>
      </div>
    </div>
  )
}

/** Guard async mutations — returns false and shows toast pattern when offline. */
export function assertOnline(onOffline?: () => void): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    onOffline?.()
    return false
  }
  return true
}

"use client"

import { useEffect, useState } from "react"
import { Download, Share, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePwa, type PwaSurface } from "@/hooks/use-pwa"

const SURFACE_COPY: Record<PwaSurface, { title: string; description: string }> = {
  store: {
    title: "Install PrimeLux",
    description: "Browse rentals and manage quotes from your home screen.",
  },
  account: {
    title: "Install your portal",
    description: "Track orders and event details without opening the browser.",
  },
  admin: {
    title: "Install admin app",
    description: "Run orders, messages, and scanning from a full-screen app.",
  },
}

function isIosSafari() {
  if (typeof window === "undefined") return false
  const ua = window.navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream
}

export function InstallPrompt({ surface }: { surface: PwaSurface }) {
  const { isStandalone, canInstall, promptInstall } = usePwa()
  const [dismissed, setDismissed] = useState(true)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const copy = SURFACE_COPY[surface]
  const storageKey = `pwa-install-dismissed-${surface}`

  useEffect(() => {
    const wasDismissed = localStorage.getItem(storageKey) === "true"
    setDismissed(wasDismissed)
  }, [storageKey])

  if (isStandalone || dismissed) return null

  const dismiss = () => {
    localStorage.setItem(storageKey, "true")
    setDismissed(true)
  }

  if (canInstall) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-lg rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur-md md:left-auto md:right-6 md:bottom-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
            <Download className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold">{copy.title}</p>
            <p className="text-xs text-muted-foreground">{copy.description}</p>
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={() => void promptInstall()}>
                Install app
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Not now
              </Button>
            </div>
          </div>
          <button type="button" onClick={dismiss} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (isIosSafari()) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-lg rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur-md md:left-auto md:right-6 md:bottom-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
            <Share className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold">{copy.title}</p>
            <p className="text-xs text-muted-foreground">
              Tap Share, then &quot;Add to Home Screen&quot; to install.
            </p>
            {showIosHelp && (
              <p className="text-xs text-muted-foreground">
                After installing, open PrimeLux from your home screen for the full app experience.
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setShowIosHelp(true)}>
                Show steps
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Not now
              </Button>
            </div>
          </div>
          <button type="button" onClick={dismiss} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return null
}

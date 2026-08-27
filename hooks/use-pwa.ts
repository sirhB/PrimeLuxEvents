"use client"

import { useCallback, useEffect, useState } from "react"

export type PwaSurface = "store" | "account" | "admin"

export function detectStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function detectPwaSurface(pathname: string): PwaSurface {
  if (pathname.startsWith("/admin")) return "admin"
  if (pathname.startsWith("/account")) return "account"
  return "store"
}

export function usePwa() {
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    setIsStandalone(detectStandalone())

    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    const onDisplayModeChange = () => setIsStandalone(detectStandalone())
    mediaQuery.addEventListener("change", onDisplayModeChange)

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const onAppInstalled = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onAppInstalled)

    return () => {
      mediaQuery.removeEventListener("change", onDisplayModeChange)
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return choice.outcome === "accepted"
  }, [deferredPrompt])

  return {
    isStandalone,
    canInstall: Boolean(deferredPrompt),
    promptInstall,
  }
}

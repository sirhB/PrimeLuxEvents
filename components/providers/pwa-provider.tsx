"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { detectPwaSurface, detectStandalone, type PwaSurface } from "@/hooks/use-pwa"
import { cn } from "@/lib/utils"

type PwaContextType = {
  isStandalone: boolean
  surface: PwaSurface
}

const PwaContext = createContext<PwaContextType>({
  isStandalone: false,
  surface: "store",
})

export const usePwaContext = () => useContext(PwaContext)

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isStandalone, setIsStandalone] = useState(false)
  const surface = detectPwaSurface(pathname || "/")

  useEffect(() => {
    setIsStandalone(detectStandalone())

    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    const onChange = () => setIsStandalone(detectStandalone())
    mediaQuery.addEventListener("change", onChange)
    return () => mediaQuery.removeEventListener("change", onChange)
  }, [])

  const isAdmin = surface === "admin"

  return (
    <PwaContext.Provider value={{ isStandalone, surface }}>
      <div
        className={cn(
          isStandalone && "pwa-standalone",
          isStandalone && isAdmin && "admin-theme",
        )}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          paddingBottom: isStandalone ? "env(safe-area-inset-bottom)" : undefined,
        }}
      >
        {children}
      </div>
    </PwaContext.Provider>
  )
}

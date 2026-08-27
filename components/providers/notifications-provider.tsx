"use client"

import { createContext, useContext, useEffect, useState } from "react"

type NotificationsContextType = {
  scheduleNotification: (title: string, body: string, id?: number, scheduleSeconds?: number) => Promise<void>
  setBadgeCount: (count: number) => Promise<void>
  clearBadgeCount: () => Promise<void>
  showAlertDialog: (title: string, message: string) => Promise<void>
  requestPermissions: () => Promise<boolean>
  hasPermissions: boolean
}

const NotificationsContext = createContext<NotificationsContextType>({
  scheduleNotification: async () => {},
  setBadgeCount: async () => {},
  clearBadgeCount: async () => {},
  showAlertDialog: async () => {},
  requestPermissions: async () => false,
  hasPermissions: false,
})

export const useNotifications = () => useContext(NotificationsContext)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [hasPermissions, setHasPermissions] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return
    setHasPermissions(Notification.permission === "granted")
  }, [])

  const requestPermissions = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return false

    try {
      const permission = await Notification.requestPermission()
      const granted = permission === "granted"
      setHasPermissions(granted)
      return granted
    } catch (error) {
      console.error("Error requesting notification permissions:", error)
      return false
    }
  }

  const scheduleNotification = async (title: string, body: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return

    if (Notification.permission !== "granted") {
      const granted = await requestPermissions()
      if (!granted) return
    }

    new Notification(title, { body })
  }

  const setBadgeCount = async (count: number) => {
    if ("setAppBadge" in navigator) {
      try {
        await (navigator as Navigator & { setAppBadge: (count: number) => Promise<void> }).setAppBadge(count)
      } catch (error) {
        console.warn("Badge API unavailable", error)
      }
    }
  }

  const clearBadgeCount = async () => {
    if ("clearAppBadge" in navigator) {
      try {
        await (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge()
      } catch (error) {
        console.warn("Badge API unavailable", error)
      }
    }
  }

  const showAlertDialog = async (title: string, message: string) => {
    alert(`${title}\n\n${message}`)
  }

  return (
    <NotificationsContext.Provider
      value={{
        scheduleNotification,
        setBadgeCount,
        clearBadgeCount,
        showAlertDialog,
        requestPermissions,
        hasPermissions,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

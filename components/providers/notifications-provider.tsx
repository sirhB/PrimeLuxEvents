"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { LocalNotifications } from "@capacitor/local-notifications"
import { Badge } from "@capawesome/capacitor-badge"
import { Dialog } from "@capacitor/dialog"
import { Capacitor } from "@capacitor/core"

type NotificationsContextType = {
    scheduleNotification: (title: string, body: string, id?: number, scheduleSeconds?: number) => Promise<void>
    setBadgeCount: (count: number) => Promise<void>
    clearBadgeCount: () => Promise<void>
    showAlertDialog: (title: string, message: string) => Promise<void>
    requestPermissions: () => Promise<boolean>
    hasPermissions: boolean
}

const NotificationsContext = createContext<NotificationsContextType>({
    scheduleNotification: async () => { },
    setBadgeCount: async () => { },
    clearBadgeCount: async () => { },
    showAlertDialog: async () => { },
    requestPermissions: async () => false,
    hasPermissions: false,
})

export const useNotifications = () => useContext(NotificationsContext)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const [hasPermissions, setHasPermissions] = useState(false)

    useEffect(() => {
        const checkPermissions = async () => {
            if (Capacitor.isNativePlatform()) {
                const status = await LocalNotifications.checkPermissions()
                if (status.display === 'granted') {
                    setHasPermissions(true)
                }
            }
        }
        checkPermissions()

        // Listeners for notification actions can be added here
        if (Capacitor.isNativePlatform()) {
            LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
                console.log('Notification action performed', notification)
            })
        }

        return () => {
            if (Capacitor.isNativePlatform()) {
                LocalNotifications.removeAllListeners()
            }
        }
    }, [])

    const requestPermissions = async () => {
        if (!Capacitor.isNativePlatform()) return false

        try {
            const permissions = await LocalNotifications.requestPermissions()
            const granted = permissions.display === 'granted'

            if (granted) {
                // Also request badge permissions if needed by the OS (mostly implied or separate)
                // @capawesome/capacitor-badge might handle its own, but typically notification permission covers it on iOS
                try {
                    await Badge.requestPermissions()
                } catch (e) {
                    console.warn("Badge permission request failed", e)
                }
            }

            setHasPermissions(granted)
            return granted
        } catch (error) {
            console.error("Error requesting permissions:", error)
            return false
        }
    }

    const scheduleNotification = async (title: string, body: string, id = 1, scheduleSeconds = 0) => {
        if (!Capacitor.isNativePlatform()) {
            console.log('Local Notification scheduled (web shim):', { title, body })
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body })
            }
            return
        }

        try {
            if (!hasPermissions) {
                const granted = await requestPermissions()
                if (!granted) return
            }

            // Schedule the notification
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title,
                        body,
                        id,
                        schedule: { at: new Date(Date.now() + scheduleSeconds * 1000) },
                        sound: undefined,
                        attachments: undefined,
                        actionTypeId: "",
                        extra: null
                    }
                ]
            })
        } catch (error) {
            console.error("Error scheduling notification:", error)
        }
    }

    const setBadgeCount = async (count: number) => {
        if (!Capacitor.isNativePlatform()) {
            console.log('Set Badge (web shim):', count)
            return
        }

        try {
            await Badge.set({ count })
        } catch (error) {
            console.error("Error setting badge:", error)
        }
    }

    const clearBadgeCount = async () => {
        if (!Capacitor.isNativePlatform()) {
            console.log('Clear Badge (web shim)')
            return
        }

        try {
            await Badge.clear()
        } catch (error) {
            console.error("Error clearing badge:", error)
        }
    }

    const showAlertDialog = async (title: string, message: string) => {
        if (!Capacitor.isNativePlatform()) {
            alert(`${title}\n\n${message}`)
            return
        }

        try {
            await Dialog.alert({
                title,
                message,
            })
        } catch (error) {
            console.error("Error showing alert dialog:", error)
        }
    }

    return (
        <NotificationsContext.Provider value={{
            scheduleNotification,
            setBadgeCount,
            clearBadgeCount,
            showAlertDialog,
            requestPermissions,
            hasPermissions
        }}>
            {children}
        </NotificationsContext.Provider>
    )
}

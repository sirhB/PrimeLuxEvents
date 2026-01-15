"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { Capacitor } from "@capacitor/core"
import { StatusBar, Style } from "@capacitor/status-bar"
import { SplashScreen } from "@capacitor/splash-screen"
import { Keyboard, KeyboardResize } from "@capacitor/keyboard"
import { App } from "@capacitor/app"
import { usePathname } from "next/navigation"

type CapacitorContextType = {
    isNative: boolean
}

const CapacitorContext = createContext<CapacitorContextType>({
    isNative: false,
})

export const useCapacitor = () => useContext(CapacitorContext)

export function CapacitorProvider({ children, initialIsNative = false }: { children: React.ReactNode, initialIsNative?: boolean }) {
    const [isNative, setIsNative] = useState(initialIsNative)
    const pathname = usePathname()

    useEffect(() => {
        // Check if running on a native platform
        const platform = Capacitor.getPlatform()
        const isNativePlatform = platform === "ios" || platform === "android"
        console.log('[CapacitorProvider] Platform detected:', platform, 'isNative:', isNativePlatform)
        setIsNative(isNativePlatform)

        if (isNativePlatform) {
            // Hide splash screen after app load
            SplashScreen.hide().catch(console.warn)

            // Initial setup
            const initPlugins = async () => {
                try {
                    await Keyboard.setResizeMode({ mode: KeyboardResize.Body })
                    await Keyboard.setScroll({ isDisabled: false })
                } catch (e) {
                    console.warn("Keyboard plugin init error", e)
                }
            }
            initPlugins()

            // Handle App State changes
            App.addListener('appStateChange', ({ isActive }) => {
                console.log('App state changed. Is active?', isActive);
            });

            // Handle Back button on Android
            App.addListener('backButton', ({ canGoBack }) => {
                if (!canGoBack) {
                    App.exitApp();
                } else {
                    window.history.back();
                }
            });
        }
    }, [])

    // Update Status Bar when pathname changes
    useEffect(() => {
        const platform = Capacitor.getPlatform()
        const isNativePlatform = platform === "ios" || platform === "android"

        if (isNativePlatform) {
            const updateStatusBar = async () => {
                try {
                    const isAdmin = pathname.startsWith('/admin')

                    // Show status bar if it was hidden
                    await StatusBar.show()

                    // In modern Capacitor (v5+):
                    // Style.Dark = White text (for dark backgrounds/mode)
                    // Style.Light = Black text (for light backgrounds/mode)
                    await StatusBar.setStyle({
                        style: isAdmin ? Style.Dark : Style.Light
                    })

                    if (platform === 'android') {
                        await StatusBar.setBackgroundColor({ color: isAdmin ? '#0a0a0b' : '#FDFBF7' })
                        await StatusBar.setOverlaysWebView({ overlay: true })
                    }
                } catch (e) {
                    console.warn("StatusBar update error", e)
                }
            }
            updateStatusBar()
        }
    }, [pathname])

    const isAdmin = pathname.startsWith('/admin')

    return (
        <CapacitorContext.Provider value={{ isNative }}>
            <div
                className={isNative ? "capacitor-app" : "web-app"}
                style={{
                    paddingTop: (isNative && !isAdmin) ? "env(safe-area-inset-top)" : "0px",
                    paddingBottom: isNative ? "env(safe-area-inset-bottom)" : "0px",
                    paddingLeft: isNative ? "var(--safe-area-inset-left)" : "0px",
                    paddingRight: isNative ? "var(--safe-area-inset-right)" : "0px",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    // For admin, use the dark dashboard background. For site, use the light background.
                    background: isNative ? (isAdmin ? "#0a0a0b" : "#FDFBF7") : "transparent"
                }}
            >
                {children}
            </div>
        </CapacitorContext.Provider>
    )
}

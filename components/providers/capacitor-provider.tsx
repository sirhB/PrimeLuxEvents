"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { Capacitor } from "@capacitor/core"
import { StatusBar, Style } from "@capacitor/status-bar"
import { SplashScreen } from "@capacitor/splash-screen"
import { Keyboard, KeyboardResize } from "@capacitor/keyboard"
import { App } from "@capacitor/app"

type CapacitorContextType = {
    isNative: boolean
}

const CapacitorContext = createContext<CapacitorContextType>({
    isNative: false,
})

export const useCapacitor = () => useContext(CapacitorContext)

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
    const [isNative, setIsNative] = useState(false)

    useEffect(() => {
        // Check if running on a native platform
        const platform = Capacitor.getPlatform()
        const isNativePlatform = platform === "ios" || platform === "android"
        console.log('[CapacitorProvider] Platform detected:', platform, 'isNative:', isNativePlatform)
        setIsNative(isNativePlatform)

        if (isNativePlatform) {
            // Initialize Capacitor plugins
            const initCapacitor = async () => {
                try {
                    // Hide splash screen after app load
                    await SplashScreen.hide()

                    // Configure Status Bar
                    try {
                        await StatusBar.setStyle({ style: Style.Dark })
                        if (platform === 'android') {
                            await StatusBar.setBackgroundColor({ color: '#111111' }) // Match theme color
                            await StatusBar.setOverlaysWebView({ overlay: false })
                        }
                    } catch (e) {
                        console.warn("StatusBar plugin error", e)
                    }

                    // Configure Keyboard
                    try {
                        await Keyboard.setResizeMode({ mode: KeyboardResize.Body })
                        await Keyboard.setScroll({ isDisabled: false })
                    } catch (e) {
                        console.warn("Keyboard plugin error", e)
                    }

                    // Handle App State changes if needed
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

                } catch (error) {
                    console.error("Error initializing Capacitor plugins:", error)
                }
            }

            initCapacitor()
        }
    }, [])

    return (
        <CapacitorContext.Provider value={{ isNative }}>
            <div
                className={isNative ? "capacitor-app" : "web-app"}
                style={{
                    // Add safe area padding for native apps using CSS variables
                    paddingTop: isNative ? "var(--safe-area-inset-top)" : "0px",
                    paddingBottom: isNative ? "var(--safe-area-inset-bottom)" : "0px",
                    paddingLeft: isNative ? "var(--safe-area-inset-left)" : "0px",
                    paddingRight: isNative ? "var(--safe-area-inset-right)" : "0px",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                {children}
            </div>
        </CapacitorContext.Provider>
    )
}

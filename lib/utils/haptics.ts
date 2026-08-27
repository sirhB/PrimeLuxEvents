/**
 * Haptic feedback via the Web Vibration API.
 * Works in installed PWAs on supported mobile browsers.
 */
export type HapticStyle = "light" | "medium" | "heavy"
export type HapticNotification = "success" | "warning" | "error"

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // no-op
    }
  }
}

export const haptics = {
  impact: async (style: HapticStyle = "medium") => {
    const duration = style === "light" ? 10 : style === "heavy" ? 30 : 20
    vibrate(duration)
  },

  notification: async (type: HapticNotification = "success") => {
    const patterns: Record<HapticNotification, number[]> = {
      success: [10, 30, 10],
      warning: [20, 40, 20],
      error: [30, 20, 30, 20, 30],
    }
    vibrate(patterns[type])
  },

  vibrate: async () => vibrate(15),

  selectionStart: async () => vibrate(5),
  selectionChanged: async () => vibrate(8),
  selectionEnd: async () => vibrate(5),
}

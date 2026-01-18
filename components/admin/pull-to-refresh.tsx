'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useAnimation, PanInfo } from 'framer-motion'
import { RefreshCcw } from 'lucide-react'
import { haptics } from '@/lib/utils/haptics'

interface PullToRefreshProps {
    onRefresh: () => Promise<void>
    children: React.ReactNode
}

const PULL_THRESHOLD = 80

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)
    const controls = useAnimation()
    const containerRef = useRef<HTMLDivElement>(null)

    const handlePan = (event: any, info: PanInfo) => {
        if (isRefreshing) return

        // Only allow pulling down if at the top of the container
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        if (scrollTop > 0) return

        if (info.offset.y > 0) {
            const distance = Math.min(info.offset.y * 0.5, PULL_THRESHOLD + 20)
            setPullDistance(distance)

            // Trigger light haptic when reaching threshold
            if (distance >= PULL_THRESHOLD && pullDistance < PULL_THRESHOLD) {
                haptics.impact()
            }
        }
    }

    const handlePanEnd = async (event: any, info: PanInfo) => {
        if (isRefreshing) return

        if (pullDistance >= PULL_THRESHOLD) {
            setIsRefreshing(true)
            setPullDistance(PULL_THRESHOLD)
            haptics.notification()

            try {
                await onRefresh()
            } finally {
                setIsRefreshing(false)
                setPullDistance(0)
            }
        } else {
            setPullDistance(0)
        }
    }

    return (
        <div className="relative w-full h-full overflow-hidden">
            <motion.div
                className="absolute top-0 left-0 right-0 flex justify-center items-center h-20 pointer-events-none z-50"
                style={{ opacity: pullDistance / PULL_THRESHOLD }}
                animate={{ y: pullDistance - 40 }}
            >
                <div className="bg-[var(--dashboard-card)] p-2 rounded-full border border-[var(--dashboard-border)] shadow-lg">
                    <motion.div
                        animate={isRefreshing ? { rotate: 360 } : { rotate: (pullDistance / PULL_THRESHOLD) * 360 }}
                        transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0 }}
                    >
                        <RefreshCcw className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                ref={containerRef}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onPan={handlePan}
                onPanEnd={handlePanEnd}
                animate={{ y: isRefreshing ? PULL_THRESHOLD : 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="w-full h-full touch-pan-y"
            >
                {children}
            </motion.div>
        </div>
    )
}

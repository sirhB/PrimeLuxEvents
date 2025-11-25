"use client"

import { motion, useInView, type Variant } from "framer-motion"
import { useRef, useEffect, useState } from "react"

interface ScrollRevealProps {
    children: React.ReactNode
    className?: string
    delay?: number
    duration?: number
    /** Animation variant for desktop (with hover) */
    variant?: "fade" | "slide-up" | "slide-left" | "slide-right" | "scale" | "none"
    /** Enhanced animation for mobile (replaces hover) */
    mobileEnhanced?: boolean
    /** Custom viewport settings */
    viewportAmount?: number
}

export function ScrollReveal({
    children,
    className,
    delay = 0,
    duration = 0.6,
    variant = "fade",
    mobileEnhanced = true,
    viewportAmount = 0.3,
}: ScrollRevealProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: viewportAmount })
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const variants: Record<string, { hidden: Variant; visible: Variant; hover?: Variant }> = {
        fade: {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
            hover: { scale: 1.02 },
        },
        "slide-up": {
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
            hover: { y: -10, scale: 1.02 },
        },
        "slide-left": {
            hidden: { opacity: 0, x: 50 },
            visible: { opacity: 1, x: 0 },
            hover: { x: -5 },
        },
        "slide-right": {
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0 },
            hover: { x: 5 },
        },
        scale: {
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 },
            hover: { scale: 1.05 },
        },
        none: {
            hidden: {},
            visible: {},
        },
    }

    const selectedVariant = variants[variant]

    // On mobile, enhance the visible state to include hover effects
    const visibleState = isMobile && mobileEnhanced && selectedVariant.hover
        ? { ...selectedVariant.visible, ...selectedVariant.hover }
        : selectedVariant.visible

    const animationVariants = {
        hidden: selectedVariant.hidden as Variant,
        visible: visibleState as Variant,
        hover: (selectedVariant.hover || selectedVariant.visible) as Variant,
    }

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            whileHover={!isMobile && selectedVariant.hover ? "hover" : undefined}
            variants={animationVariants}
            transition={{
                duration,
                delay,
                ease: "easeOut",
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

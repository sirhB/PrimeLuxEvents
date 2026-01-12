'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, X, Sparkles, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTour } from './tour-provider'

interface TourStep {
    targetId?: string
    title: string
    description: string
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const TOUR_STEPS: TourStep[] = [
    {
        title: "Welcome to PrimeLux Admin",
        description: "Let's take a quick tour of your new dashboard. We've redesigned everything to be faster and more intuitive.",
        position: 'center'
    },
    {
        targetId: "admin-sidebar",
        title: "Smart Navigation",
        description: "All your tools are organized here. You can collapse this sidebar for more workspace when you need it.",
        position: 'right'
    },
    {
        targetId: "admin-search-trigger",
        title: "Command Center",
        description: "Press ⌘K or click here to search anything—products, orders, or even jump to different pages instantly.",
        position: 'bottom'
    },
    {
        targetId: "nav-products",
        title: "Product Management",
        description: "Manage your inventory, categories, and custom packages all from this central products hub.",
        position: 'right'
    },
    {
        targetId: "nav-logistics",
        title: "Logistics Hub",
        description: "Track deliveries, manage warehouse bags, and scan items for quick inventory updates.",
        position: 'right'
    },
    {
        targetId: "admin-revenue",
        title: "Profit & Revenue",
        description: "Keep an eye on your bottom line with real-time revenue tracking and health charts.",
        position: 'right'
    },
    {
        targetId: "admin-tasks",
        title: "Daily Tasks",
        description: "Your personal and team tasks for the day are listed here. Check them off as you go!",
        position: 'right'
    },
    {
        targetId: "admin-notifications-trigger",
        title: "Stay Updated",
        description: "Real-time alerts for new orders, messages, and inventory updates appear right here.",
        position: 'bottom'
    },
    {
        targetId: "admin-user-section",
        title: "Your Account",
        description: "Manage your profile, settings, and sign out from here.",
        position: 'bottom'
    }
]

export function AdminTour() {
    const {
        isTourVisible,
        currentStep,
        nextStep,
        prevStep,
        skipTour,
        setTotalSteps
    } = useTour()

    const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)

    useEffect(() => {
        setTotalSteps(TOUR_STEPS.length)
    }, [setTotalSteps])

    const updateSpotlight = useCallback(() => {
        if (currentStep < 0 || currentStep >= TOUR_STEPS.length) return

        const step = TOUR_STEPS[currentStep]
        if (step.targetId) {
            const element = document.getElementById(step.targetId)
            if (element) {
                setSpotlightRect(element.getBoundingClientRect())
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
                // If element not found, default to center to avoid breaking the UI
                setSpotlightRect(null)
            }
        } else {
            setSpotlightRect(null)
        }
    }, [currentStep])

    useEffect(() => {
        if (isTourVisible) {
            updateSpotlight()
            window.addEventListener('resize', updateSpotlight)
            window.addEventListener('scroll', updateSpotlight)
        }
        return () => {
            window.removeEventListener('resize', updateSpotlight)
            window.removeEventListener('scroll', updateSpotlight)
        }
    }, [isTourVisible, updateSpotlight])

    if (!isTourVisible || currentStep === -1) return null

    const step = TOUR_STEPS[currentStep]

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            {/* Dark Backdrop with Spotlight */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
                style={{
                    clipPath: spotlightRect ? `polygon(
                        0% 0%, 0% 100%, 100% 100%, 100% 0%, 
                        ${spotlightRect.left - 8}px 0%, 
                        ${spotlightRect.left - 8}px ${spotlightRect.top - 8}px, 
                        ${spotlightRect.right + 8}px ${spotlightRect.top - 8}px, 
                        ${spotlightRect.right + 8}px ${spotlightRect.bottom + 8}px, 
                        ${spotlightRect.left - 8}px ${spotlightRect.bottom + 8}px, 
                        ${spotlightRect.left - 8}px 0%
                    )` : 'none'
                }}
                onClick={skipTour}
            />

            {/* Tour Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        x: spotlightRect ? (
                            step.position === 'right' ? spotlightRect.right + 20 :
                                step.position === 'left' ? spotlightRect.left - 340 :
                                    spotlightRect.left + (spotlightRect.width / 2) - 160
                        ) : 'calc(50vw - 160px)',
                        top: spotlightRect ? (
                            step.position === 'bottom' ? spotlightRect.bottom + 20 :
                                step.position === 'top' ? spotlightRect.top - 200 :
                                    spotlightRect.top + (spotlightRect.height / 2) - 100
                        ) : 'calc(50vh - 100px)'
                    }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute w-[320px] bg-[var(--dashboard-card)] border border-[var(--dashboard-accent-gold)]/30 rounded-2xl p-6 shadow-2xl pointer-events-auto backdrop-blur-xl"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 text-[var(--dashboard-accent-gold)]">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Step {currentStep + 1} of {TOUR_STEPS.length}</span>
                        </div>
                        <button
                            onClick={skipTour}
                            className="text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <h3 className="text-lg font-bold text-[var(--dashboard-text)] mb-2">
                        {step.title}
                    </h3>
                    <p className="text-sm text-[var(--dashboard-text-muted)] leading-relaxed mb-6">
                        {step.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {TOUR_STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-300",
                                        i === currentStep ? "w-4 bg-[var(--dashboard-accent-gold)]" : "w-1 bg-[var(--dashboard-border)]"
                                    )}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            {currentStep > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={prevStep}
                                    className="h-8 px-2 text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-white/5"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Back
                                </Button>
                            )}
                            <Button
                                size="sm"
                                onClick={nextStep}
                                className="h-8 bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all hover:scale-105"
                            >
                                {currentStep === TOUR_STEPS.length - 1 ? (
                                    <>Finish <CheckCircle2 className="ml-1 h-3.5 w-3.5" /></>
                                ) : (
                                    <>Next <ChevronRight className="ml-1 h-4 w-4" /></>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Arrow for the card */}
                    {spotlightRect && step.position !== 'center' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn(
                                "absolute w-4 h-4 bg-[var(--dashboard-card)] border-l border-t border-[var(--dashboard-accent-gold)]/30 rotate-45",
                                step.position === 'bottom' && "-top-2 left-1/2 -translate-x-1/2",
                                step.position === 'top' && "-bottom-2 left-1/2 -translate-x-1/2",
                                step.position === 'right' && "-left-2 top-1/2 -translate-y-1/2",
                                step.position === 'left' && "-right-2 top-1/2 -translate-y-1/2",
                            )}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}


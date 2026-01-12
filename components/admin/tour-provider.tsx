'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TourContextType {
    isTourVisible: boolean
    currentStep: number
    setStep: (step: number) => void
    nextStep: () => void
    prevStep: () => void
    completeTour: () => Promise<void>
    skipTour: () => Promise<void>
    totalSteps: number
    setTotalSteps: (count: number) => void
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function TourProvider({ children }: { children: React.ReactNode }) {
    const [isTourVisible, setIsTourVisible] = useState(false)
    const [currentStep, setCurrentStep] = useState(-1)
    const [totalSteps, setTotalSteps] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        const checkTourStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('has_completed_tour')
                .eq('id', user.id)
                .single()

            if (profile && !profile.has_completed_tour) {
                // Check if it was dismissed in the current session (optional)
                const isDismissed = sessionStorage.getItem('admin_tour_dismissed')
                if (!isDismissed) {
                    setTimeout(() => {
                        setCurrentStep(0)
                        setIsTourVisible(true)
                    }, 1000)
                }
            }
        }

        checkTourStatus()
    }, [supabase])

    const setStep = useCallback((step: number) => {
        setCurrentStep(step)
    }, [])

    const nextStep = useCallback(() => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            completeTour()
        }
    }, [currentStep, totalSteps])

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }, [currentStep])

    const completeTour = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('user_profiles')
                .update({ has_completed_tour: true })
                .eq('id', user.id)
        }
        setIsTourVisible(false)
        setCurrentStep(-1)
    }

    const skipTour = async () => {
        // Just hide it for this session if skipped? 
        // User asked it to show UNTIL COMPLETED, so maybe skip should still save it?
        // Let's make skip also mark as completed to avoid nagging.
        await completeTour()
    }

    return (
        <TourContext.Provider value={{
            isTourVisible,
            currentStep,
            setStep,
            nextStep,
            prevStep,
            completeTour,
            skipTour,
            totalSteps,
            setTotalSteps
        }}>
            {children}
        </TourContext.Provider>
    )
}

export function useTour() {
    const context = useContext(TourContext)
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider')
    }
    return context
}

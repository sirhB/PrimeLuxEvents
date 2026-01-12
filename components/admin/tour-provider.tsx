'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TourContextType {
    isTourVisible: boolean
    currentStep: number
    completedSteps: number[]
    setStep: (step: number) => void
    nextStep: () => void
    prevStep: () => void
    markStepAsVisited: (stepIndex: number) => Promise<void>
    completeTour: () => Promise<void>
    skipTour: () => Promise<void>
    totalSteps: number
    setTotalSteps: (count: number) => void
    readinessData: Record<string, boolean>
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function TourProvider({ children }: { children: React.ReactNode }) {
    const [isTourVisible, setIsTourVisible] = useState(false)
    const [currentStep, setCurrentStep] = useState(-1)
    const [completedSteps, setCompletedSteps] = useState<number[]>([])
    const [totalSteps, setTotalSteps] = useState(0)
    const [readinessData, setReadinessData] = useState<Record<string, boolean>>({})
    const [hasCompletedFormalTour, setHasCompletedFormalTour] = useState(false)
    const supabase = createClient()

    const fetchReadinessStatus = useCallback(async () => {
        // Parallel checks for existing data
        const [
            { count: productCount },
            { count: categoryCount },
            { count: bagCount },
            { count: orderCount },
            { count: taskCount }
        ] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }),
            supabase.from('categories').select('*', { count: 'exact', head: true }),
            supabase.from('warehouse_bags').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('*', { count: 'exact', head: true }),
            supabase.from('tasks').select('*', { count: 'exact', head: true })
        ])

        setReadinessData({
            hasProducts: (productCount || 0) > 0,
            hasCategories: (categoryCount || 0) > 0,
            hasLogistics: (bagCount || 0) > 0,
            hasOrders: (orderCount || 0) > 0,
            hasTasks: (taskCount || 0) > 0
        })
    }, [supabase])

    useEffect(() => {
        const checkTourStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('has_completed_tour, completed_tour_steps')
                .eq('id', user.id)
                .single()

            if (profile) {
                setHasCompletedFormalTour(profile.has_completed_tour)
                setCompletedSteps(profile.completed_tour_steps || [])

                if (!profile.has_completed_tour) {
                    const isDismissed = sessionStorage.getItem('admin_tour_dismissed')
                    if (!isDismissed) {
                        setTimeout(() => {
                            setCurrentStep(0)
                            setIsTourVisible(true)
                        }, 1000)
                    }
                }
            }

            await fetchReadinessStatus()
        }

        checkTourStatus()
    }, [supabase, fetchReadinessStatus])

    const setStep = useCallback((step: number) => {
        setCurrentStep(step)
        setIsTourVisible(true)
    }, [])

    const markStepAsVisited = useCallback(async (stepIndex: number) => {
        if (completedSteps.includes(stepIndex)) return

        const newCompletedSteps = [...completedSteps, stepIndex]
        setCompletedSteps(newCompletedSteps)

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('user_profiles')
                .update({ completed_tour_steps: newCompletedSteps })
                .eq('id', user.id)
        }
    }, [completedSteps, supabase])

    const nextStep = useCallback(async () => {
        if (currentStep >= 0) {
            await markStepAsVisited(currentStep)
        }

        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            // Check if all mandatory steps are done
            if (completedSteps.length + 1 >= totalSteps) {
                completeTour()
            }
        }
    }, [currentStep, totalSteps, completedSteps, markStepAsVisited])

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
                .update({
                    has_completed_tour: true,
                    readiness_completed: true // Mark readiness as done when tour is finished
                })
                .eq('id', user.id)
        }
        setIsTourVisible(false)
        setCurrentStep(-1)
        setHasCompletedFormalTour(true)
    }

    const skipTour = async () => {
        // For formal readiness, maybe we don't allow skipping easily? 
        // User said "ensure the admin go through each step".
        // Let's allow skipping but it won't mark as "completed" until they finish all steps.
        setIsTourVisible(false)
        sessionStorage.setItem('admin_tour_dismissed', 'true')
    }

    return (
        <TourContext.Provider value={{
            isTourVisible,
            currentStep,
            completedSteps,
            setStep,
            nextStep,
            prevStep,
            markStepAsVisited,
            completeTour,
            skipTour,
            totalSteps,
            setTotalSteps,
            readinessData
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

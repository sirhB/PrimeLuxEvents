'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ReadinessItems {
    settings_reviewed: boolean
    stripe_verified: boolean
    products_verified: boolean
    team_invited: boolean
}

interface ReadinessContextType {
    readinessItems: ReadinessItems
    updateReadinessItem: (key: keyof ReadinessItems, value: boolean) => Promise<void>
    progress: number
    isComplete: boolean
}

const ReadinessContext = createContext<ReadinessContextType | undefined>(undefined)

export function ReadinessProvider({ children }: { children: React.ReactNode }) {
    const [readinessItems, setReadinessItems] = useState<ReadinessItems>({
        settings_reviewed: false,
        stripe_verified: false,
        products_verified: false,
        team_invited: false
    })
    const supabase = createClient()

    useEffect(() => {
        const fetchReadinessStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('readiness_items')
                .eq('id', user.id)
                .single()

            if (profile?.readiness_items) {
                setReadinessItems(profile.readiness_items as ReadinessItems)
            }
        }

        fetchReadinessStatus()
    }, [supabase])

    const updateReadinessItem = useCallback(async (key: keyof ReadinessItems, value: boolean) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const newItems = { ...readinessItems, [key]: value }
        setReadinessItems(newItems)

        await supabase
            .from('user_profiles')
            .update({ readiness_items: newItems })
            .eq('id', user.id)
    }, [readinessItems, supabase])

    const completedCount = Object.values(readinessItems).filter(Boolean).length
    const totalCount = Object.keys(readinessItems).length
    const progress = Math.round((completedCount / totalCount) * 100)
    const isComplete = completedCount === totalCount

    return (
        <ReadinessContext.Provider value={{
            readinessItems,
            updateReadinessItem,
            progress,
            isComplete
        }}>
            {children}
        </ReadinessContext.Provider>
    )
}

export function useReadiness() {
    const context = useContext(ReadinessContext)
    if (context === undefined) {
        throw new Error('useReadiness must be used within a ReadinessProvider')
    }
    return context
}

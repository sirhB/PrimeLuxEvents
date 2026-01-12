'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Rocket,
    CheckCircle2,
    Circle,
    ChevronRight,
    AlertCircle,
    Info,
    Sparkles
} from 'lucide-react'
import { useTour } from '../tour-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LaunchReadinessTracker() {
    const {
        completedSteps,
        totalSteps,
        currentStep,
        isTourVisible,
        setStep,
        readinessData
    } = useTour()

    if (totalSteps === 0) return null

    const progress = Math.round((completedSteps.length / totalSteps) * 100)
    const isComplete = completedSteps.length >= totalSteps

    const readinessItems = [
        {
            label: 'System Introduction',
            icon: Sparkles,
            isDone: completedSteps.includes(0),
            id: 0
        },
        {
            label: readinessData.hasProducts ? 'Review Catalog' : 'Initial Catalog Setup',
            icon: Info,
            isDone: completedSteps.includes(3),
            id: 3
        },
        {
            label: readinessData.hasLogistics ? 'Verify Logistics' : 'Logistics Configuration',
            icon: Info,
            isDone: completedSteps.includes(4),
            id: 4
        },
        {
            label: readinessData.hasOrders ? 'Revenue Monitoring' : 'Financial Tracking',
            icon: Info,
            isDone: completedSteps.includes(5),
            id: 5
        },
        {
            label: readinessData.hasTasks ? 'Operations Review' : 'Task Management',
            icon: Info,
            isDone: completedSteps.includes(6),
            id: 6
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-1 xl:col-span-12 glass-card overflow-hidden group border-[var(--dashboard-accent-gold)]/20"
        >
            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                            <Rocket className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-light text-[var(--dashboard-text)]">Launch Readiness</h2>
                            <p className="text-sm text-[var(--dashboard-text-muted)] mt-1">
                                Complete your formal training and system review to enable all features.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-3xl font-serif font-light text-[var(--dashboard-accent-gold)] tabular-nums">
                                {progress}%
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-[var(--dashboard-text-muted)] font-bold">
                                Progress Score
                            </div>
                        </div>
                        <div className="h-12 w-[1px] bg-[var(--dashboard-border)] hidden md:block" />
                        {isComplete ? (
                            <div className="px-4 py-2 rounded-full bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)] text-sm font-medium flex items-center gap-2 border border-[var(--dashboard-accent-green)]/20">
                                <CheckCircle2 className="h-4 w-4" />
                                Ready for Launch
                            </div>
                        ) : (
                            <div className="px-4 py-2 rounded-full bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] text-sm font-medium flex items-center gap-2 border border-[var(--dashboard-accent-gold)]/20">
                                <AlertCircle className="h-4 w-4" />
                                {totalSteps - completedSteps.length} Steps Remaining
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {readinessItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => setStep(item.id)}
                            className={cn(
                                "flex flex-col gap-3 p-4 rounded-2xl transition-all duration-300 text-left border relative group",
                                item.isDone
                                    ? "bg-[var(--dashboard-accent-green)]/5 border-[var(--dashboard-accent-green)]/20 text-[var(--dashboard-text)]"
                                    : "bg-white/5 border-[var(--dashboard-border)] hover:bg-white/10 hover:border-[var(--dashboard-accent-gold)]/30"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <item.icon className={cn(
                                    "h-5 w-5",
                                    item.isDone ? "text-[var(--dashboard-accent-green)]" : "text-[var(--dashboard-text-muted)]"
                                )} />
                                {item.isDone ? (
                                    <CheckCircle2 className="h-4 w-4 text-[var(--dashboard-accent-green)]" />
                                ) : (
                                    <Circle className="h-4 w-4 text-[var(--dashboard-border)]" />
                                )}
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)] mb-1">Step {index + 1}</div>
                                <div className="text-sm font-medium truncate">{item.label}</div>
                            </div>

                            {!item.isDone && (
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Progress Bar */}
                <div className="mt-8 relative h-2 w-full bg-[var(--dashboard-border)] rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--dashboard-accent-gold)] to-[var(--dashboard-accent-gold-bright,var(--dashboard-accent-gold))] shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                    />
                </div>
            </div>
        </motion.div>
    )
}

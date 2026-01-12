'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle2,
    Circle,
    ChevronRight,
    Building2,
    PackageSearch,
    Tag,
    Image,
    Users,
    Truck,
    ArrowRight,
    Sparkles,
    PartyPopper
} from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { SetupStatus, getSetupStatus } from '@/app/admin/setup-actions'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface Step {
    id: keyof Omit<SetupStatus, 'isComplete' | 'progress'>
    title: string
    description: string
    href: string
    icon: any
}

const STEPS: Step[] = [
    {
        id: 'businessIdentity',
        title: 'Business Identity',
        description: 'Set your company contact info and public address.',
        href: '/admin/settings',
        icon: Building2
    },
    {
        id: 'inventoryVerification',
        title: 'Inventory Verification',
        description: 'Review and verify your product details for launch.',
        href: '/admin/products/verify',
        icon: PackageSearch
    },
    {
        id: 'pricingRules',
        title: 'Pricing Rules',
        description: 'Configure tiered discounts for volume bookings.',
        href: '/admin/marketing/discounts',
        icon: Tag
    },
    {
        id: 'portfolioShowcase',
        title: 'Portfolio Showcase',
        description: 'Add previous events to inspire your clients.',
        href: '/admin/portfolio',
        icon: Image
    },
    {
        id: 'teamBuilding',
        title: 'Build Your Team',
        description: 'Invite staff members and assign permissions.',
        href: '/admin/team',
        icon: Users
    },
    {
        id: 'logisticsConfig',
        title: 'Logistics Setup',
        description: 'Configure tax rates and warehouse location.',
        href: '/admin/settings',
        icon: Truck
    }
]

export function SetupChecklist() {
    const [status, setStatus] = useState<SetupStatus | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadStatus() {
            const data = await getSetupStatus()
            setStatus(data)
            setIsLoading(false)

            if (data?.isComplete) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#D4AF37', '#FFF', '#10B981']
                })
            }
        }
        loadStatus()
    }, [])

    const [isDismissed, setIsDismissed] = useState(false)

    if (isLoading) {
        return (
            <div className="glass-card rounded-3xl p-8 border-none animate-pulse mb-8">
                <div className="h-8 w-48 bg-white/5 rounded-md mb-4" />
                <div className="h-4 w-full bg-white/5 rounded-md mb-8" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 w-full bg-white/5 rounded-2xl" />
                    ))}
                </div>
            </div>
        )
    }

    if (!status || isDismissed) {
        return null
    }

    if (status.isComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-3xl border-none overflow-hidden relative mb-8 bg-gradient-to-br from-[var(--dashboard-accent-gold)]/5 to-[var(--dashboard-accent-green)]/5"
            >
                <div className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="p-6 rounded-full bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)] shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <PartyPopper className="w-12 h-12" />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h2 className="text-3xl font-serif text-[var(--dashboard-text)]">
                            Your Store is Ready!
                        </h2>
                        <p className="text-[var(--dashboard-text-muted)] text-sm max-w-lg">
                            Congratulations! You've completed the essential setup. Your store is now professionally configured for a world-class event rental experience.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={() => setIsDismissed(true)}
                            variant="outline"
                            className="rounded-full border-white/10 text-[var(--dashboard-text-muted)] hover:bg-white/5 px-8"
                        >
                            Dismiss
                        </Button>
                        <Link href="/admin/inventory">
                            <Button className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-bold uppercase text-[10px] tracking-widest px-8 shadow-xl">
                                Go to Inventory
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Sparkles className="w-64 h-64 text-[var(--dashboard-accent-gold)]" />
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl border-none overflow-hidden relative mb-8"
        >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="w-32 h-32 text-[var(--dashboard-accent-gold)]" />
            </div>

            <div className="p-8 space-y-8 relative z-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-[var(--dashboard-accent-gold)]/10 border border-[var(--dashboard-accent-gold)]/20 text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-accent-gold)]">
                            Store Setup
                        </div>
                        <span className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                            {Math.round(status.progress)}% Complete
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-serif text-[var(--dashboard-text)]">
                            Launch Readiness
                        </h2>
                        <p className="text-[var(--dashboard-text-muted)] text-sm max-w-lg">
                            Complete these essential steps to ensure your store is fully optimized and ready for client bookings.
                        </p>
                    </div>

                    <Progress value={status.progress} className="h-1.5 bg-white/5" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {STEPS.map((step, index) => {
                        const isCompleted = status[step.id]
                        const Icon = step.icon

                        return (
                            <Link
                                href={step.href}
                                key={step.id}
                                className="group block"
                            >
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    className={`
                                        relative p-5 rounded-2xl transition-all duration-300
                                        ${isCompleted
                                            ? 'bg-[var(--dashboard-accent-green)]/5 border border-[var(--dashboard-accent-green)]/10'
                                            : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
                                        }
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`
                                            p-3 rounded-xl transition-colors
                                            ${isCompleted
                                                ? 'bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)]'
                                                : 'bg-white/5 text-[var(--dashboard-text-muted)] group-hover:text-[var(--dashboard-accent-gold)] group-hover:bg-[var(--dashboard-accent-gold)]/10'
                                            }
                                        `}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className={`font-medium text-sm mb-1 ${isCompleted ? 'text-[var(--dashboard-text)]/70 line-through' : 'text-[var(--dashboard-text)]'}`}>
                                                {step.title}
                                            </h3>
                                            <p className="text-xs text-[var(--dashboard-text-muted)] line-clamp-1">
                                                {step.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-center pt-1">
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5 text-[var(--dashboard-accent-green)]" />
                                            ) : (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ChevronRight className="w-5 h-5 text-[var(--dashboard-accent-gold)]" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        )
                    })}
                </div>

                {!status.isComplete && (
                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs text-[var(--dashboard-text-muted)] font-medium">
                            <Sparkles className="w-4 h-4 text-[var(--dashboard-accent-gold)]" />
                            Keep going! You're almost ready to go live.
                        </div>
                        <Link href="/admin/products/verify">
                            <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-accent-gold)] hover:text-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/10 rounded-full h-10">
                                Next Step <ArrowRight className="ml-2 w-3 h-3" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

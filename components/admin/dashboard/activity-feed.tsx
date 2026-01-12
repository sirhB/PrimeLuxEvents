'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Calendar,
    CheckCircle2,
    Clock,
    ArrowRight,
    Package,
    AlertCircle,
    TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItem {
    id: string
    type: 'order' | 'task' | 'event' | 'alert'
    title: string
    description: string
    timestamp: Date
    status?: string
    priority?: string
    href: string
}

// Mock data - replace with real data from props
const mockActivities: ActivityItem[] = [
    {
        id: '1',
        type: 'order',
        title: 'New Order #1234',
        description: 'Wedding reception for Sarah & John',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'pending',
        href: '/admin/orders/1234'
    },
    {
        id: '2',
        type: 'task',
        title: 'Review Product Inventory',
        description: 'Check stock levels for upcoming events',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        priority: 'high',
        href: '/admin/tasks'
    },
    {
        id: '3',
        type: 'event',
        title: 'Corporate Event Setup',
        description: 'Delivery scheduled for tomorrow',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        href: '/admin/calendar'
    },
    {
        id: '4',
        type: 'order',
        title: 'Order #1233 Confirmed',
        description: 'Birthday party package confirmed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
        status: 'confirmed',
        href: '/admin/orders/1233'
    }
]

function getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
}

function getActivityIcon(type: ActivityItem['type']) {
    switch (type) {
        case 'order':
            return Package
        case 'task':
            return CheckCircle2
        case 'event':
            return Calendar
        case 'alert':
            return AlertCircle
        default:
            return Clock
    }
}

function getActivityColor(item: ActivityItem) {
    if (item.type === 'order') {
        return item.status === 'confirmed'
            ? 'text-[var(--dashboard-accent-green)]'
            : 'text-[var(--dashboard-accent-orange)]'
    }
    if (item.type === 'task') {
        return item.priority === 'high'
            ? 'text-[var(--dashboard-accent-orange)]'
            : 'text-[var(--dashboard-accent-blue)]'
    }
    if (item.type === 'event') {
        return 'text-[var(--dashboard-accent-blue)]'
    }
    return 'text-[var(--dashboard-text-muted)]'
}

interface ActivityFeedProps {
    activities?: ActivityItem[]
}

export function ActivityFeed({ activities = mockActivities }: ActivityFeedProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl border border-[var(--dashboard-border)] overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b border-[var(--dashboard-border)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[var(--dashboard-accent-blue)]/10">
                            <TrendingUp className="h-5 w-5 text-[var(--dashboard-accent-blue)]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-serif font-light text-[var(--dashboard-text)]">
                                Recent Activity
                            </h3>
                            <p className="text-xs text-[var(--dashboard-text-muted)]">
                                Latest updates and tasks
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/admin/activity"
                        className="text-xs font-medium text-[var(--dashboard-accent-blue)] hover:text-[var(--dashboard-accent-blue)]/80 transition-colors"
                    >
                        View All
                    </Link>
                </div>
            </div>

            {/* Activity List */}
            <div className="divide-y divide-[var(--dashboard-border)]">
                {activities.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type)
                    const colorClass = getActivityColor(activity)

                    return (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                        >
                            <Link href={activity.href}>
                                <div className="group p-6 hover:bg-[var(--dashboard-card-hover)] transition-all duration-300 cursor-pointer">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={cn(
                                            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                            activity.type === 'order' && "bg-[var(--dashboard-accent-green)]/10",
                                            activity.type === 'task' && "bg-[var(--dashboard-accent-orange)]/10",
                                            activity.type === 'event' && "bg-[var(--dashboard-accent-blue)]/10",
                                            activity.type === 'alert' && "bg-red-500/10",
                                            "group-hover:scale-110"
                                        )}>
                                            <Icon className={cn("h-5 w-5", colorClass)} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="font-medium text-[var(--dashboard-text)] group-hover:text-[var(--dashboard-accent-blue)] transition-colors">
                                                        {activity.title}
                                                    </p>
                                                    <p className="text-sm text-[var(--dashboard-text-muted)] mt-1 line-clamp-1">
                                                        {activity.description}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-[var(--dashboard-text-muted)] whitespace-nowrap">
                                                        {getTimeAgo(activity.timestamp)}
                                                    </span>
                                                    <ArrowRight className="h-4 w-4 text-[var(--dashboard-accent-blue)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>

                                            {/* Status/Priority Badge */}
                                            {(activity.status || activity.priority) && (
                                                <div className="mt-2">
                                                    <span className={cn(
                                                        "inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                                                        activity.status === 'confirmed' && "bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)] border-[var(--dashboard-accent-green)]/20",
                                                        activity.status === 'pending' && "bg-[var(--dashboard-accent-orange)]/10 text-[var(--dashboard-accent-orange)] border-[var(--dashboard-accent-orange)]/20",
                                                        activity.priority === 'high' && "bg-[var(--dashboard-accent-orange)]/10 text-[var(--dashboard-accent-orange)] border-[var(--dashboard-accent-orange)]/20",
                                                        activity.priority === 'medium' && "bg-[var(--dashboard-accent-blue)]/10 text-[var(--dashboard-accent-blue)] border-[var(--dashboard-accent-blue)]/20"
                                                    )}>
                                                        {activity.status || activity.priority}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>

            {/* Empty State */}
            {activities.length === 0 && (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-[var(--dashboard-card-hover)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-[var(--dashboard-text-muted)] opacity-30" />
                    </div>
                    <p className="text-sm text-[var(--dashboard-text-muted)]">
                        No recent activity to display
                    </p>
                </div>
            )}
        </motion.div>
    )
}

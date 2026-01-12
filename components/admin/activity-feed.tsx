'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { History, User, FileText, ShoppingCart, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

type AuditLog = {
    id: string
    table_name: string
    record_id: string
    action: 'INSERT' | 'UPDATE' | 'DELETE'
    old_data: any
    new_data: any
    changed_by: string
    created_at: string
    user_profiles?: {
        full_name: string
        avatar_url?: string
    }
}

interface ActivityFeedProps {
    tableName?: string
    recordId?: string
    limit?: number
    className?: string
}

export function ActivityFeed({ tableName, recordId, limit = 10, className }: ActivityFeedProps) {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchLogs() {
            setIsLoading(true)
            let query = supabase
                .from('audit_logs')
                .select(`
                    *,
                    user_profiles:changed_by (
                        full_name,
                        avatar_url
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(limit)

            if (tableName) query = query.eq('table_name', tableName)
            if (recordId) query = query.eq('record_id', recordId)

            const { data, error } = await query

            if (!error && data) {
                setLogs(data as any)
            }
            setIsLoading(false)
        }

        fetchLogs()

        // Realtime subscription for global activity feed
        if (!recordId) {
            const channel = supabase
                .channel('audit_logs_realtime')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => {
                    fetchLogs()
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [tableName, recordId, limit])

    const getActionIcon = (action: string, table: string) => {
        if (action === 'INSERT') return <CheckCircle2 className="h-3 w-3 text-[var(--dashboard-accent-green)]" />
        if (action === 'DELETE') return <AlertCircle className="h-3 w-3 text-red-500" />

        switch (table) {
            case 'orders': return <ShoppingCart className="h-3 w-3 text-[var(--dashboard-accent-blue)]" />
            case 'tasks': return <CheckCircle2 className="h-3 w-3 text-[var(--dashboard-accent-gold)]" />
            default: return <FileText className="h-3 w-3 text-[var(--dashboard-text-muted)]" />
        }
    }

    const getActionText = (log: AuditLog) => {
        const entityName = log.table_name.replace(/s$/, '').replace(/_/, ' ')
        const user = log.user_profiles?.full_name || 'System'

        if (log.action === 'INSERT') return `${user} created ${entityName}`
        if (log.action === 'DELETE') return `${user} deleted ${entityName}`

        // For updates, try to find what changed
        if (log.action === 'UPDATE' && log.old_data && log.new_data) {
            const changes = Object.keys(log.new_data).filter(key =>
                key !== 'updated_at' &&
                JSON.stringify(log.old_data[key]) !== JSON.stringify(log.new_data[key])
            )

            if (changes.length === 1) {
                return `${user} updated ${changes[0]} on ${entityName}`
            }
            if (changes.length > 1) {
                return `${user} updated ${changes.length} fields on ${entityName}`
            }
        }

        return `${user} updated ${entityName}`
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)]" />
                ))}
            </div>
        )
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                <History className="h-10 w-10 mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No recent activity</p>
            </div>
        )
    }

    return (
        <ScrollArea className={cn("h-full pr-4", className)}>
            <div className="flex flex-col gap-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--dashboard-border)] before:opacity-50">
                {logs.map((log) => (
                    <div key={log.id} className="relative pl-10 group">
                        {/* Timeline Bullet */}
                        <div className="absolute left-0 top-0 h-10 w-10 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center z-10 shadow-lg transition-transform group-hover:scale-110">
                            {getActionIcon(log.action, log.table_name)}
                        </div>

                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-[var(--dashboard-text)] leading-tight">
                                {getActionText(log)}
                            </p>

                            <div className="flex items-center gap-2 mt-1.5 font-bold uppercase tracking-widest text-[9px] text-[var(--dashboard-text-muted)]">
                                <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                                <span>•</span>
                                <span className="text-[var(--dashboard-accent-gold)]">#{log.record_id.slice(0, 8)}</span>
                            </div>

                            {/* Optional: Show value diff for single field updates */}
                            {log.action === 'UPDATE' && log.old_data && log.new_data && (
                                <div className="mt-2 hidden group-hover:block animate-in slide-in-from-top-1 duration-200">
                                    <div className="text-[10px] px-2 py-1.5 rounded-lg bg-black/20 border border-[var(--dashboard-border)] flex items-center gap-2">
                                        <ArrowRight className="h-2.5 w-2.5 opacity-50" />
                                        <span className="text-[var(--dashboard-text-muted)] italic">Changes recorded in audit log</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

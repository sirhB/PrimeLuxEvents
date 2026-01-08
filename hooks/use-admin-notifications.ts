'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type AdminNotification = {
    id: string
    type: 'low_stock' | 'overbooked' | 'new_order' | 'payment_received'
    title: string
    message: string
    link?: string
    is_read: boolean
    created_at: string
}

export function useAdminNotifications() {
    const [notifications, setNotifications] = useState<AdminNotification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        // Initial fetch
        async function fetchNotifications() {
            const { data, error } = await supabase
                .from('admin_notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.is_read).length)
            }
        }

        fetchNotifications()

        // Subscribe to new notifications
        const channel = supabase
            .channel('admin_notifications_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'admin_notifications'
                },
                (payload) => {
                    const newNotification = payload.new as AdminNotification
                    setNotifications(prev => [newNotification, ...prev].slice(0, 20))
                    setUnreadCount(prev => prev + 1)

                    // Show a toast for the new notification
                    toast(newNotification.title, {
                        description: newNotification.message,
                        action: newNotification.link ? {
                            label: 'View',
                            onClick: () => window.location.href = newNotification.link!
                        } : undefined
                    })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'admin_notifications'
                },
                () => {
                    // Re-fetch count if something was marked as read
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('admin_notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    const markAllAsRead = async () => {
        const { error } = await supabase
            .from('admin_notifications')
            .update({ is_read: true })
            .eq('is_read', false)

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        }
    }

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    }
}

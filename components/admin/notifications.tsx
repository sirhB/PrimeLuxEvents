'use client'

import { Bell, Package, AlertTriangle, CreditCard, ShoppingCart, Check, Trash2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAdminNotifications } from '@/hooks/use-admin-notifications'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export function AdminNotifications() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications()

    const getIcon = (type: string) => {
        switch (type) {
            case 'low_stock': return <Package className="h-4 w-4 text-amber-500" />
            case 'overbooked': return <AlertTriangle className="h-4 w-4 text-red-500" />
            case 'payment_received': return <CreditCard className="h-4 w-4 text-green-500" />
            case 'new_order': return <ShoppingCart className="h-4 w-4 text-blue-500" />
            case 'new_message': return <MessageSquare className="h-4 w-4 text-indigo-500" />
            default: return <Bell className="h-4 w-4 text-gray-500" />
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-accent-gold)] border border-transparent hover:border-[var(--dashboard-accent-gold)]/20 transition-all">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--dashboard-accent-gold)] text-[10px] font-bold text-black ring-2 ring-[var(--dashboard-background)]">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[400px] p-0 rounded-3xl overflow-hidden glass-card border-[var(--dashboard-border)] shadow-[var(--dashboard-shadow-lg)] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 bg-black/40 border-b border-[var(--dashboard-border)]">
                    <div>
                        <h3 className="font-serif text-lg text-[var(--dashboard-text)]">Notifications</h3>
                        <p className="text-[10px] text-[var(--dashboard-text-muted)] uppercase tracking-widest font-bold">Activity Feed</p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault()
                                markAllAsRead()
                            }}
                            className="text-[10px] h-8 font-bold uppercase tracking-widest text-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/10"
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <Bell className="h-6 w-6 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-500">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--dashboard-border)]">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-5 transition-colors relative group",
                                        notification.is_read ? "bg-transparent" : "bg-[var(--dashboard-accent-gold)]/[0.03]"
                                    )}
                                >
                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110",
                                            notification.type === 'overbooked' ? "bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" :
                                                notification.type === 'low_stock' ? "bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]" :
                                                    "bg-[var(--dashboard-card)] border-[var(--dashboard-border)]"
                                        )}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-sm text-[var(--dashboard-text)] leading-none">{notification.title}</h4>
                                                {!notification.is_read && (
                                                    <span className="h-2 w-2 rounded-full bg-[var(--dashboard-accent-gold)] shadow-[0_0_8px_var(--dashboard-accent-gold)]" />
                                                )}
                                            </div>
                                            <p className="text-xs text-[var(--dashboard-text-muted)] line-clamp-2 mb-2 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-[var(--dashboard-text-muted)]/60 font-medium uppercase tracking-widest">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </span>
                                                {notification.link && !notification.is_read ? (
                                                    <Link
                                                        href={notification.link}
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-[10px] font-bold text-[var(--dashboard-accent-gold)] hover:underline uppercase tracking-widest"
                                                    >
                                                        Details
                                                    </Link>
                                                ) : !notification.is_read ? (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-[10px] font-bold text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] uppercase tracking-widest transition-colors"
                                                    >
                                                        Mark as Read
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-4 border-t border-[var(--dashboard-border)] bg-black/40 text-center">
                    <Link href="/admin/activity">
                        <Button variant="ghost" size="sm" className="w-full text-[10px] text-[var(--dashboard-text-muted)] font-bold uppercase tracking-[0.2em] hover:text-[var(--dashboard-accent-gold)] hover:bg-transparent">
                            View All Activity
                        </Button>
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

'use client'

import { Bell, Package, AlertTriangle, CreditCard, ShoppingCart, Check, Trash2 } from 'lucide-react'
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
            default: return <Bell className="h-4 w-4 text-gray-500" />
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-gray-100">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0 rounded-2xl overflow-hidden border-gray-200 shadow-xl">
                <div className="flex items-center justify-between p-4 bg-gray-50/50 border-b">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault()
                                markAllAsRead()
                            }}
                            className="text-xs h-7 text-gray-500 hover:text-black"
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
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 transition-colors relative group",
                                        notification.is_read ? "bg-white" : "bg-blue-50/30"
                                    )}
                                >
                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "h-9 w-9 rounded-xl flex items-center justify-center border",
                                            notification.type === 'overbooked' ? "bg-red-50 border-red-100" :
                                                notification.type === 'low_stock' ? "bg-amber-50 border-amber-100" :
                                                    "bg-gray-50 border-gray-100"
                                        )}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-sm leading-none">{notification.title}</h4>
                                                {!notification.is_read && (
                                                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </span>
                                                {notification.link && !notification.is_read ? (
                                                    <Link
                                                        href={notification.link}
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-tight"
                                                    >
                                                        Details
                                                    </Link>
                                                ) : !notification.is_read ? (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-tight"
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
                <div className="p-3 border-t bg-gray-50/50 text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-gray-500 font-medium">
                        View All Notifications
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

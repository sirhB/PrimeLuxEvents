'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { LayoutGrid, Columns2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { haptics } from '@/lib/utils/haptics'
import { OrderRail } from './order-rail'
import { OrderKanban } from './order-kanban'

// Dynamic imports for heavy components
const OrderDetailsPane = dynamic(() => import('./order-details-pane').then(m => m.OrderDetailsPane), {
    ssr: false,
    loading: () => <div className="flex-1 flex items-center justify-center bg-black/20 animate-pulse rounded-3xl" />
})

interface Order {
    id: string
    customer_name: string
    customer_email: string
    created_at: string
    total_amount: number
    status: string
    is_overbooked: boolean
}

interface OrdersWorkspaceProps {
    initialOrders: Order[]
}

export function OrdersWorkspace({ initialOrders }: OrdersWorkspaceProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders)
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrders[0]?.id || null)
    const [viewMode, setViewMode] = useState<'dossier' | 'pipeline'>('dossier')
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('order-workspace-sync')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders'
            }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new as Order } : o))
                } else if (payload.eventType === 'INSERT') {
                    setOrders(prev => [payload.new as Order, ...prev])
                } else if (payload.eventType === 'DELETE') {
                    setOrders(prev => prev.filter(o => o.id !== payload.old.id))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const selectedOrder = useMemo(() =>
        orders.find(o => o.id === selectedOrderId),
        [orders, selectedOrderId])

    const handleStatusChange = (id: string, newStatus: string) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    }

    return (
        <div className="flex flex-col gap-4 md:gap-6 h-[900px] md:h-[calc(100vh-160px)] min-h-[500px]">
            {/* View Toggle */}
            <div className="flex justify-end">
                <div className="flex items-center gap-1 p-1 bg-black/20 border border-white/5 rounded-2xl shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            haptics.impact()
                            setViewMode('dossier')
                        }}
                        className={cn(
                            "rounded-xl h-9 px-4 text-xs font-bold uppercase tracking-wider transition-all",
                            viewMode === 'dossier'
                                ? "bg-[var(--dashboard-accent-gold)] text-black shadow-lg"
                                : "text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]"
                        )}
                    >
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Dossier
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            haptics.impact()
                            setViewMode('pipeline')
                        }}
                        className={cn(
                            "rounded-xl h-9 px-4 text-xs font-bold uppercase tracking-wider transition-all",
                            viewMode === 'pipeline'
                                ? "bg-[var(--dashboard-accent-gold)] text-black shadow-lg"
                                : "text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]"
                        )}
                    >
                        <Columns2 className="h-4 w-4 mr-2" />
                        Pipeline
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 min-h-0 relative overflow-hidden">
                {viewMode === 'dossier' ? (
                    <>
                        {/* Left Side: Order Rail */}
                        <Card className={cn(
                            "flex flex-col border-none glass-card overflow-hidden bg-black/40 transition-all duration-300",
                            "w-full lg:w-80 xl:w-96",
                            selectedOrderId ? "hidden lg:flex" : "flex"
                        )}>
                            <OrderRail
                                orders={orders}
                                selectedId={selectedOrderId}
                                onSelect={setSelectedOrderId}
                            />
                        </Card>

                        {/* Right Side: Immersive Details */}
                        <Card className={cn(
                            "flex-1 flex flex-col border-none glass-card overflow-hidden relative bg-black/40 transition-all duration-300",
                            selectedOrderId ? "flex" : "hidden lg:flex"
                        )}>
                            {selectedOrder ? (
                                <OrderDetailsPane
                                    order={selectedOrder}
                                    onBack={() => setSelectedOrderId(null)}
                                />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[var(--dashboard-text-muted)]">
                                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                        <span className="text-2xl opacity-50">✦</span>
                                    </div>
                                    <h3 className="text-xl font-serif font-medium text-[var(--dashboard-text)] mb-2">No Order Selected</h3>
                                    <p className="max-w-xs mx-auto text-sm opacity-70">
                                        Select an order from the rail on the left to view full details and manage workflow.
                                    </p>
                                </div>
                            )}
                        </Card>
                    </>
                ) : (
                    <div className="flex-1 min-h-0">
                        <OrderKanban
                            orders={orders}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

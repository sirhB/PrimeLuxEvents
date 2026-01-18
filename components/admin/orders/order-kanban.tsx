'use client'

import React, { useState } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { OrderCard } from './order-card'
import { KanbanColumn } from './kanban-column'
import { updateOrderStatus } from '@/app/admin/orders/actions'
import { toast } from 'sonner'
import { haptics } from '@/lib/utils/haptics'

const COLUMNS = [
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'processing', label: 'Processing' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
]

interface Order {
    id: string
    customer_name: string
    customer_email: string
    created_at: string
    total_amount: number
    status: string
    is_overbooked: boolean
}

interface OrderKanbanProps {
    orders: Order[]
    onStatusChange: (id: string, newStatus: string) => void
}

export function OrderKanban({ orders, onStatusChange }: OrderKanbanProps) {
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeOrder, setActiveOrder] = useState<Order | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(active.id as string)
        setActiveOrder(orders.find((o) => o.id === active.id) || null)
        haptics.impact()
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        setActiveOrder(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        // Check if dropped over a column or an item in a column
        let newStatus: string | null = null
        if (COLUMNS.find(c => c.id === overId)) {
            newStatus = overId
        } else {
            const overOrder = orders.find(o => o.id === overId)
            if (overOrder) {
                newStatus = overOrder.status
            }
        }

        const order = orders.find(o => o.id === activeId)
        if (order && newStatus && order.status !== newStatus) {
            haptics.notification()
            onStatusChange(activeId, newStatus)
            const result = await updateOrderStatus(activeId, newStatus)
            if (!result.success) {
                toast.error('Failed to update order status')
            } else {
                toast.success(`Moved Order #${order.id.slice(0, 8).toUpperCase()} to ${COLUMNS.find(c => c.id === newStatus)?.label}`)
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 h-full overflow-x-auto pb-4 scrollbar-hide">
                {COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.label}
                        orders={orders.filter((o) => o.status === column.id)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeId && activeOrder ? (
                    <div className="opacity-80 scale-105 rotate-3 transition-transform">
                        <OrderCard order={activeOrder} isOverlay />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

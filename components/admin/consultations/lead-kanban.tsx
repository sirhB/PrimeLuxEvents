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
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { type Consultation, type ConsultationStatus } from './types'
import { LeadCard } from './lead-card' // I'll need to create this or reuse existing
import { KanbanColumn } from './kanban-column'
import { updateConsultationStatus } from '@/app/admin/consultations/actions'
import { toast } from 'sonner'
import { haptics } from '@/lib/utils/haptics'

const COLUMNS: { id: ConsultationStatus; label: string }[] = [
    { id: 'new_request', label: 'New Requests' },
    { id: 'pending_response', label: 'Pending' },
    { id: 'appointment_confirmed', label: 'Appt Scheduled' },
    { id: 'completed', label: 'Completed' },
]

interface LeadKanbanProps {
    leads: Consultation[]
    onStatusChange: (id: string, newStatus: ConsultationStatus) => void
}

export function LeadKanban({ leads, onStatusChange }: LeadKanbanProps) {
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeLead, setActiveLead] = useState<Consultation | null>(null)

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
        setActiveLead(leads.find((l) => l.id === active.id) || null)
        haptics.impact()
    }

    const handleDragOver = (event: DragOverEvent) => {
        // Optional: Implement if items can be reordered within the same column
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        setActiveLead(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        // Check if dropped over a column or an item in a column
        let newStatus: ConsultationStatus | null = null
        if (COLUMNS.find(c => c.id === overId)) {
            newStatus = overId as ConsultationStatus
        } else {
            const overLead = leads.find(l => l.id === overId)
            if (overLead) {
                newStatus = overLead.status
            }
        }

        const lead = leads.find(l => l.id === activeId)
        if (lead && newStatus && lead.status !== newStatus) {
            haptics.notification()
            onStatusChange(activeId, newStatus)
            const result = await updateConsultationStatus(activeId, newStatus)
            if (!result.success) {
                toast.error('Failed to update lead status')
                // Revert locally if needed, but the parent should handle it via sync
            } else {
                toast.success(`Moved ${lead.customer_name || 'Lead'} to ${COLUMNS.find(c => c.id === newStatus)?.label}`)
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
                        leads={leads.filter((l) => l.status === column.id)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeId && activeLead ? (
                    <div className="opacity-80 scale-105 rotate-3 transition-transform">
                        <LeadCard lead={activeLead} isOverlay />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

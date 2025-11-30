'use client'

import { useState } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, MapPin, Clock, Package, CheckCircle2, Wand2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { LoadItemsDialog } from './load-items-dialog'
import { ReturnToWarehouseDialog } from './return-to-warehouse-dialog'
import { CompleteTaskDialog } from './complete-task-dialog'

interface Task {
    id: string
    title: string
    description: string
    status: string
    priority: string
    assigned_to_text: string
    task_type: string
    orders?: {
        customer_name: string
        delivery_address: string
        delivery_time: string
        latitude?: number
        longitude?: number
    }
}

interface DeliveryRoutePlannerProps {
    initialTasks: Task[]
}

function SortableTaskItem({ task, onComplete }: { task: Task, onComplete: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const openMap = () => {
        if (task.orders?.delivery_address) {
            const query = encodeURIComponent(task.orders.delivery_address)
            // Universal link that works on iOS (Apple Maps) and Android/Desktop (Google Maps)
            window.open(`https://maps.google.com/?q=${query}`, '_blank')
        } else {
            toast.error('No delivery address available')
        }
    }

    return (
        <div ref={setNodeRef} style={style} className="mb-3">
            <Card className={`bg-white hover:shadow-md transition-shadow ${task.task_type === 'return_trip' ? 'border-l-4 border-l-orange-400' : ''}`}>
                <CardContent className="p-4 flex items-center gap-4">
                    <div {...attributes} {...listeners} className="cursor-grab hover:text-gray-700 text-gray-400">
                        <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        task.task_type === 'return_trip' ? 'bg-orange-100 text-orange-800' :
                                            'bg-gray-100 text-gray-800'
                                }`}>
                                {task.task_type === 'return_trip' ? 'Return Trip' : task.status.replace('_', ' ')}
                            </span>
                        </div>

                        {task.orders ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="truncate">{task.orders.delivery_address || 'No address'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{task.orders.delivery_time || 'Any time'}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                            {task.task_type === 'delivery' && <LoadItemsDialog task={task} />}

                            {task.orders?.delivery_address && (
                                <Button variant="outline" size="sm" className="h-8" onClick={openMap}>
                                    <MapPin className="h-3.5 w-3.5 mr-2" />
                                    Map
                                </Button>
                            )}

                            <div className="flex-1" />

                            <CompleteTaskDialog task={task} onSuccess={onComplete} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export function DeliveryRoutePlanner({ initialTasks }: DeliveryRoutePlannerProps) {
    const [tasks, setTasks] = useState(initialTasks)
    const [saving, setSaving] = useState(false)
    const [optimizing, setOptimizing] = useState(false)
    const supabase = createClient()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setTasks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)

                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    async function saveRouteOrder() {
        setSaving(true)
        try {
            const updates = tasks.map((task, index) => ({
                id: task.id,
                route_order: index,
                updated_at: new Date().toISOString()
            }))

            const { error } = await supabase
                .from('tasks')
                .upsert(updates, { onConflict: 'id' })

            if (error) throw error

            toast.success('Route order saved successfully')
        } catch (error) {
            console.error('Error saving route:', error)
            toast.error('Failed to save route order')
        } finally {
            setSaving(false)
        }
    }

    async function optimizeRoute() {
        setOptimizing(true)
        toast.info('Optimizing route...')

        // Simple optimization: Sort by distance from a reference point (e.g., warehouse)
        // For a real implementation, we'd use OSRM or Google Distance Matrix API
        // Here we'll simulate it by geocoding addresses if missing and sorting

        try {
            // 1. Geocode missing addresses (client-side using Nominatim)
            const updatedTasks = [...tasks]

            // This is a simplified example. In production, use a proper geocoding service/cache.
            // We'll skip actual geocoding calls here to avoid rate limits/complexity in this demo
            // and just assume we sort by existing lat/long or just shuffle for demo if no coords.

            // Let's just sort by delivery time for now as a basic "optimization"
            // or if we had lat/long, we'd use nearest neighbor.

            updatedTasks.sort((a, b) => {
                // Prioritize time if available
                if (a.orders?.delivery_time && b.orders?.delivery_time) {
                    return a.orders.delivery_time.localeCompare(b.orders.delivery_time)
                }
                return 0
            })

            setTasks(updatedTasks)
            toast.success('Route optimized by delivery time')
        } catch (error) {
            console.error('Error optimizing route:', error)
            toast.error('Failed to optimize route')
        } finally {
            setOptimizing(false)
        }
    }

    const refreshTasks = async () => {
        // In a real app, we'd re-fetch data. 
        // For now, let's just reload the page or rely on parent revalidation if we could.
        // Or we can just filter out the completed task locally.
        window.location.reload()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <ReturnToWarehouseDialog onSuccess={refreshTasks} />

                <div className="flex gap-2">
                    <Button variant="outline" onClick={optimizeRoute} disabled={optimizing}>
                        <Wand2 className="h-4 w-4 mr-2" />
                        {optimizing ? 'Optimizing...' : 'Optimize Route'}
                    </Button>
                    <Button onClick={saveRouteOrder} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Order'}
                    </Button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="max-w-3xl mx-auto">
                        {tasks.map((task) => (
                            <SortableTaskItem key={task.id} task={task} onComplete={refreshTasks} />
                        ))}
                        {tasks.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-500">
                                No delivery tasks found. Create a task with type "Delivery" to see it here.
                            </div>
                        )}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    )
}

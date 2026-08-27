"use client"

import { useState, useEffect } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { AnimatePresence, motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditableListItem } from "./editable-list-item"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useEditorContent } from "@/components/admin/visual-editor/editor-content-context"

interface EditableListProps {
    contentKey: string
    items: any[]
    isEditing: boolean
    itemSchema: {
        [key: string]: {
            type: 'text' | 'textarea' | 'image' | 'array'
            label: string
            placeholder?: string
        }
    }
    renderItem: (item: any, index: number) => React.ReactNode
    emptyState?: React.ReactNode
}

export function EditableList({
    contentKey,
    items: initialItems,
    isEditing,
    itemSchema,
    renderItem,
    emptyState
}: EditableListProps) {
    const editor = useEditorContent()
    const contextItems = editor?.content[contentKey]
    const resolvedInitial = Array.isArray(contextItems) ? contextItems : initialItems
    const [items, setItems] = useState(resolvedInitial)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (Array.isArray(contextItems)) {
            setItems(contextItems)
        } else {
            setItems(initialItems)
        }
    }, [contextItems, initialItems])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item, idx) => `${contentKey}-${idx}` === active.id)
            const newIndex = items.findIndex((item, idx) => `${contentKey}-${idx}` === over.id)

            const newItems = arrayMove(items, oldIndex, newIndex)
            setItems(newItems)
            await saveToDatabase(newItems)
        }
    }

    const handleUpdate = async (index: number, updatedItem: any) => {
        const newItems = [...items]
        newItems[index] = updatedItem
        setItems(newItems)
        await saveToDatabase(newItems)
    }

    const handleDelete = async (index: number) => {
        const newItems = items.filter((_, i) => i !== index)
        setItems(newItems)
        await saveToDatabase(newItems)
    }

    const handleAdd = async (newItem: any) => {
        const newItems = [...items, newItem]
        setItems(newItems)
        await saveToDatabase(newItems)
        setIsAddingNew(false)
    }

    const saveToDatabase = async (newItems: any[]) => {
        try {
            if (editor) {
                editor.updateField(contentKey, newItems)
                const ok = await editor.saveField(contentKey, newItems)
                if (!ok) throw new Error('Save failed')
            } else {
                const { error } = await supabase
                    .from('content')
                    .update({ value: JSON.stringify(newItems) })
                    .eq('key', contentKey)

                if (error) throw error
            }
            toast.success("List updated successfully")
        } catch (error) {
            console.error('Error saving list:', error)
            toast.error("Failed to update list")
        }
    }

    if (!isEditing) {
        return <>{items.map((item, index) => renderItem(item, index))}</>
    }

    return (
        <div className="space-y-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map((_, idx) => `${contentKey}-${idx}`)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence>
                        {items.map((item, index) => (
                            <EditableListItem
                                key={`${contentKey}-${index}`}
                                id={`${contentKey}-${index}`}
                                item={item}
                                index={index}
                                schema={itemSchema}
                                onUpdate={(updatedItem) => handleUpdate(index, updatedItem)}
                                onDelete={() => handleDelete(index)}
                                renderPreview={() => renderItem(item, index)}
                            />
                        ))}
                    </AnimatePresence>
                </SortableContext>
            </DndContext>

            {isAddingNew ? (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border-2 border-dashed border-gold/50 rounded-lg p-6 bg-secondary/20"
                >
                    <EditableListItem
                        id="new-item"
                        item={{}}
                        index={-1}
                        schema={itemSchema}
                        onUpdate={handleAdd}
                        onDelete={() => setIsAddingNew(false)}
                        renderPreview={() => null}
                        isNew
                    />
                </motion.div>
            ) : (
                <Button
                    onClick={() => setIsAddingNew(true)}
                    variant="outline"
                    className="w-full border-dashed border-2 border-gold/30 hover:border-gold hover:bg-gold/5 h-16 text-black"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Item
                </Button>
            )}

            {items.length === 0 && !isAddingNew && emptyState}
        </div>
    )
}

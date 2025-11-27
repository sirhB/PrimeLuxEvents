"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "framer-motion"
import { GripVertical, Pencil, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface EditableListItemProps {
    id: string
    item: any
    index: number
    schema: {
        [key: string]: {
            type: 'text' | 'textarea' | 'image' | 'array'
            label: string
            placeholder?: string
        }
    }
    onUpdate: (item: any) => void
    onDelete: () => void
    renderPreview: () => React.ReactNode
    isNew?: boolean
}

export function EditableListItem({
    id,
    item,
    index,
    schema,
    onUpdate,
    onDelete,
    renderPreview,
    isNew = false
}: EditableListItemProps) {
    const [isEditing, setIsEditing] = useState(isNew)
    const [editedItem, setEditedItem] = useState(item)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const handleSave = () => {
        onUpdate(editedItem)
        setIsEditing(false)
    }

    const handleCancel = () => {
        if (isNew) {
            onDelete()
        } else {
            setEditedItem(item)
            setIsEditing(false)
        }
    }

    const handleFieldChange = (key: string, value: any) => {
        setEditedItem({ ...editedItem, [key]: value })
    }

    const renderField = (key: string, config: any) => {
        const value = editedItem[key] || ''

        switch (config.type) {
            case 'textarea':
                return (
                    <Textarea
                        value={value}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        placeholder={config.placeholder}
                        className="min-h-[100px] text-black bg-white"
                    />
                )
            case 'array':
                return (
                    <Textarea
                        value={Array.isArray(value) ? value.join('\n') : ''}
                        onChange={(e) => handleFieldChange(key, e.target.value.split('\n').filter(Boolean))}
                        placeholder={config.placeholder || "One item per line"}
                        className="min-h-[100px] font-mono text-sm text-black bg-white"
                    />
                )
            default:
                return (
                    <Input
                        value={value}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        placeholder={config.placeholder}
                        className="text-black bg-white"
                    />
                )
        }
    }

    if (isEditing) {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background border-2 border-gold/50 rounded-lg p-6 space-y-4"
            >
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-sm text-black uppercase tracking-wider">
                        {isNew ? 'New Item' : `Edit Item ${index + 1}`}
                    </h4>
                    <div className="flex gap-2">
                        <Button onClick={handleSave} size="sm" className="bg-gold text-black hover:bg-gold/90">
                            <Check className="w-4 h-4 mr-1" />
                            Save
                        </Button>
                        <Button onClick={handleCancel} size="sm" variant="outline" className="text-black border-border/50 hover:bg-secondary/50">
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {Object.entries(schema).map(([key, config]) => (
                        <div key={key} className="space-y-2">
                            <Label htmlFor={`${id}-${key}`} className="text-sm font-medium text-black">
                                {config.label}
                            </Label>
                            {renderField(key, config)}
                        </div>
                    ))}
                </div>
            </motion.div>
        )
    }

    return (
        <>
            <motion.div
                ref={setNodeRef}
                style={style}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group relative bg-background border border-border/40 rounded-lg overflow-hidden hover:border-gold/30 transition-all"
            >
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                        onClick={() => setIsEditing(true)}
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-black/80 hover:bg-black text-white"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        onClick={() => setShowDeleteDialog(true)}
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-black/80 hover:bg-red-600 text-white"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <button
                        {...attributes}
                        {...listeners}
                        className="h-8 w-8 flex items-center justify-center bg-black/80 hover:bg-black text-white rounded-md cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                </div>

                <div className="pointer-events-none">
                    {renderPreview()}
                </div>
            </motion.div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-black">Delete Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this item.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="text-black">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

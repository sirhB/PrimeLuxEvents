"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Pencil, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface EditableContentProps {
    contentKey: string
    initialValue: string
    type?: 'text' | 'textarea' | 'image'
    isEditing?: boolean
    className?: string
    as?: any
    alt?: string // For images
    [key: string]: any
}

export function EditableContent({
    contentKey,
    initialValue,
    type = 'text',
    isEditing = false,
    className,
    as: Component = 'div',
    alt,
    ...props
}: EditableContentProps) {
    const [value, setValue] = useState(initialValue)
    const [isSaving, setIsSaving] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [tempValue, setTempValue] = useState(initialValue)
    const supabase = createClient()
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

    useEffect(() => {
        setValue(initialValue)
        setTempValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        if (editMode && inputRef.current) {
            inputRef.current.focus()
        }
    }, [editMode])

    if (!isEditing) {
        if (type === 'image') {
            return <Component src={value} alt={alt || "Image"} className={className} {...props} />
        }
        return <Component className={className} {...props}>{value}</Component>
    }

    async function handleSave() {
        if (tempValue === value) {
            setEditMode(false)
            return
        }

        setIsSaving(true)
        try {
            // Check if content exists
            const { data: existing } = await supabase
                .from('content')
                .select('id')
                .eq('key', contentKey)
                .single()

            let error
            if (existing) {
                const { error: updateError } = await supabase
                    .from('content')
                    .update({ value: tempValue })
                    .eq('key', contentKey)
            } else {
                const { error: insertError } = await supabase
                    .from('content')
                    .insert([{ key: contentKey, value: tempValue, type: type === 'image' ? 'image' : 'text' }])
            }

            if (error) throw error

            setValue(tempValue)
            setEditMode(false)
            toast.success("Content updated successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to update content")
        } finally {
            setIsSaving(false)
        }
    }

    function handleCancel() {
        setTempValue(value)
        setEditMode(false)
    }

    if (type === 'image') {
        return (
            <div
                className={cn("relative group cursor-pointer", className)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => !editMode && setEditMode(true)}
            >
                <Component src={value} alt={alt || "Image"} className="w-full h-full object-cover" {...props} />

                {/* Overlay when hovering in edit mode */}
                <div className={cn(
                    "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200",
                    isHovered && !editMode ? "opacity-100" : "opacity-0 pointer-events-none"
                )}>
                    <Pencil className="text-white w-8 h-8" />
                </div>

                {/* Edit Modal/Popover for Image URL */}
                <AnimatePresence>
                    {editMode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-background p-4 rounded-lg w-full max-w-md space-y-4">
                                <h3 className="font-medium text-black">Edit Image URL</h3>
                                <input
                                    type="text"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="w-full p-2 border rounded-md bg-white text-black"
                                    placeholder="Enter image URL"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving} className="text-black">
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-gold text-black hover:bg-gold/90">
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {editMode ? (
                <div className="relative z-10">
                    {type === 'textarea' ? (
                        <textarea
                            ref={inputRef as any}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className={cn(
                                "w-full p-2 border-2 border-primary rounded-md bg-white text-black min-h-[100px] outline-none ring-2 ring-primary/20",
                                className
                            )}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') handleCancel()
                                // Ctrl+Enter to save
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
                            }}
                        />
                    ) : (
                        <input
                            ref={inputRef as any}
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className={cn(
                                "w-full p-1 border-2 border-primary rounded-md bg-white text-black outline-none ring-2 ring-primary/20",
                                className
                            )}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') handleCancel()
                                if (e.key === 'Enter') handleSave()
                            }}
                        />
                    )}
                    <div className="absolute right-2 top-full mt-1 flex gap-1 z-20 bg-background/90 p-1 rounded-md shadow-lg border">
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={handleSave} disabled={isSaving}>
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-100" onClick={handleCancel} disabled={isSaving}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => setEditMode(true)}
                    className={cn(
                        "relative cursor-pointer rounded-sm transition-all duration-200",
                        isHovered && "outline outline-2 outline-primary/50 bg-primary/5"
                    )}
                >
                    <Component className={className} {...props}>
                        {value || <span className="text-muted-foreground italic">Empty content</span>}
                    </Component>

                    {isHovered && (
                        <div className="absolute -right-3 -top-3 bg-primary text-primary-foreground rounded-full p-1 shadow-md z-10">
                            <Pencil className="w-3 h-3" />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Pencil, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useEditorContent } from "@/components/admin/visual-editor/editor-content-context"
import { getFieldLabel } from "@/lib/admin/visual-editor-config"

interface EditableContentProps {
    contentKey: string
    initialValue: string
    type?: 'text' | 'textarea' | 'image'
    isEditing?: boolean
    className?: string
    as?: any
    alt?: string
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
    const editor = useEditorContent()
    const contextValue = editor?.content[contentKey]
    const resolvedInitial =
        typeof contextValue === 'string'
            ? contextValue
            : contextValue != null
              ? String(contextValue)
              : initialValue

    const [value, setValue] = useState(resolvedInitial)
    const [isSaving, setIsSaving] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [tempValue, setTempValue] = useState(resolvedInitial)
    const supabase = createClient()
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
    const fieldLabel = getFieldLabel(contentKey)

    useEffect(() => {
        setValue(resolvedInitial)
        setTempValue(resolvedInitial)
    }, [resolvedInitial])

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
            if (editor) {
                editor.updateField(contentKey, tempValue)
                const ok = await editor.saveField(contentKey, tempValue)
                if (!ok) throw new Error('Save failed')
            } else {
                const { data: existing } = await supabase
                    .from('content')
                    .select('id')
                    .eq('key', contentKey)
                    .maybeSingle()

                let error = null as Error | null
                if (existing) {
                    const { error: updateError } = await supabase
                        .from('content')
                        .update({ value: tempValue })
                        .eq('key', contentKey)
                    error = updateError
                } else {
                    const { error: insertError } = await supabase
                        .from('content')
                        .insert([{
                            key: contentKey,
                            value: tempValue,
                            type: type === 'image' ? 'image' : 'text',
                        }])
                    error = insertError
                }

                if (error) throw error
                toast.success("Content updated successfully")
            }

            setValue(tempValue)
            setEditMode(false)
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

    const emptyPlaceholder = `Add ${fieldLabel}`

    if (type === 'image') {
        return (
            <div
                className={cn("relative group cursor-pointer", className)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => !editMode && setEditMode(true)}
            >
                <Component src={value} alt={alt || "Image"} className="w-full h-full object-cover" {...props} />

                <div className={cn(
                    "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200",
                    isHovered && !editMode ? "opacity-100" : "opacity-0 pointer-events-none"
                )}>
                    <Pencil className="text-white w-8 h-8" />
                </div>

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
                                <h3 className="font-medium text-black">Edit image URL</h3>
                                <input
                                    type="text"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="w-full p-2 border rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[var(--dashboard-accent-gold,#B8956B)]/40"
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
                            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className={cn(
                                "w-full p-2 border-2 border-[var(--dashboard-accent-gold,#B8956B)] rounded-md bg-white text-black min-h-[100px] outline-none ring-2 ring-[var(--dashboard-accent-gold,#B8956B)]/20",
                                className
                            )}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') handleCancel()
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
                            }}
                        />
                    ) : (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className={cn(
                                "w-full p-1 border-2 border-[var(--dashboard-accent-gold,#B8956B)] rounded-md bg-white text-black outline-none ring-2 ring-[var(--dashboard-accent-gold,#B8956B)]/20",
                                className
                            )}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') handleCancel()
                                if (e.key === 'Enter') handleSave()
                            }}
                        />
                    )}
                    <div className="absolute right-2 top-full mt-1 flex gap-1 z-20 bg-background/90 p-1 rounded-md shadow-lg border">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-[var(--dashboard-accent-gold,#B8956B)] hover:text-[var(--dashboard-accent-gold,#B8956B)] hover:bg-[var(--dashboard-accent-gold,#B8956B)]/10"
                            onClick={handleSave}
                            disabled={isSaving}
                            aria-label="Save changes"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-[var(--dashboard-text-muted,#666)] hover:bg-muted"
                            onClick={handleCancel}
                            disabled={isSaving}
                            aria-label="Cancel editing"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => setEditMode(true)}
                    className={cn(
                        "relative cursor-pointer rounded-sm transition-all duration-200",
                        isHovered && "outline outline-2 outline-[var(--dashboard-accent-gold,#B8956B)]/50 bg-[var(--dashboard-accent-gold,#B8956B)]/5"
                    )}
                >
                    <Component className={className} {...props}>
                        {value || <span className="text-muted-foreground italic">{emptyPlaceholder}</span>}
                    </Component>

                    {isHovered && (
                        <div className="absolute -right-3 -top-3 bg-[var(--dashboard-accent-gold,#B8956B)] text-black rounded-full p-1 shadow-md z-10">
                            <Pencil className="w-3 h-3" />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

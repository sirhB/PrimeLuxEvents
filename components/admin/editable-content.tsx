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

/** Fixed chrome for edit controls — never inherit storefront text-white / huge type sizes */
const EDIT_CONTROL_BASE =
    "w-full rounded-md border-2 border-[var(--dashboard-accent-gold,#B8956B)] " +
    "bg-[#F7F4EF] text-[#121110] caret-[#121110] " +
    "outline-none ring-2 ring-[var(--dashboard-accent-gold,#B8956B)]/25 " +
    "placeholder:text-[#121110]/40 selection:bg-[var(--dashboard-accent-gold,#B8956B)]/30"

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
    const wrapperRef = useRef<HTMLDivElement>(null)
    const fieldLabel = getFieldLabel(contentKey)

    useEffect(() => {
        setValue(resolvedInitial)
        setTempValue(resolvedInitial)
    }, [resolvedInitial])

    useEffect(() => {
        if (!editMode || !inputRef.current) return

        const input = inputRef.current
        input.focus()

        // Keep the field above the mobile keyboard
        const scrollIntoView = () => {
            wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        const timer = window.setTimeout(scrollIntoView, 350)
        window.visualViewport?.addEventListener('resize', scrollIntoView)

        return () => {
            window.clearTimeout(timer)
            window.visualViewport?.removeEventListener('resize', scrollIntoView)
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
                            <div className="bg-[#F7F4EF] p-4 rounded-lg w-full max-w-md space-y-4">
                                <h3 className="font-medium text-[#121110]">Edit image URL</h3>
                                <input
                                    type="text"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className={cn(EDIT_CONTROL_BASE, "p-2 text-sm")}
                                    placeholder="Enter image URL"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving} className="text-[#121110]">
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
            ref={wrapperRef}
            className="relative group scroll-mt-24"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {editMode ? (
                <div className="relative z-20 space-y-2 rounded-lg bg-[#1A1A1A]/90 p-2 ring-1 ring-[var(--dashboard-accent-gold,#B8956B)]/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-2 px-1">
                        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-accent-gold,#B8956B)]">
                            {fieldLabel}
                        </span>
                        <div className="flex shrink-0 gap-1 rounded-md border border-white/10 bg-black/40 p-0.5">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-[var(--dashboard-accent-gold,#B8956B)] hover:bg-[var(--dashboard-accent-gold,#B8956B)]/15"
                                onClick={handleSave}
                                disabled={isSaving}
                                aria-label="Save changes"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-white/70 hover:bg-white/10 hover:text-white"
                                onClick={handleCancel}
                                disabled={isSaving}
                                aria-label="Cancel editing"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {type === 'textarea' ? (
                        <textarea
                            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className={cn(EDIT_CONTROL_BASE, "min-h-[120px] p-3 text-base leading-relaxed")}
                            placeholder={emptyPlaceholder}
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
                            className={cn(EDIT_CONTROL_BASE, "p-3 text-base")}
                            placeholder={emptyPlaceholder}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') handleCancel()
                                if (e.key === 'Enter') handleSave()
                            }}
                        />
                    )}
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

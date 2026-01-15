'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Phone, Mail, MessageSquare, FileText, Send, CalendarPlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addCommunication } from '@/app/admin/consultations/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ScheduleAppointmentDialog } from './schedule-appointment-dialog'

interface LeadActionBarProps {
    consultationId: string
    customerName: string
    onActionPerformed: () => void
}

type ActionType = 'note' | 'call' | 'email' | 'text'

export function LeadActionBar({ consultationId, customerName, onActionPerformed }: LeadActionBarProps) {
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeAction, setActiveAction] = useState<ActionType>('note')
    const [isApptDialogOpen, setIsApptDialogOpen] = useState(false)

    const [isExpanded, setIsExpanded] = useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Handle click outside to collapse
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node) && !content.trim()) {
                setIsExpanded(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [content])

    const handleQuickAction = async () => {
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            await addCommunication(consultationId, activeAction, content.trim())
            toast.success(`${activeAction.charAt(0).toUpperCase() + activeAction.slice(1)} logged`)
            setContent('')
            setIsExpanded(false)
            onActionPerformed()
        } catch (error) {
            toast.error('Failed to log action')
        } finally {
            setIsSubmitting(false)
        }
    }

    const actions: { type: ActionType, icon: any, label: string, color: string }[] = [
        { type: 'note', icon: FileText, label: 'Add Note', color: 'text-blue-400' },
        { type: 'call', icon: Phone, label: 'Log Call', color: 'text-emerald-400' },
        { type: 'email', icon: Mail, label: 'Log Email', color: 'text-amber-400' },
        { type: 'text', icon: MessageSquare, label: 'Log Text', color: 'text-indigo-400' },
    ]

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
            <motion.div
                layout
                ref={containerRef}
                className={cn(
                    "bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-colors",
                    isExpanded ? "p-4 flex flex-col gap-4" : "p-2 flex items-center gap-2"
                )}
            >
                {/* Top Row: Actions & Schedule (when expanded) */}
                <motion.div layout className={cn("flex items-center gap-2", isExpanded ? "justify-between w-full" : "")}>
                    <motion.div layout className="flex bg-white/5 rounded-2xl p-1 gap-1">
                        {actions.map((action) => {
                            const Icon = action.icon
                            const isActive = activeAction === action.type
                            return (
                                <button
                                    key={action.type}
                                    onClick={() => setActiveAction(action.type)}
                                    className={cn(
                                        "p-2.5 rounded-xl transition-all duration-300",
                                        isActive
                                            ? "bg-white/10 text-white shadow-lg"
                                            : "text-[var(--dashboard-text-muted)] hover:text-white"
                                    )}
                                    title={action.label}
                                >
                                    <Icon className={cn("h-4 w-4", isActive && action.color)} />
                                </button>
                            )
                        })}
                    </motion.div>

                    {/* Schedule Button - Always visible, but moves in expanded state */}
                    <AnimatePresence mode="popLayout">
                        <div className="flex items-center gap-2">
                            {!isExpanded && <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-6 w-px bg-white/10 mx-1" />}
                            <motion.button
                                layout
                                onClick={() => setIsApptDialogOpen(true)}
                                className={cn(
                                    "p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-accent-gold)] transition-all flex items-center gap-2",
                                    isExpanded ? "bg-transparent hover:bg-white/5" : ""
                                )}
                            >
                                <CalendarPlus className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Schedule</span>
                            </motion.button>
                        </div>
                    </AnimatePresence>
                </motion.div>

                {/* Input Area */}
                <AnimatePresence mode="wait">
                    {!isExpanded ? (
                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 relative"
                            onClick={() => setIsExpanded(true)}
                        >
                            <Input
                                readOnly
                                value={content}
                                placeholder={`Type ${activeAction} here...`}
                                className="bg-transparent border-none focus-visible:ring-0 placeholder:text-white/20 text-sm h-11 pr-12 cursor-text"
                            />
                            <Button
                                size="icon"
                                disabled={!content.trim()}
                                className={cn(
                                    "absolute right-1 top-1 h-9 w-9 rounded-xl transition-all bg-white/5 text-white/20"
                                )}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full relative"
                        >
                            <div className="relative bg-white/5 rounded-2xl border border-white/5 focus-within:border-white/10 focus-within:bg-white/10 transition-all">
                                <textarea
                                    autoFocus
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={`Type your ${activeAction} note here...`}
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm p-4 min-h-[100px] resize-none text-white placeholder:text-white/20"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleQuickAction()
                                        }
                                    }}
                                />
                                <div className="p-2 flex justify-between items-center bg-black/20 rounded-b-2xl border-t border-white/5">
                                    <span className="text-[10px] text-[var(--dashboard-text-muted)] px-2">
                                        Tip: Press Enter to send
                                    </span>
                                    <Button
                                        onClick={handleQuickAction}
                                        disabled={!content.trim() || isSubmitting}
                                        className={cn(
                                            "h-9 px-4 rounded-xl transition-all text-xs font-bold uppercase tracking-wider",
                                            content.trim()
                                                ? "bg-[var(--dashboard-accent-gold)] text-black hover:bg-[var(--dashboard-accent-gold)]/90"
                                                : "bg-white/5 text-white/20"
                                        )}
                                    >
                                        Log {activeAction}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ScheduleAppointmentDialog
                    open={isApptDialogOpen}
                    onOpenChange={setIsApptDialogOpen}
                    consultationId={consultationId}
                    clientName={customerName}
                />
            </motion.div>
        </div>
    )
}

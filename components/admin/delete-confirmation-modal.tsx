'use client'

import { motion } from 'framer-motion'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title?: string
    description?: string
    itemName?: string
    isLoading?: boolean
}

export function DeleteConfirmationModal({
    open,
    onOpenChange,
    onConfirm,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    itemName,
    isLoading = false,
}: DeleteConfirmationModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)]">
                <DialogHeader>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10"
                    >
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </motion.div>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    <DialogDescription className="text-center text-[var(--dashboard-text-muted)]">
                        {description}
                        {itemName && (
                            <span className="mt-2 block font-semibold text-[var(--dashboard-text)]">
                                "{itemName}"
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

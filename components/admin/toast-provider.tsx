'use client'

import { Toaster } from 'sonner'

export function AdminToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                classNames: {
                    toast: 'bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] shadow-lg',
                    title: 'text-[var(--dashboard-text)] font-semibold',
                    description: 'text-[var(--dashboard-text-muted)]',
                    actionButton: 'bg-[var(--dashboard-accent-gold)] text-black hover:bg-[var(--dashboard-accent-gold)]/90',
                    cancelButton: 'bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)] hover:bg-[var(--dashboard-border)]',
                    closeButton: 'bg-[var(--dashboard-card-hover)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] hover:bg-[var(--dashboard-border)]',
                    success: 'border-green-500/20 bg-green-500/10',
                    error: 'border-red-500/20 bg-red-500/10',
                    warning: 'border-orange-500/20 bg-orange-500/10',
                    info: 'border-blue-500/20 bg-blue-500/10',
                },
                duration: 4000,
            }}
            richColors
        />
    )
}

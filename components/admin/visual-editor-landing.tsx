"use client"

import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VISUAL_EDITOR_PAGES } from "@/lib/admin/visual-editor-config"

interface VisualEditorLandingProps {
    onSelectPage: (page: string) => void
}

export function VisualEditorLanding({ onSelectPage }: VisualEditorLandingProps) {
    const prefersReducedMotion = useReducedMotion()

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--dashboard-background)] p-6">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, var(--dashboard-text) 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                }}
                aria-hidden
            />

            <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 mb-12 space-y-4 text-center"
            >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-gold)]">
                    Site editor
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--dashboard-text)] md:text-5xl">
                    Choose a page
                </h1>
                <p className="mx-auto max-w-lg text-sm leading-relaxed text-[var(--dashboard-text-muted)]">
                    Select a page to edit content inline. What you see in the preview is what visitors will see.
                </p>

                <Button
                    asChild
                    variant="outline"
                    className="mt-6 border-[var(--dashboard-border)] text-[var(--dashboard-text-muted)] hover:border-[var(--dashboard-accent-gold)]/35 hover:text-[var(--dashboard-text)]"
                >
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to dashboard
                    </Link>
                </Button>
            </motion.div>

            <div className="relative z-10 grid w-full max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
                {VISUAL_EDITOR_PAGES.map((page, index) => {
                    const Icon = page.icon
                    return (
                        <motion.button
                            key={page.id}
                            type="button"
                            onClick={() => onSelectPage(page.id)}
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: prefersReducedMotion ? 0 : index * 0.06 }}
                            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                            className="glass-card group rounded-[var(--dashboard-radius)] p-6 text-left transition-colors hover:border-[var(--dashboard-accent-gold)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dashboard-background)]"
                        >
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)] transition-colors group-hover:border-[var(--dashboard-accent-gold)]/40">
                                <Icon className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                            </div>

                            <h3 className="mb-1 text-base font-semibold text-[var(--dashboard-text)] transition-colors group-hover:text-[var(--dashboard-accent-gold)]">
                                {page.label}
                            </h3>
                            <p className="mb-2 text-xs leading-relaxed text-[var(--dashboard-text-muted)]">
                                {page.description}
                            </p>
                            <p className="font-mono text-[10px] text-[var(--dashboard-text-muted)]/70">
                                {page.publicPath}
                            </p>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}

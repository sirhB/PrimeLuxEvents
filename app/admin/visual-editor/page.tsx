"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { VisualEditorNav } from "@/components/admin/visual-editor-nav"
import { VisualEditorLanding } from "@/components/admin/visual-editor-landing"
import { VisualEditorSidebar } from "@/components/admin/visual-editor-sidebar"
import { AboutPageContent } from "@/components/about-page-content"
import { HowItWorksPageContent } from "@/components/how-it-works-page-content"
import { ContactPageContent } from "@/components/contact-page-content"
import { GalleryPageContent } from "@/components/gallery-page-content"
import { JournalPageContent } from "@/components/journal-page-content"
import { useEditorContent } from "@/components/admin/visual-editor/editor-content-context"
import { StageFrame } from "@/components/admin/visual-editor/stage-frame"
import { type PreviewDevice } from "@/lib/admin/visual-editor-config"

function isMissingContentTableError(message: string | null | undefined): boolean {
  if (!message) return false
  const lower = message.toLowerCase()
  return (
    lower.includes("schema cache") ||
    lower.includes("could not find the table") ||
    lower.includes("public.content") ||
    lower.includes("relation") && lower.includes("content") && lower.includes("does not exist")
  )
}

function EditorWorkspace({
    activePage,
    onPageChange,
    onNavigateToLanding,
}: {
    activePage: string
    onPageChange: (page: string) => void
    onNavigateToLanding: () => void
}) {
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop')
    // Closed by default on narrow screens so the preview is visible
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const editor = useEditorContent()
    const loadPage = editor?.loadPage

    // loadPage is stable (memoized once) — only re-fetch when the page changes
    useEffect(() => {
        if (!loadPage) return
        void loadPage(activePage)
    }, [activePage, loadPage])

    useEffect(() => {
        // Open sidebar by default on desktop widths
        const mq = window.matchMedia('(min-width: 768px)')
        setSidebarOpen(mq.matches)
        const onChange = (e: MediaQueryListEvent) => setSidebarOpen(e.matches)
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }, [])

    if (!editor) return null

    const { content, settings, isLoading, loadError } = editor

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex h-[60vh] flex-col gap-4 p-8">
                    <div className="h-8 w-1/3 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                    <div className="mt-8 h-48 w-full animate-pulse rounded bg-gray-200" />
                </div>
            )
        }

        if (loadError) {
            const missingTable = isMissingContentTableError(loadError)
            return (
                <div className="flex h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
                    <p className="text-sm font-medium text-gray-900">
                        {missingTable ? 'CMS database not set up yet' : "Couldn’t load this page’s content"}
                    </p>
                    {missingTable ? (
                        <div className="max-w-md space-y-2 text-xs leading-relaxed text-gray-600">
                            <p>
                                This Supabase project is missing the <code className="rounded bg-gray-100 px-1">public.content</code> table
                                the Site editor uses to store page copy.
                            </p>
                            <p>
                                In the Supabase SQL Editor, run{' '}
                                <code className="rounded bg-gray-100 px-1">supabase/migrations/20260827_ensure_content_cms.sql</code>
                                , then try again.
                            </p>
                        </div>
                    ) : (
                        <p className="max-w-sm text-xs text-gray-500">{loadError}</p>
                    )}
                    <button
                        type="button"
                        onClick={() => void editor.loadPage(activePage)}
                        className="mt-2 rounded-md bg-[var(--dashboard-accent-gold,#B8956B)] px-4 py-2 text-xs font-semibold text-black"
                    >
                        Try again
                    </button>
                </div>
            )
        }

        const props = { content: content || {}, isEditing: true }

        switch (activePage) {
            case 'about':
                return <AboutPageContent {...props} />
            case 'how-it-works':
                return <HowItWorksPageContent {...props} />
            case 'contact':
                return <ContactPageContent {...props} settings={settings} />
            case 'gallery':
                return <GalleryPageContent {...props} />
            case 'journal':
                return <JournalPageContent {...props} />
            default:
                return (
                    <div className="p-12 text-center text-muted-foreground">
                        Select a page to start editing
                    </div>
                )
        }
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-[var(--dashboard-background)]">
            <VisualEditorNav
                activePage={activePage}
                onPageChange={onPageChange}
                onNavigateToLanding={onNavigateToLanding}
            />

            <div className="relative flex flex-1 overflow-hidden">
                <VisualEditorSidebar
                    activePage={activePage}
                    previewDevice={previewDevice}
                    onPreviewDeviceChange={setPreviewDevice}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen((prev) => !prev)}
                />

                <StageFrame device={previewDevice}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="w-full"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </StageFrame>
            </div>
        </div>
    )
}

export default function VisualEditorPage() {
    const [activePage, setActivePage] = useState<string | null>(null)

    if (!activePage) {
        return <VisualEditorLanding onSelectPage={setActivePage} />
    }

    return (
        <EditorWorkspace
            activePage={activePage}
            onPageChange={setActivePage}
            onNavigateToLanding={() => setActivePage(null)}
        />
    )
}

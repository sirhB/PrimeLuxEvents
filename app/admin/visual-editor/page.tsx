"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
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
import { getPageKeyPrefix, type PreviewDevice } from "@/lib/admin/visual-editor-config"

function parseContentValue(value: unknown) {
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
            return JSON.parse(value)
        } catch {
            return value
        }
    }
    return value
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
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const editor = useEditorContent()
    const supabase = createClient()

    useEffect(() => {
        if (!editor) return

        const currentEditor = editor

        async function fetchData() {
            currentEditor.setIsLoading(true)
            const keyPrefix = getPageKeyPrefix(activePage)

            const [contentRes, settingsRes] = await Promise.all([
                supabase.from('content').select('*').like('key', keyPrefix + '%'),
                supabase.from('settings').select('key, value'),
            ])

            if (contentRes.error) {
                console.error('Error fetching content:', contentRes.error)
                toast.error('Failed to load content')
            } else {
                const contentMap = (contentRes.data ?? []).reduce(
                    (acc: Record<string, unknown>, item) => {
                        acc[item.key] = parseContentValue(item.value)
                        return acc
                    },
                    {},
                )
                currentEditor.setContent(contentMap)
            }

            if (!settingsRes.error && settingsRes.data) {
                const settingsMap: Record<string, string> = {}
                settingsRes.data.forEach((item) => {
                    settingsMap[item.key] = item.value
                })
                currentEditor.setSettings(settingsMap)
            }

            currentEditor.setIsLoading(false)
        }

        void fetchData()
    }, [activePage, editor, supabase])

    if (!editor) return null

    const { content, settings, isLoading } = editor

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

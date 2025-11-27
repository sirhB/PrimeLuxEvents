"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { VisualEditorNav } from "@/components/admin/visual-editor-nav"
import { VisualEditorLanding } from "@/components/admin/visual-editor-landing"
import { AboutPageContent } from "@/components/about-page-content"
import { HowItWorksPageContent } from "@/components/how-it-works-page-content"
import { ContactPageContent } from "@/components/contact-page-content"
import { GalleryPageContent } from "@/components/gallery-page-content"
import { JournalPageContent } from "@/components/journal-page-content"
import { RentalAgreementPageContent } from "@/components/rental-agreement-page-content"
import { AnimatePresence, motion } from "framer-motion"

export default function VisualEditorPage() {
    const [activePage, setActivePage] = useState<string | null>(null)
    const [content, setContent] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (!activePage) return

        async function fetchContent() {
            setLoading(true)
            let keyPrefix = activePage + '.'
            if (activePage === 'how-it-works') keyPrefix = 'howitworks.'

            const { data, error } = await supabase
                .from('content')
                .select('*')
                .like('key', keyPrefix + '%')

            if (error) {
                console.error('Error fetching content:', error)
                toast.error("Failed to load content")
            } else {
                const contentMap = data.reduce((acc: any, item: any) => {
                    let value = item.value
                    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                        try {
                            value = JSON.parse(value)
                        } catch (e) {
                            // Keep as string if parse fails
                        }
                    }
                    acc[item.key] = value
                    return acc
                }, {})
                setContent(contentMap)
            }
            setLoading(false)
        }

        fetchContent()
    }, [activePage])

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                return <ContactPageContent {...props} />
            case 'gallery':
                return <GalleryPageContent {...props} />
            case 'journal':
                return <JournalPageContent {...props} />
            case 'rental-agreement':
                return <RentalAgreementPageContent {...props} />
            default:
                return <div>Page not found</div>
        }
    }

    if (!activePage) {
        return <VisualEditorLanding onSelectPage={setActivePage} />
    }

    return (
        <div className="min-h-screen bg-background relative">
            <VisualEditorNav
                activePage={activePage}
                onPageChange={setActivePage}
                onNavigateToLanding={() => setActivePage(null)}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activePage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="pt-0"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

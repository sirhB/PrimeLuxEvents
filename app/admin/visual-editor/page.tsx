"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { VisualEditorNav } from "@/components/admin/visual-editor-nav"
import { AboutPageContent } from "@/components/about-page-content"
import { HowItWorksPageContent } from "@/components/how-it-works-page-content"
import { ContactPageContent } from "@/components/contact-page-content"
import { GalleryPageContent } from "@/components/gallery-page-content"
import { JournalPageContent } from "@/components/journal-page-content"
import { AnimatePresence, motion } from "framer-motion"

export default function VisualEditorPage() {
    const [activePage, setActivePage] = useState('about')
    const [content, setContent] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchContent() {
            setLoading(true)
            // Determine the key prefix based on the active page
            // Note: Some pages might have different prefixes if not perfectly consistent, 
            // but based on previous files: 'about.', 'howitworks.', 'contact.', 'gallery.', 'journal.'
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
                // Transform array to object and parse JSON
                const contentMap = data.reduce((acc: any, item: any) => {
                    let value = item.value
                    // Try to parse JSON if it looks like an array or object
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
            default:
                return <div>Page not found</div>
        }
    }

    return (
        <div className="min-h-screen bg-background relative">
            <VisualEditorNav activePage={activePage} onPageChange={setActivePage} />

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

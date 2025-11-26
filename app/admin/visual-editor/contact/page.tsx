"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ContactPageContent } from "@/components/contact-page-content"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function VisualEditorContactPage() {
    const [content, setContent] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchContent() {
            const { data, error } = await supabase
                .from('content')
                .select('*')
                .like('key', 'contact.%')

            if (error) {
                console.error('Error fetching content:', error)
                toast.error("Failed to load content")
            } else {
                // Transform array to object
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
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background relative">
            {/* Editor Toolbar */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-white/10"
            >
                <div className="flex items-center gap-2 mr-4 border-r border-white/20 pr-4">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="font-medium text-sm">Visual Editor Mode</span>
                </div>

                <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white">
                    <Link href="/admin/content">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Admin
                    </Link>
                </Button>

                <Button asChild variant="default" size="sm" className="bg-white text-black hover:bg-white/90">
                    <Link href="/contact" target="_blank">
                        <Eye className="w-4 h-4 mr-2" />
                        View Live
                    </Link>
                </Button>
            </motion.div>

            {/* Page Content in Edit Mode */}
            <div className="pt-0">
                <ContactPageContent content={content || {}} isEditing={true} />
            </div>
        </div>
    )
}

"use client"

import GalleryGrid from "@/app/gallery/gallery-grid"
import { motion } from "framer-motion"
import { EditableContent } from "@/components/admin/editable-content"
import { NonEditableOverlay } from "@/components/admin/non-editable-overlay"

interface GalleryPageContentProps {
    content: any
    isEditing?: boolean
}

export function GalleryPageContent({ content, isEditing = false }: GalleryPageContentProps) {
    const images = content['gallery.images'] || []

    return (
        <div className="py-20 md:py-32 bg-background min-h-screen">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <EditableContent
                        contentKey="gallery.hero.title"
                        initialValue={content['gallery.hero.title']}
                        isEditing={isEditing}
                        as="h1"
                        className="text-5xl md:text-7xl font-serif mb-8 text-foreground"
                    />
                    <EditableContent
                        contentKey="gallery.hero.description"
                        initialValue={content['gallery.hero.description']}
                        type="textarea"
                        isEditing={isEditing}
                        as="p"
                        className="text-xl text-muted-foreground font-light leading-relaxed"
                    />
                </motion.div>

                <NonEditableOverlay isEditing={isEditing} message="Gallery images are managed in the Content tab">
                    <GalleryGrid images={images} />
                </NonEditableOverlay>
            </div>
        </div>
    )
}

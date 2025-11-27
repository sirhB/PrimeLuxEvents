"use client"

import GalleryGrid from "@/app/gallery/gallery-grid"
import { motion } from "framer-motion"
import Image from "next/image"
import { EditableContent } from "@/components/admin/editable-content"
import { EditableList } from "@/components/admin/editable-list"

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

                <EditableList
                    contentKey="gallery.images"
                    items={images}
                    isEditing={isEditing}
                    itemSchema={{
                        url: { type: 'text', label: 'Image URL', placeholder: '/images/example.jpg' },
                        alt: { type: 'text', label: 'Alt Text', placeholder: 'Image description' },
                        category: { type: 'text', label: 'Category', placeholder: 'e.g. Wedding, Corporate' }
                    }}
                    renderItem={(image: any, index: number) => (
                        <div key={index} className="relative aspect-square overflow-hidden rounded-sm bg-secondary group mb-4">
                            <Image
                                src={image.url || "/placeholder.svg"}
                                alt={image.alt || "Gallery image"}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <p className="text-white font-medium">{image.category}</p>
                            </div>
                        </div>
                    )}
                    emptyState={
                        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                            <p className="text-muted-foreground">No images in gallery</p>
                        </div>
                    }
                />
            </div>
        </div>
    )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { EditableContent } from "@/components/admin/editable-content"
import { cn } from "@/lib/utils"

interface GalleryPageContentProps {
    content: any
    isEditing?: boolean
}

interface GalleryImage {
    id: string
    src: string
    alt: string
    category: string
}

const categories = ["All", "Weddings", "Corporate", "Social"]
const EMPTY_IMAGES: GalleryImage[] = []

export function GalleryPageContent({ content, isEditing = false }: GalleryPageContentProps) {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
    const [activeFilter, setActiveFilter] = useState("All")

    const images: GalleryImage[] = content['gallery.images'] || EMPTY_IMAGES
    const filteredImages = activeFilter === "All" ? images : images.filter(img => img.category === activeFilter)
    const currentIndex = selectedImage ? images.findIndex(img => img.id === selectedImage.id) : -1

    const showAt = (index: number) => {
        if (!images.length) return
        const next = (index + images.length) % images.length
        setSelectedImage(images[next])
    }

    useEffect(() => {
        if (!selectedImage) return
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setSelectedImage(null)
            if (event.key === 'ArrowRight') showAt(currentIndex + 1)
            if (event.key === 'ArrowLeft') showAt(currentIndex - 1)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [selectedImage, currentIndex, images])

    return (
        <div>
            <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
                <p className="lux-label">Gallery</p>
                <EditableContent
                    contentKey="gallery.hero.title"
                    initialValue={content['gallery.hero.title']}
                    isEditing={isEditing}
                    as="h1"
                    className="mt-4 max-w-3xl font-serif text-5xl font-medium leading-[0.95] md:text-7xl"
                />
                <EditableContent
                    contentKey="gallery.hero.description"
                    initialValue={content['gallery.hero.description']}
                    type="textarea"
                    isEditing={isEditing}
                    as="p"
                    className="mt-5 max-w-xl text-base font-light leading-relaxed text-[var(--theme-muted)]"
                />
                <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Gallery categories">
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            role="tab"
                            aria-selected={activeFilter === category}
                            onClick={() => setActiveFilter(category)}
                            className={cn(
                                'min-h-11 border px-4 text-[11px] uppercase tracking-[0.18em]',
                                activeFilter === category
                                    ? 'border-[var(--theme-dark)] bg-[var(--theme-dark)] text-[var(--theme-on-dark)]'
                                    : 'border-[var(--theme-dark)]/15 bg-white text-[var(--theme-dark)]',
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
                {filteredImages.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredImages.map((image) => (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => setSelectedImage(image)}
                                className="group block text-left"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--theme-surface)]">
                                    <Image src={image.src} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                                </div>
                                <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[var(--theme-muted)]">{image.category}</p>
                                <h2 className="mt-1 font-serif text-2xl font-medium">{image.alt}</h2>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="py-20 text-center font-serif text-3xl text-[var(--theme-muted)]">Nothing in this set yet.</p>
                )}
            </section>

            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#161310]/92 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative flex h-full w-full max-w-5xl flex-col" onClick={(event) => event.stopPropagation()}>
                        <button type="button" onClick={() => setSelectedImage(null)} className="absolute right-0 top-0 z-10 p-3 text-white" aria-label="Close">
                            <X className="h-6 w-6" />
                        </button>
                        <div className="relative min-h-0 flex-1">
                            <Image src={selectedImage.src} alt={selectedImage.alt} fill className="object-contain" />
                            {images.length > 1 && (
                                <>
                                    <button type="button" onClick={() => showAt(currentIndex - 1)} className="absolute left-0 top-1/2 -translate-y-1/2 p-3 text-white" aria-label="Previous">
                                        <ChevronLeft className="h-8 w-8" />
                                    </button>
                                    <button type="button" onClick={() => showAt(currentIndex + 1)} className="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-white" aria-label="Next">
                                        <ChevronRight className="h-8 w-8" />
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="pt-4 text-center text-white">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">{selectedImage.category}</p>
                            <p className="mt-1 font-serif text-2xl">{selectedImage.alt}</p>
                            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/60">{currentIndex + 1} / {images.length}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

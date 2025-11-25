"use client"

import { useState } from "react"
import Image from "next/image"

interface GalleryImage {
    id: string
    src: string
    alt: string
    category: string
}

interface GalleryGridProps {
    images: GalleryImage[]
}

const categories = ["All", "Weddings", "Corporate", "Social"]

export default function GalleryGrid({ images }: GalleryGridProps) {
    const [filter, setFilter] = useState("All")

    const filteredImages = filter === "All" ? images : images.filter((img) => img.category === filter)

    return (
        <>
            {/* Filters */}
            <div className="flex justify-center gap-4 mb-12 animate-fade-in-up delay-100">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`text-sm font-medium uppercase tracking-widest px-4 py-2 border-b-2 transition-colors ${filter === cat
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredImages.map((image, index) => (
                    <div
                        key={image.id}
                        className="relative aspect-square group overflow-hidden bg-secondary animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <Image
                            src={image.src || "/placeholder.svg"}
                            alt={image.alt}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-center text-white p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-sm font-medium uppercase tracking-widest mb-2">{image.category}</p>
                                <h3 className="font-serif text-xl">{image.alt}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

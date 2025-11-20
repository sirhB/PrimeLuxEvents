"use client"

import { useState } from "react"
import Image from "next/image"
import { galleryImages } from "@/lib/data"

const categories = ["All", "Weddings", "Corporate", "Social"]

export default function GalleryPage() {
  const [filter, setFilter] = useState("All")

  const filteredImages = filter === "All" ? galleryImages : galleryImages.filter((img) => img.category === filter)

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-serif mb-6">Our Portfolio</h1>
          <p className="text-lg text-muted-foreground">
            Explore a curated selection of our most memorable events. From intimate gatherings to grand galas, see how
            our pieces bring visions to life.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-12 animate-fade-in-up delay-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-sm font-medium uppercase tracking-widest px-4 py-2 border-b-2 transition-colors ${
                filter === cat
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
      </div>
    </div>
  )
}

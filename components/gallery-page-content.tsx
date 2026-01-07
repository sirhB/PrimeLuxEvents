"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import Image from "next/image"
import { Filter, X, ChevronLeft, ChevronRight, Camera, Sparkles } from "lucide-react"
import { EditableContent } from "@/components/admin/editable-content"
import { EditableList } from "@/components/admin/editable-list"
import { Button } from "@/components/ui/button"

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

export function GalleryPageContent({ content, isEditing = false }: GalleryPageContentProps) {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
    const [activeFilter, setActiveFilter] = useState("All")
    const [showFilters, setShowFilters] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const images: GalleryImage[] = content['gallery.images'] || []
    const filteredImages = activeFilter === "All" ? images : images.filter(img => img.category === activeFilter)

    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    })

    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 50])

    const nextImage = () => {
        const currentIndex = images.findIndex(img => img.id === selectedImage?.id)
        const nextIndex = (currentIndex + 1) % images.length
        setSelectedImage(images[nextIndex])
        setCurrentImageIndex(nextIndex)
    }

    const prevImage = () => {
        const currentIndex = images.findIndex(img => img.id === selectedImage?.id)
        const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
        setSelectedImage(images[prevIndex])
        setCurrentImageIndex(prevIndex)
    }

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!selectedImage) return
            if (e.key === 'Escape') setSelectedImage(null)
            if (e.key === 'ArrowRight') nextImage()
            if (e.key === 'ArrowLeft') prevImage()
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [selectedImage])

    return (
        <div className="bg-[#1A1A1A] text-white selection:bg-gold selection:text-black">
            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#1A1A1A]" />
                    <div className="absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-10 mix-blend-overlay" />
                    <Image
                        src={images.length > 0 ? images[0].src : "/images/gallery-hero.png"}
                        alt="Gallery Hero"
                        fill
                        className="object-cover opacity-30 grayscale-[30%]"
                        priority
                    />
                </div>

                <div className="container mx-auto relative z-10 px-4 md:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-12"
                        >
                            <Camera className="h-3 w-3" />
                            Visual Journey
                        </motion.div>

                        <EditableContent
                            contentKey="gallery.hero.title"
                            initialValue={content['gallery.hero.title']}
                            isEditing={isEditing}
                            as={motion.h1}
                            className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-white mb-8 leading-[0.9]"
                            style={{ y: heroY, opacity: heroOpacity }}
                        />

                        <EditableContent
                            contentKey="gallery.hero.description"
                            initialValue={content['gallery.hero.description']}
                            type="textarea"
                            isEditing={isEditing}
                            as={motion.p}
                            className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mx-auto mb-16"
                        />

                        <motion.button
                            onClick={() => setShowFilters(!showFilters)}
                            className="group relative h-16 inline-flex items-center justify-center px-12 overflow-hidden rounded-full border border-gold/30 text-gold text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:border-gold"
                        >
                            <Filter className="h-4 w-4 mr-3 group-hover:rotate-90 transition-transform duration-500" />
                            Explore Categories
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Filters Section */}
            <AnimatePresence>
                {showFilters && (
                    <motion.section
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-[#151515] border-y border-white/5 overflow-hidden"
                    >
                        <div className="container mx-auto px-4 md:px-6 py-12">
                            <div className="flex flex-wrap justify-center gap-6">
                                {categories.map((category, index) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveFilter(category)}
                                        className={`px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${activeFilter === category
                                            ? "bg-gold text-black shadow-2xl shadow-gold/20 scale-110"
                                            : "bg-white/5 text-gray-400 hover:text-gold hover:bg-white/10 border border-white/5"
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Gallery Grid */}
            <section className="py-24 md:py-48 bg-[#1A1A1A]">
                <div className="container mx-auto px-4 md:px-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeFilter}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16"
                        >
                            {filteredImages.map((image, index) => (
                                <GalleryImageCard
                                    key={image.id}
                                    image={image}
                                    index={index}
                                    onClick={() => {
                                        setSelectedImage(image)
                                        setCurrentImageIndex(images.findIndex(img => img.id === image.id))
                                    }}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {filteredImages.length === 0 && (
                        <div className="text-center py-40">
                            <Sparkles className="h-16 w-16 text-gold/20 mx-auto mb-8" />
                            <h3 className="text-2xl font-serif text-white mb-4">No Masterpieces Found</h3>
                            <p className="text-gray-500 font-light">The curtain will rise again soon.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-5 pointer-events-none" />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full h-full flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-0 right-0 p-4 text-gold hover:text-white transition-colors z-20"
                            >
                                <X className="h-8 w-8" />
                            </button>

                            {/* Image Container */}
                            <div className="relative w-full flex-1 max-h-[80vh] flex items-center justify-center">
                                {/* Navigation Buttons */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-0 p-6 text-gold/40 hover:text-gold transition-all z-20 md:-translate-x-full"
                                        >
                                            <ChevronLeft className="h-12 w-12" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-0 p-6 text-gold/40 hover:text-gold transition-all z-20 md:translate-x-full"
                                        >
                                            <ChevronRight className="h-12 w-12" />
                                        </button>
                                    </>
                                )}

                                <div className="relative w-full h-full border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                                    <Image
                                        src={selectedImage.src}
                                        alt={selectedImage.alt}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Caption */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-12 text-center"
                            >
                                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">
                                    {selectedImage.category}
                                </span>
                                <h3 className="text-3xl md:text-5xl font-serif text-white mb-4">
                                    {selectedImage.alt}
                                </h3>
                                <div className="flex items-center justify-center gap-6 mt-8">
                                    <div className="h-px w-12 bg-white/20" />
                                    <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                                        {currentImageIndex + 1} / {images.length}
                                    </p>
                                    <div className="h-px w-12 bg-white/20" />
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function GalleryImageCard({ image, index, onClick }: { image: GalleryImage, index: number, onClick: () => void }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: index * 0.1 }}
            className="group relative cursor-pointer"
            onClick={onClick}
        >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#1E1E1E] border border-white/5">
                <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                />

                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Content */}
                <div className="absolute inset-0 p-10 flex flex-col justify-end translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                    <div className="space-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                        <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">
                            {image.category}
                        </span>
                        <h3 className="text-3xl font-serif text-white tracking-tight">
                            {image.alt}
                        </h3>
                        <div className="w-12 h-px bg-gold transition-all duration-700 group-hover:w-full" />
                    </div>
                </div>

                {/* Frame border */}
                <div className="absolute inset-4 border border-white/0 group-hover:border-white/10 rounded-xl transition-all duration-700" />
            </div>
        </motion.div>
    )
}


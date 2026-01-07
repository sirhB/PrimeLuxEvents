"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { X, ChevronLeft, ChevronRight, Camera, ArrowLeft } from "lucide-react"

interface PortfolioImage {
    id: string
    image_url: string
    title: string
    description: string
}

interface PortfolioCategory {
    id: string
    name: string
    description: string
    cover_image: string
}

interface GalleryDetailProps {
    content: any
    category: PortfolioCategory
    images: PortfolioImage[]
}

export function GalleryDetail({ content, category, images }: GalleryDetailProps) {
    const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    })

    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 50])

    const nextImage = () => {
        const nextIndex = (currentImageIndex + 1) % images.length
        setSelectedImage(images[nextIndex])
        setCurrentImageIndex(nextIndex)
    }

    const prevImage = () => {
        const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
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
    }, [selectedImage, currentImageIndex])

    return (
        <div className="bg-[#1A1A1A] text-white selection:bg-gold selection:text-black">
            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#1A1A1A]" />
                    <div className="absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-10 mix-blend-overlay" />
                    <Image
                        src={category.cover_image || "/images/gallery-hero.png"}
                        alt={category.name}
                        fill
                        className="object-cover opacity-40 grayscale-[20%]"
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
                        <Link
                            href="/gallery"
                            className="inline-flex items-center gap-2 text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-12 hover:translate-x-[-4px] transition-transform"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Back to PortoFolio
                        </Link>

                        <motion.h1
                            className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-white mb-8 leading-[0.9]"
                            style={{ y: heroY, opacity: heroOpacity }}
                        >
                            {category.name}
                        </motion.h1>

                        <motion.p
                            className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mx-auto"
                        >
                            {category.description}
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Gallery Scrollable */}
            <section className="py-24 md:py-48 bg-[#1A1A1A] overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                    {images.length > 0 ? (
                        <div className="relative">
                            {/* Scroll Container */}
                            <div
                                className="flex gap-8 md:gap-12 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide scroll-smooth"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                }}
                            >
                                {images.map((image, index) => (
                                    <motion.div
                                        key={image.id}
                                        initial={{ opacity: 0, x: 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.8, delay: index * 0.05 }}
                                        className="group relative cursor-pointer flex-shrink-0 snap-center"
                                        style={{ width: 'min(85vw, 500px)' }}
                                        onClick={() => {
                                            setSelectedImage(image)
                                            setCurrentImageIndex(index)
                                        }}
                                    >
                                        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#1E1E1E] border border-white/5 shadow-2xl">
                                            <Image
                                                src={image.image_url}
                                                alt={image.title || category.name}
                                                fill
                                                className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                <h3 className="text-2xl md:text-3xl font-serif text-white mb-2 opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                                                    {image.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm font-light line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                    {image.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Scroll Indicator */}
                            <div className="flex justify-center gap-2 mt-12">
                                {images.map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-1 w-8 rounded-full bg-white/10 transition-all duration-300"
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-40 bg-white/5 rounded-3xl border border-white/5">
                            <Camera className="h-16 w-16 text-gold/20 mx-auto mb-8" />
                            <h3 className="text-2xl font-serif text-white mb-4">Gallery Opening Soon</h3>
                            <p className="text-gray-500 font-light">We are curating the finest moments for this collection.</p>
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
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-0 right-0 p-4 text-gold hover:text-white transition-colors z-20"
                            >
                                <X className="h-8 w-8" />
                            </button>

                            <div className="relative w-full flex-1 max-h-[80vh] flex items-center justify-center">
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
                                        src={selectedImage.image_url}
                                        alt={selectedImage.title || category.name}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-12 text-center"
                            >
                                <h3 className="text-3xl md:text-5xl font-serif text-white mb-4">
                                    {selectedImage.title}
                                </h3>
                                <p className="text-gray-500 text-lg font-light max-w-2xl mx-auto">
                                    {selectedImage.description}
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

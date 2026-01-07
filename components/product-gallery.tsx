"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ProductGalleryProps {
    images: string[]
    productName: string
    className?: string
    selectedImage?: string
}

export function ProductGallery({ images, productName, className, selectedImage: externalSelectedImage }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [direction, setDirection] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    // Auto-play logic
    useEffect(() => {
        if (!isAutoPlaying || images.length <= 1 || isLightboxOpen) return

        const interval = setInterval(() => {
            setDirection(1)
            setSelectedImage((prev) => (prev + 1) % images.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [isAutoPlaying, images.length, isLightboxOpen])

    // Update selected image when external prop changes
    useEffect(() => {
        if (externalSelectedImage) {
            const index = images.indexOf(externalSelectedImage)
            if (index !== -1) {
                setDirection(index > selectedImage ? 1 : -1)
                setSelectedImage(index)
                setIsAutoPlaying(false) // Pause auto-play on manual interaction
            }
        }
    }, [externalSelectedImage, images])

    const paginate = (newDirection: number) => {
        setIsAutoPlaying(false) // Pause auto-play on manual interaction
        setDirection(newDirection)
        setSelectedImage((prev) => (prev + newDirection + images.length) % images.length)
    }

    if (images.length === 0) {
        return null
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    }

    return (
        <>
            <div className={cn("space-y-6", className)}>
                {/* Main Image Container */}
                <div
                    className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-white group border border-border/5 shadow-2xl shadow-black/[0.03]"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={selectedImage}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.3 }
                            }}
                            className="absolute inset-0 w-full h-full"
                        >
                            <Image
                                src={images[selectedImage]}
                                alt={`${productName} - Image ${selectedImage + 1}`}
                                fill
                                className="object-contain p-4 md:p-8"
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Zoom Button */}
                    <button
                        onClick={() => setIsLightboxOpen(true)}
                        className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-gold hover:text-black text-foreground shadow-lg z-10"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </button>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={() => paginate(-1)}
                                className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-gold hover:text-black text-foreground shadow-lg z-10"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => paginate(1)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-gold hover:text-black text-foreground shadow-lg z-10"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[10px] font-semibold tracking-widest uppercase text-foreground shadow-sm">
                            {selectedImage + 1} / {images.length}
                        </div>
                    )}
                </div>

                {/* Progress Indicators (Dots) */}
                {images.length > 1 && (
                    <div className="flex justify-center gap-2 pt-2">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setDirection(index > selectedImage ? 1 : -1)
                                    setSelectedImage(index)
                                    setIsAutoPlaying(false)
                                }}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    selectedImage === index
                                        ? "w-8 bg-gold"
                                        : "w-2 bg-border hover:bg-gold/30"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-4 px-2 scrollbar-hide justify-center pt-4">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setDirection(index > selectedImage ? 1 : -1)
                                    setSelectedImage(index)
                                    setIsAutoPlaying(false)
                                }}
                                className={cn(
                                    "relative flex-shrink-0 w-20 h-24 rounded-2xl overflow-hidden transition-all duration-500 border-2",
                                    selectedImage === index
                                        ? "border-gold shadow-xl shadow-gold/20 -translate-y-1"
                                        : "border-transparent opacity-40 hover:opacity-100 hover:border-gold/20"
                                )}
                            >
                                <Image
                                    src={image}
                                    alt={`${productName} - Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                {selectedImage === index && (
                                    <div className="absolute inset-0 bg-gold/5 animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
                <DialogTitle className="sr-only">
                    Image Gallery: {productName}
                </DialogTitle>
                <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 border-none bg-black/95">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={selectedImage}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                className="absolute inset-0 w-full h-full"
                            >
                                <Image
                                    src={images[selectedImage]}
                                    alt={`${productName} - Image ${selectedImage + 1}`}
                                    fill
                                    className="object-contain"
                                    quality={100}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation in Lightbox */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => paginate(-1)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-gold hover:text-black text-white transition-all duration-300 z-20"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={() => paginate(1)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-gold hover:text-black text-white transition-all duration-300 z-20"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-gold hover:text-black text-white transition-all duration-300 z-20"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

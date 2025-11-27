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

    // Update selected image when external prop changes
    useEffect(() => {
        if (externalSelectedImage) {
            const index = images.indexOf(externalSelectedImage)
            if (index !== -1) {
                setDirection(index > selectedImage ? 1 : -1)
                setSelectedImage(index)
            }
        }
    }, [externalSelectedImage, images])

    const paginate = (newDirection: number) => {
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
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-secondary group border border-border/20">
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
                                className="object-cover"
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Zoom Button */}
                    <button
                        onClick={() => setIsLightboxOpen(true)}
                        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold hover:text-black text-white z-10"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </button>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={() => paginate(-1)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold hover:text-black text-white z-10"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => paginate(1)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold hover:text-black text-white z-10"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs font-medium text-white">
                            {selectedImage + 1} / {images.length}
                        </div>
                    )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setDirection(index > selectedImage ? 1 : -1)
                                    setSelectedImage(index)
                                }}
                                className={cn(
                                    "relative flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden transition-all duration-300",
                                    selectedImage === index
                                        ? "ring-2 ring-gold ring-offset-2 ring-offset-background opacity-100"
                                        : "opacity-50 hover:opacity-100 grayscale hover:grayscale-0"
                                )}
                            >
                                <Image
                                    src={image}
                                    alt={`${productName} - Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
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

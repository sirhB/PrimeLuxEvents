"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import Image from "next/image"
import { Filter, X, ChevronLeft, ChevronRight, Camera } from "lucide-react"
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

    // Lightbox navigation
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

    // Keyboard navigation
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
        <>
            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/20 via-background to-secondary/10">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
                    style={{ opacity: heroOpacity }}
                />

                <div className="container relative z-10 px-4 md:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-8"
                        >
                            <Camera className="h-4 w-4" />
                            Our Portfolio
                        </motion.div>

                    <EditableContent
                        contentKey="gallery.hero.title"
                        initialValue={content['gallery.hero.title']}
                        isEditing={isEditing}
                            as={motion.h1}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-6xl md:text-8xl font-serif font-light tracking-tight text-foreground mb-6"
                            style={{ y: heroY }}
                        />

                    <EditableContent
                        contentKey="gallery.hero.description"
                        initialValue={content['gallery.hero.description']}
                        type="textarea"
                        isEditing={isEditing}
                            as={motion.p}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto mb-12"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="outline"
                                size="lg"
                                className="group border-border/50 hover:border-gold hover:bg-gold/5 transition-all duration-300"
                            >
                                <Filter className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                                Browse Categories
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center"
                    >
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"
                        />
                    </motion.div>
                </motion.div>
            </section>

            {/* Filters Section */}
            <AnimatePresence>
                {showFilters && (
                    <motion.section
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-secondary/30 border-y border-border/40 overflow-hidden"
                    >
                        <div className="container mx-auto px-4 md:px-6 py-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap justify-center gap-4"
                            >
                                {categories.map((category, index) => (
                                    <motion.button
                                        key={category}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 * index }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveFilter(category)}
                                        className={`px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wider transition-all duration-300 ${
                                            activeFilter === category
                                                ? "bg-gold text-black shadow-lg shadow-gold/25"
                                                : "bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/30"
                                        }`}
                                    >
                                        {category}
                                    </motion.button>
                                ))}
                            </motion.div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Gallery Grid */}
            <section className="py-24 md:py-32 bg-background">
                <div className="container mx-auto px-4 md:px-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeFilter}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <div className="max-w-md mx-auto">
                                <Camera className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                                <h3 className="text-xl font-serif mb-2">No images found</h3>
                                <p className="text-muted-foreground">Try selecting a different category.</p>
                            </div>
                        </motion.div>
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
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="relative max-w-5xl max-h-[90vh] w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </motion.button>

                            {/* Navigation Buttons */}
                            {images.length > 1 && (
                                <>
                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </motion.button>
                                    <motion.button
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </motion.button>
                                </>
                            )}

                            {/* Image */}
                            <div className="relative aspect-[4/3] md:aspect-[16/10] rounded-lg overflow-hidden">
                                <Image
                                    src={selectedImage.src}
                                    alt={selectedImage.alt}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                        </div>

                            {/* Image Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-6 text-center"
                            >
                                <p className="text-gold font-medium text-sm uppercase tracking-wider mb-2">
                                    {selectedImage.category}
                                </p>
                                <h3 className="text-2xl md:text-3xl font-serif text-white mb-2">
                                    {selectedImage.alt}
                                </h3>
                                <p className="text-white/70 text-sm">
                                    {currentImageIndex + 1} of {images.length}
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

// Individual Gallery Image Card Component
function GalleryImageCard({
    image,
    index,
    onClick
}: {
    image: GalleryImage
    index: number
    onClick: () => void
}) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            className="group relative cursor-pointer"
            onClick={onClick}
        >
            <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-lg bg-secondary shadow-lg">
                <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-white"
                    >
                        <p className="text-gold font-medium text-xs uppercase tracking-widest mb-2">
                            {image.category}
                        </p>
                        <h3 className="font-serif text-xl md:text-2xl leading-tight">
                            {image.alt}
                        </h3>
                    </motion.div>
                </div>

                {/* Subtle border animation */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/30 rounded-lg transition-colors duration-500" />
            </div>
        </motion.div>
    )
}

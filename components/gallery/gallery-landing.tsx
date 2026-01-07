"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Camera, ArrowRight, Sparkles } from "lucide-react"
import { EditableContent } from "@/components/admin/editable-content"

interface PortfolioCategory {
    id: string
    name: string
    slug: string
    description: string
    cover_image: string
}

interface GalleryLandingProps {
    content: any
    categories: PortfolioCategory[]
    isEditing?: boolean
}

export function GalleryLanding({ content, categories, isEditing = false }: GalleryLandingProps) {
    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    })

    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 50])

    return (
        <div className="bg-[#1A1A1A] text-white selection:bg-gold selection:text-black">
            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#1A1A1A]" />
                    <div className="absolute inset-0 bg-[url('/images/luxury-texture.png')] opacity-10 mix-blend-overlay" />
                    <Image
                        src="/images/gallery-hero.png"
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
                            initialValue={content['gallery.hero.title'] || "The Portfolio"}
                            isEditing={isEditing}
                            as={motion.h1}
                            className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-white mb-8 leading-[0.9]"
                            style={{ y: heroY, opacity: heroOpacity }}
                        />

                        <EditableContent
                            contentKey="gallery.hero.description"
                            initialValue={content['gallery.hero.description'] || "Explore our curated collection of extraordinary moments, from grand weddings to intimate celebrations."}
                            type="textarea"
                            isEditing={isEditing}
                            as={motion.p}
                            className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mx-auto mb-16"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-24 md:py-48 bg-[#1A1A1A]">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
                        {categories.map((category, index) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                index={index}
                            />
                        ))}
                    </div>

                    {categories.length === 0 && (
                        <div className="text-center py-40">
                            <Sparkles className="h-16 w-16 text-gold/20 mx-auto mb-8" />
                            <h3 className="text-2xl font-serif text-white mb-4">No Collections Found</h3>
                            <p className="text-gray-500 font-light">The curtain will rise again soon.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

function CategoryCard({ category, index }: { category: PortfolioCategory, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className="group relative"
        >
            <Link href={`/gallery/${category.slug}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#1E1E1E] border border-white/5 shadow-2xl">
                    <Image
                        src={category.cover_image || "/images/gallery-hero.png"}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                    />

                    {/* Glass Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Content */}
                    <div className="absolute inset-0 p-10 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                        <div className="space-y-4">
                            <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">
                                Explore Collection
                            </span>
                            <h3 className="text-4xl font-serif text-white tracking-tight">
                                {category.name}
                            </h3>
                            <p className="text-gray-400 text-sm font-light line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                                {category.description}
                            </p>
                            <div className="flex items-center gap-2 text-gold text-[10px] font-bold uppercase tracking-widest pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200">
                                View Gallery <ArrowRight className="h-3 w-3" />
                            </div>
                        </div>
                    </div>

                    {/* Frame border */}
                    <div className="absolute inset-4 border border-white/0 group-hover:border-white/10 rounded-xl transition-all duration-700" />
                </div>
            </Link>
        </motion.div>
    )
}

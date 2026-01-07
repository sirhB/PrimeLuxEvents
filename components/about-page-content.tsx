"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { EditableContent } from "@/components/admin/editable-content"
import { EditableList } from "@/components/admin/editable-list"
import { Sparkles, ArrowRight, ShieldCheck, Heart, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface AboutPageContentProps {
    content: any
    isEditing?: boolean
}

export function AboutPageContent({ content, isEditing = false }: AboutPageContentProps) {
    const values = content['about.values.items'] || []
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    return (
        <div ref={containerRef} className="bg-[#1A1A1A] text-white selection:bg-gold selection:text-black">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <EditableContent
                        contentKey="about.hero.image"
                        initialValue={content['about.hero.image'] || "/images/about-hero.png"}
                        type="image"
                        isEditing={isEditing}
                        as={Image}
                        alt="Luxury Event Setup"
                        fill
                        className="object-cover opacity-40 grayscale-[20%]"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#1A1A1A]" />
                    <div className="absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-10 mix-blend-overlay" />
                </div>

                <div className="container mx-auto relative z-10 px-4 md:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="max-w-5xl mx-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-12"
                        >
                            <Sparkles className="h-3 w-3" />
                            Our Legacy
                        </motion.div>

                        <div className="relative mb-8">
                            <EditableContent
                                contentKey="about.hero.title"
                                initialValue={content['about.hero.title']}
                                isEditing={isEditing}
                                as={motion.h1}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-white mb-6 leading-[0.9]"
                            />
                        </div>

                        <EditableContent
                            contentKey="about.hero.description"
                            initialValue={content['about.hero.description']}
                            type="textarea"
                            isEditing={isEditing}
                            as={motion.p}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto mb-16"
                        />
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2"
                >
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold/60">The Story</span>
                        <div className="w-px h-20 bg-gradient-to-b from-gold/60 to-transparent" />
                    </div>
                </motion.div>
            </section>

            {/* Our Story Section */}
            <section className="relative py-24 md:py-48 overflow-hidden bg-[#151515]">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative aspect-[4/5] overflow-hidden rounded-2xl group"
                        >
                            <EditableContent
                                contentKey="about.story.image"
                                initialValue={content['about.story.image'] || "/images/luxury_event_founders_story_1767782287028.png"}
                                type="image"
                                isEditing={isEditing}
                                as={Image}
                                alt="Founder Story"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-12"
                        >
                            <div className="space-y-6">
                                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">The Visionaries</span>
                                <EditableContent
                                    contentKey="about.story.title"
                                    initialValue={content['about.story.title']}
                                    isEditing={isEditing}
                                    as="h2"
                                    className="text-4xl md:text-7xl font-serif font-light text-white tracking-tighter leading-[0.9] mb-8"
                                />
                                <div className="space-y-6">
                                    <EditableContent
                                        contentKey="about.story.p1"
                                        initialValue={content['about.story.p1']}
                                        type="textarea"
                                        isEditing={isEditing}
                                        as="p"
                                        className="text-gray-400 text-xl font-light leading-relaxed"
                                    />
                                    <EditableContent
                                        contentKey="about.story.p2"
                                        initialValue={content['about.story.p2']}
                                        type="textarea"
                                        isEditing={isEditing}
                                        as="p"
                                        className="text-gray-400 text-lg font-light leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-12 pt-8 border-t border-white/5">
                                <div className="space-y-1">
                                    <span className="text-3xl font-serif text-white">15+</span>
                                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Years of Magic</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-3xl font-serif text-white">2.5k</span>
                                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Events Shaped</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-3xl font-serif text-white">100%</span>
                                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Luxury Defined</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 md:py-48 bg-[#1A1A1A] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-5 mix-blend-overlay" />
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-3xl mx-auto mb-32"
                    >
                        <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Our Philosophy</span>
                        <EditableContent
                            contentKey="about.values.title"
                            initialValue={content['about.values.title']}
                            isEditing={isEditing}
                            as="h2"
                            className="text-4xl md:text-7xl font-serif font-light text-white mb-8 tracking-tighter"
                        />
                        <EditableContent
                            contentKey="about.values.description"
                            initialValue={content['about.values.description']}
                            type="textarea"
                            isEditing={isEditing}
                            as="p"
                            className="text-xl text-gray-400 font-light leading-relaxed"
                        />
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {values.map((value: any, index: number) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="glass-card p-12 rounded-2xl border border-white/5 group hover:border-gold/30 transition-all duration-500"
                            >
                                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-8 group-hover:bg-gold group-hover:text-black transition-all duration-500">
                                    {index === 0 ? <ShieldCheck className="w-8 h-8" /> : index === 1 ? <Heart className="w-8 h-8" /> : <Award className="w-8 h-8" />}
                                </div>
                                <h3 className="text-2xl font-serif text-white mb-6 tracking-tight group-hover:text-gold transition-colors">{value.title}</h3>
                                <p className="text-gray-400 font-light leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium CTA Section */}
            <section className="py-24 md:py-48 bg-gradient-to-br from-gold via-gold/90 to-gold/80 text-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto space-y-12"
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black/5 border border-black/10 text-black text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                            Your Event, Perfectioned
                        </div>

                        <EditableContent
                            contentKey="about.cta.title"
                            initialValue={content['about.cta.title']}
                            isEditing={isEditing}
                            as="h2"
                            className="text-5xl md:text-8xl font-serif font-light text-black tracking-tighter leading-[0.9]"
                        />

                        <EditableContent
                            contentKey="about.cta.description"
                            initialValue={content['about.cta.description']}
                            type="textarea"
                            isEditing={isEditing}
                            as="p"
                            className="text-black/80 text-xl max-w-2xl mx-auto font-light leading-relaxed"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-8 justify-center pt-8"
                        >
                            <Link
                                href="/catalog"
                                className="group relative h-16 inline-flex items-center justify-center px-12 overflow-hidden rounded-full bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:scale-105"
                            >
                                <span className="relative z-10">Start Your Collection</span>
                                <div className="absolute inset-0 -translate-x-full bg-slate-900 transition-transform duration-500 group-hover:translate-x-0" />
                            </Link>
                            <Link
                                href="/contact"
                                className="group inline-flex h-16 items-center justify-center rounded-full border-2 border-black/20 bg-transparent px-12 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-all duration-500 hover:bg-black hover:text-white hover:border-black hover:scale-105"
                            >
                                Request Consultation
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}


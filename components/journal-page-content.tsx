"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BookOpen, Calendar, Sparkles, Clock } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { EditableContent } from "@/components/admin/editable-content"
import { EditableList } from "@/components/admin/editable-list"
import { useRef } from "react"

interface JournalPageContentProps {
    content: any
    isEditing?: boolean
}

export function JournalPageContent({ content, isEditing = false }: JournalPageContentProps) {
    const posts = content['journal.posts'] || []
    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    })

    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])

    return (
        <div className="bg-[#1A1A1A] text-white selection:bg-gold selection:text-black">
            {/* Hero Section */}
            <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#1A1A1A]" />
                    <div className="absolute inset-0 bg-[url('/images/luxury-texture.png')] opacity-10 mix-blend-overlay" />
                    {posts.length > 0 && (
                        <Image
                            src={posts[0].image || "/images/luxury-event-hero.png"}
                            alt="Journal Hero"
                            fill
                            className="object-cover opacity-40 grayscale-[20%]"
                            priority
                        />
                    )}
                </div>

                <div className="container relative z-10 px-4 md:px-6">
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
                            <BookOpen className="h-3 w-3" />
                            The Editorial
                        </motion.div>

                        <div className="relative">
                            <EditableContent
                                contentKey="journal.hero.title"
                                initialValue={content['journal.hero.title']}
                                isEditing={isEditing}
                                as={motion.h1}
                                className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-white mb-8 leading-[0.9]"
                                style={{ y: heroY, opacity: heroOpacity }}
                            />
                        </div>

                        <EditableContent
                            contentKey="journal.hero.description"
                            initialValue={content['journal.hero.description']}
                            type="textarea"
                            isEditing={isEditing}
                            as={motion.p}
                            className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mb-16"
                        />
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
                >
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60 mb-4 block">Scroll Readings</span>
                    <div className="w-px h-16 bg-gradient-to-b from-gold/60 to-transparent mx-auto" />
                </motion.div>
            </section>

            {/* Posts Section */}
            <section className="py-24 md:py-48 bg-[#1A1A1A]">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="space-y-32 md:space-y-64">
                        <EditableList
                            contentKey="journal.posts"
                            items={posts}
                            isEditing={isEditing}
                            itemSchema={{
                                title: { type: 'text', label: 'Title', placeholder: 'Post Title' },
                                excerpt: { type: 'textarea', label: 'Excerpt', placeholder: 'Brief summary of the post' },
                                image: { type: 'text', label: 'Image URL', placeholder: '/images/example.jpg' },
                                category: { type: 'text', label: 'Category', placeholder: 'e.g. Events, Tips' },
                                date: { type: 'text', label: 'Date', placeholder: 'e.g. October 15, 2023' }
                            }}
                            renderItem={(post: any, index: number) => (
                                <JournalPostCard
                                    key={post.id || index}
                                    post={post}
                                    index={index}
                                />
                            )}
                            emptyState={
                                <div className="text-center py-40">
                                    <Sparkles className="h-16 w-16 text-gold/20 mx-auto mb-8" />
                                    <h3 className="text-2xl font-serif text-white mb-4">No Stories Yet</h3>
                                    <p className="text-gray-500 font-light">The ink is drying on our next feature.</p>
                                </div>
                            }
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

function JournalPostCard({ post, index }: { post: any, index: number }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className={`grid lg:grid-cols-12 gap-12 lg:gap-24 items-center group`}
        >
            {/* Image */}
            <div className={`lg:col-span-7 ${index % 2 === 1 ? 'lg:order-last' : ''}`}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#1E1E1E] border border-white/5">
                    <Image
                        src={post.image || "/images/luxury-event-hero.png"}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    <div className="absolute -top-4 -left-4 bg-gold text-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl">
                        {post.category}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={`lg:col-span-5 space-y-8 ${index % 2 === 1 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                <div className="space-y-6">
                    <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{post.date}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gold/30" />
                        <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>8 min read</span>
                        </div>
                    </div>

                    <h3 className="text-4xl md:text-6xl font-serif font-light text-white leading-tight tracking-tighter group-hover:text-gold transition-colors duration-500">
                        {post.title}
                    </h3>

                    <p className="text-gray-400 text-lg font-light leading-relaxed">
                        {post.excerpt}
                    </p>
                </div>

                <div className="pt-8">
                    <Link
                        href="#"
                        className="group/link inline-flex items-center gap-4 text-gold"
                    >
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Read Feature</span>
                        <div className="relative overflow-visible">
                            <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover/link:translate-x-4" />
                            <div className="absolute top-1/2 left-0 h-px bg-gold w-0 transition-all duration-500 group-hover/link:w-8 -translate-y-1/2 -translate-x-full" />
                        </div>
                    </Link>
                </div>
            </div>
        </motion.article>
    )
}


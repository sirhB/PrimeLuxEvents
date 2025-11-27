"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BookOpen, Calendar } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { EditableContent } from "@/components/admin/editable-content"
import { EditableList } from "@/components/admin/editable-list"

interface JournalPageContentProps {
    content: any
    isEditing?: boolean
}

export function JournalPageContent({ content, isEditing = false }: JournalPageContentProps) {
    const posts = content['journal.posts'] || []

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] as const } }
    }

    return (
        <>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/30 via-background to-secondary/10">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                />

                <div className="container relative z-10 px-4 md:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="max-w-5xl mx-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-8"
                        >
                            <BookOpen className="h-4 w-4" />
                            The Edit
                        </motion.div>

                        <EditableContent
                            contentKey="journal.hero.title"
                            initialValue={content['journal.hero.title']}
                            isEditing={isEditing}
                            as={motion.h1}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-6xl md:text-8xl font-serif font-light tracking-tight text-foreground mb-6"
                        />

                        <EditableContent
                            contentKey="journal.hero.description"
                            initialValue={content['journal.hero.description']}
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
                            <Link href="/journal/all" className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors group">
                                <span className="text-base font-medium uppercase tracking-widest">Explore All Posts</span>
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
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

            {/* Posts Section */}
            <section className="py-24 md:py-32 bg-background">
                <div className="container mx-auto px-4 md:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-8"
                        >
                            <Calendar className="h-4 w-4" />
                            Latest Insights
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
                            Trends & Inspiration
                        </h2>
                        <p className="text-xl text-muted-foreground font-light">
                            Expert advice and industry insights from the world of luxury events.
                        </p>
                    </motion.div>

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
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20"
                            >
                                <div className="max-w-md mx-auto">
                                    <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                                    <h3 className="text-xl font-serif mb-2">No posts found</h3>
                                    <p className="text-muted-foreground">Check back soon for new insights and trends.</p>
                                </div>
                            </motion.div>
                        }
                    />
                </div>
            </section>
        </>
    )
}

// Journal Post Card Component
function JournalPostCard({ post, index }: { post: any, index: number }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className={`group grid lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-24 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
        >
            {/* Image */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                className="relative group"
            >
                <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-lg bg-secondary shadow-2xl">
                    <Image
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 border-2 border-white/10 m-4 rounded-lg pointer-events-none group-hover:border-gold/30 transition-colors duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Category Badge */}
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.5, type: "spring" }}
                    className="absolute -top-4 -left-4 bg-gold text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                >
                    {post.category}
                </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, x: index % 2 === 1 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 + 0.4 }}
                className="space-y-6"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="font-light">{post.date}</span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-serif text-foreground leading-tight group-hover:text-gold transition-colors duration-300">
                        <Link href="#" className="hover:text-gold transition-colors">
                            {post.title}
                        </Link>
                    </h3>

                    <p className="text-muted-foreground text-lg leading-relaxed font-light max-w-lg">
                        {post.excerpt}
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.6 }}
                >
                    <Link
                        href="#"
                        className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-all duration-300 group/link font-medium uppercase tracking-widest text-sm"
                    >
                        Read Article
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                </motion.div>
            </motion.div>
        </motion.article>
    )
}

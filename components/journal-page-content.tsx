"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
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
        <div className="py-20 md:py-32 bg-background min-h-screen">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8"
                >
                    <div>
                        <EditableContent
                            contentKey="journal.hero.title"
                            initialValue={content['journal.hero.title']}
                            isEditing={isEditing}
                            as="h1"
                            className="text-5xl md:text-7xl font-serif mb-6 text-foreground"
                        />
                        <EditableContent
                            contentKey="journal.hero.description"
                            initialValue={content['journal.hero.description']}
                            type="textarea"
                            isEditing={isEditing}
                            as="p"
                            className="text-xl text-muted-foreground max-w-xl font-light leading-relaxed"
                        />
                    </div>
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
                        <motion.article
                            key={post.id || index}
                            variants={itemVariants}
                            className="group grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-12"
                        >
                            <div
                                className={`relative aspect-[4/3] overflow-hidden bg-secondary rounded-sm shadow-lg ${index % 2 === 1 ? "md:order-2" : ""}`}
                            >
                                <Image
                                    src={post.image || "/placeholder.svg"}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                            </div>
                            <div
                                className={`flex flex-col justify-center ${index % 2 === 1 ? "md:order-1 md:text-right items-end" : ""}`}
                            >
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                                    <span className="uppercase tracking-widest text-gold">{post.category}</span>
                                    <span className="w-px h-4 bg-border"></span>
                                    <span>{post.date}</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-serif mb-6 group-hover:text-gold transition-colors duration-300">
                                    <Link href="#">{post.title}</Link>
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-8 max-w-md text-lg font-light">{post.excerpt}</p>
                                <Link
                                    href="#"
                                    className="inline-flex items-center text-sm font-medium uppercase tracking-widest hover:text-gold transition-colors group/link"
                                >
                                    Read Article
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                                </Link>
                            </div>
                        </motion.article>
                    )}
                    emptyState={
                        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                            <p className="text-muted-foreground">No journal posts found</p>
                        </div>
                    }
                />
            </div>
        </div>
    )
}

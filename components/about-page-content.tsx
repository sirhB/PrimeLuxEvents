"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { EditableContent } from "@/components/admin/editable-content"
import { NonEditableOverlay } from "@/components/admin/non-editable-overlay"

interface AboutPageContentProps {
    content: any
    isEditing?: boolean
}

export function AboutPageContent({ content, isEditing = false }: AboutPageContentProps) {
    const values = content['about.values.items'] || []

    return (
        <>
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-black">
                <div className="absolute inset-0 z-0">
                    <EditableContent
                        contentKey="about.hero.image"
                        initialValue={content['about.hero.image'] || "/luxury-event-setup-ballroom-chandelier.jpg"}
                        type="image"
                        isEditing={isEditing}
                        as={Image}
                        alt="Luxury Event Setup"
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
                </div>
                <div className="container relative z-10 text-center text-white space-y-6 max-w-4xl px-4">
                    <EditableContent
                        contentKey="about.hero.title"
                        initialValue={content['about.hero.title']}
                        isEditing={isEditing}
                        as={motion.h1}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-serif font-medium tracking-tight"
                    />
                    <EditableContent
                        contentKey="about.hero.description"
                        initialValue={content['about.hero.description']}
                        type="textarea"
                        isEditing={isEditing}
                        as={motion.p}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-lg md:text-2xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed"
                    />
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24 md:py-32 bg-background">
                <div className="container px-4 md:px-6">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <EditableContent
                                contentKey="about.story.title"
                                initialValue={content['about.story.title']}
                                isEditing={isEditing}
                                as="h2"
                                className="text-4xl md:text-5xl font-serif text-foreground"
                            />
                            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed font-light">
                                <EditableContent
                                    contentKey="about.story.p1"
                                    initialValue={content['about.story.p1']}
                                    type="textarea"
                                    isEditing={isEditing}
                                    as="p"
                                />
                                <EditableContent
                                    contentKey="about.story.p2"
                                    initialValue={content['about.story.p2']}
                                    type="textarea"
                                    isEditing={isEditing}
                                    as="p"
                                />
                                <EditableContent
                                    contentKey="about.story.p3"
                                    initialValue={content['about.story.p3']}
                                    type="textarea"
                                    isEditing={isEditing}
                                    as="p"
                                />
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative aspect-[4/5] md:aspect-square bg-secondary rounded-sm overflow-hidden shadow-2xl"
                        >
                            <EditableContent
                                contentKey="about.story.image"
                                initialValue={content['about.story.image'] || "/elegant-wedding-reception-table-setting.jpg"}
                                type="image"
                                isEditing={isEditing}
                                as={Image}
                                alt="Our Story Image"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 border border-white/10 m-4 rounded-sm pointer-events-none" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-secondary/20 border-y border-border/40">
                <div className="container px-4 md:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <EditableContent
                            contentKey="about.values.title"
                            initialValue={content['about.values.title']}
                            isEditing={isEditing}
                            as="h2"
                            className="text-4xl md:text-5xl font-serif mb-6 text-foreground"
                        />
                        <EditableContent
                            contentKey="about.values.description"
                            initialValue={content['about.values.description']}
                            type="textarea"
                            isEditing={isEditing}
                            as="p"
                            className="text-xl text-muted-foreground font-light"
                        />
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <NonEditableOverlay isEditing={isEditing} message="Values list is managed in the Content tab">
                            <div className="grid md:grid-cols-3 gap-8 col-span-3">
                                {values.map((value: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        className="bg-background p-10 rounded-sm border border-border/40 hover:border-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5 group"
                                    >
                                        <h3 className="text-2xl font-serif mb-4 text-foreground group-hover:text-gold transition-colors">{value.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </NonEditableOverlay>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 bg-gold text-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                <div className="container px-4 md:px-6 text-center space-y-10 relative z-10">
                    <EditableContent
                        contentKey="about.cta.title"
                        initialValue={content['about.cta.title']}
                        isEditing={isEditing}
                        as={motion.h2}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-6xl font-serif"
                    />
                    <EditableContent
                        contentKey="about.cta.description"
                        initialValue={content['about.cta.description']}
                        type="textarea"
                        isEditing={isEditing}
                        as={motion.p}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-black/80 text-xl max-w-2xl mx-auto font-light"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center pt-6"
                    >
                        <Button asChild size="lg" className="min-w-[200px] bg-black text-white hover:bg-black/80 h-14 text-lg rounded-full border-2 border-transparent">
                            <Link href="/catalog">
                                <EditableContent
                                    contentKey="about.cta.primary"
                                    initialValue={content['about.cta.primary']}
                                    isEditing={isEditing}
                                    as="span"
                                />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="min-w-[200px] bg-transparent border-2 border-black/20 text-black hover:bg-black hover:text-white h-14 text-lg rounded-full"
                        >
                            <Link href="/contact">
                                <EditableContent
                                    contentKey="about.cta.secondary"
                                    initialValue={content['about.cta.secondary']}
                                    isEditing={isEditing}
                                    as="span"
                                />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>
        </>
    )
}

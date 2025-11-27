"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { EditableContent } from "@/components/admin/editable-content"
import { NonEditableOverlay } from "@/components/admin/non-editable-overlay"

interface HowItWorksPageContentProps {
    content: any
    isEditing?: boolean
}

export function HowItWorksPageContent({ content, isEditing = false }: HowItWorksPageContentProps) {
    const steps = content['howitworks.steps.list'] || []
    const faqs = content['howitworks.faq.list'] || []

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 bg-secondary/20">
                <div className="container px-4 md:px-6 text-center space-y-8">
                    <EditableContent
                        contentKey="howitworks.hero.title"
                        initialValue={content['howitworks.hero.title']}
                        isEditing={isEditing}
                        as={motion.h1}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-foreground"
                    />
                    <EditableContent
                        contentKey="howitworks.hero.description"
                        initialValue={content['howitworks.hero.description']}
                        type="textarea"
                        isEditing={isEditing}
                        as={motion.p}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-lg md:text-2xl font-light text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                    />
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-24 bg-background">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-20 lg:gap-32">
                        <NonEditableOverlay isEditing={isEditing} message="Steps are managed in the Content tab">
                            <div className="grid gap-20 lg:gap-32">
                                {steps.map((step: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.8 }}
                                        className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center"
                                    >
                                        {/* Image - alternates left/right on desktop */}
                                        <div className={`relative aspect-video lg:aspect-[4/3] bg-secondary rounded-sm overflow-hidden shadow-xl ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                                            {step.image && (
                                                <Image
                                                    src={step.image}
                                                    alt={step.title}
                                                    fill
                                                    className="object-cover hover:scale-105 transition-transform duration-700"
                                                />
                                            )}
                                            <div className="absolute inset-0 border border-white/10 m-4 rounded-sm pointer-events-none" />
                                        </div>

                                        {/* Content */}
                                        <div className={`space-y-8 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold text-black text-2xl font-serif font-bold shadow-lg shadow-gold/20">
                                                {index + 1}
                                            </div>
                                            <h2 className="text-4xl font-serif text-foreground">{step.title}</h2>
                                            <p className="text-muted-foreground text-lg leading-relaxed font-light">{step.description}</p>

                                            <div className="bg-secondary/30 p-8 rounded-sm border border-border/50 hover:border-gold/30 transition-colors">
                                                <h3 className="font-medium mb-6 flex items-center gap-3 text-lg">
                                                    <CheckCircle2 className="h-6 w-6 text-gold" />
                                                    Key Details
                                                </h3>
                                                <ul className="space-y-4">
                                                    {step.details.map((detail: string, idx: number) => (
                                                        <li key={idx} className="text-muted-foreground text-base flex items-start gap-3">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2.5 shrink-0" />
                                                            {detail}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </NonEditableOverlay>
                    </div>
                </div>
            </section>

            {/* Concierge Service */}
            <section className="py-32 bg-gold text-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                <div className="container px-4 md:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <EditableContent
                                contentKey="howitworks.concierge.title"
                                initialValue={content['howitworks.concierge.title']}
                                isEditing={isEditing}
                                as="h2"
                                className="text-4xl md:text-5xl font-serif font-medium"
                            />
                            <EditableContent
                                contentKey="howitworks.concierge.description"
                                initialValue={content['howitworks.concierge.description']}
                                type="textarea"
                                isEditing={isEditing}
                                as="p"
                                className="text-black/80 text-xl leading-relaxed font-light"
                            />
                            <Button asChild size="lg" className="mt-4 bg-black text-white hover:bg-black/80 h-14 text-lg rounded-full px-8 border-2 border-transparent">
                                <Link href="/contact">
                                    <EditableContent
                                        contentKey="howitworks.concierge.button"
                                        initialValue={content['howitworks.concierge.button']}
                                        isEditing={isEditing}
                                        as="span"
                                    />
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="bg-black/5 p-10 rounded-xl backdrop-blur-sm border border-black/10"
                        >
                            <EditableContent
                                contentKey="howitworks.concierge.list.title"
                                initialValue={content['howitworks.concierge.list.title']}
                                isEditing={isEditing}
                                as="h3"
                                className="text-2xl font-serif mb-8"
                            />
                            <ul className="space-y-6">
                                <li className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center shrink-0 font-serif font-bold">1</div>
                                    <EditableContent
                                        contentKey="howitworks.concierge.list.item1"
                                        initialValue={content['howitworks.concierge.list.item1']}
                                        isEditing={isEditing}
                                        as="span"
                                        className="text-lg"
                                    />
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center shrink-0 font-serif font-bold">2</div>
                                    <EditableContent
                                        contentKey="howitworks.concierge.list.item2"
                                        initialValue={content['howitworks.concierge.list.item2']}
                                        isEditing={isEditing}
                                        as="span"
                                        className="text-lg"
                                    />
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center shrink-0 font-serif font-bold">3</div>
                                    <EditableContent
                                        contentKey="howitworks.concierge.list.item3"
                                        initialValue={content['howitworks.concierge.list.item3']}
                                        isEditing={isEditing}
                                        as="span"
                                        className="text-lg"
                                    />
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Preview */}
            <section className="py-24 bg-background">
                <div className="container px-4 md:px-6 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <EditableContent
                            contentKey="howitworks.faq.title"
                            initialValue={content['howitworks.faq.title']}
                            isEditing={isEditing}
                            as="h2"
                            className="text-4xl font-serif mb-6 text-foreground"
                        />
                        <EditableContent
                            contentKey="howitworks.faq.description"
                            initialValue={content['howitworks.faq.description']}
                            type="textarea"
                            isEditing={isEditing}
                            as="p"
                            className="text-xl text-muted-foreground font-light"
                        />
                    </motion.div>

                    <NonEditableOverlay isEditing={isEditing} message="FAQs are managed in the Content tab">
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {faqs.map((faq: any, index: number) => (
                                <AccordionItem key={index} value={`item-${index}`} className="border border-border/50 rounded-lg px-4 data-[state=open]:border-gold/50 transition-colors">
                                    <AccordionTrigger className="text-lg font-medium hover:text-gold transition-colors py-6">{faq.question}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">{faq.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </NonEditableOverlay>

                    <div className="mt-16 text-center">
                        <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full border-border/50 hover:border-gold hover:text-gold transition-colors">
                            <Link href="/faq">
                                <EditableContent
                                    contentKey="howitworks.faq.button"
                                    initialValue={content['howitworks.faq.button']}
                                    isEditing={isEditing}
                                    as="span"
                                />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

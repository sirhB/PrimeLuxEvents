"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, ArrowRight, Sparkles, Clock, Shield } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { EditableContent } from "@/components/admin/editable-content"
import { EditableList } from "@/components/admin/editable-list"

interface HowItWorksPageContentProps {
    content: any
    isEditing?: boolean
}

export function HowItWorksPageContent({ content, isEditing = false }: HowItWorksPageContentProps) {
    const steps = content['howitworks.steps.list'] || []
    const faqs = content['howitworks.faq.list'] || []

    return (
        <>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/20 via-background to-secondary/10">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
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
                            <Sparkles className="h-4 w-4" />
                            How It Works
                        </motion.div>

                        <EditableContent
                            contentKey="howitworks.hero.title"
                            initialValue={content['howitworks.hero.title']}
                            isEditing={isEditing}
                            as={motion.h1}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-6xl md:text-8xl font-serif font-light tracking-tight text-foreground mb-6"
                        />

                        <EditableContent
                            contentKey="howitworks.hero.description"
                            initialValue={content['howitworks.hero.description']}
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
                                asChild
                                size="lg"
                                className="group border-border/50 hover:border-gold hover:bg-gold/5 transition-all duration-300"
                            >
                                <Link href="#steps" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                    Explore Our Process
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
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

            {/* Steps Section */}
            <section id="steps" className="py-24 md:py-32 bg-background">
                <div className="container px-4 md:px-6">
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
                            <Shield className="h-4 w-4" />
                            Our Process
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
                            Seamless From Start to Finish
                        </h2>
                        <p className="text-xl text-muted-foreground font-light">
                            Every step is designed to make your event planning effortless and elegant.
                        </p>
                    </motion.div>

                    <EditableList
                        contentKey="howitworks.steps.list"
                        items={steps}
                        isEditing={isEditing}
                        itemSchema={{
                            title: { type: 'text', label: 'Title', placeholder: 'Step Title' },
                            description: { type: 'textarea', label: 'Description', placeholder: 'Step Description' },
                            image: { type: 'text', label: 'Image URL', placeholder: '/images/example.jpg' },
                            details: { type: 'array', label: 'Key Details', placeholder: 'Detail 1\nDetail 2\nDetail 3' }
                        }}
                        renderItem={(step: any, index: number) => (
                            <StepCard
                                key={index}
                                step={step}
                                index={index}
                            />
                        )}
                    />
                </div>
            </section>

            {/* Concierge Service */}
            <section className="py-24 md:py-32 bg-gradient-to-br from-gold via-gold to-gold/90 text-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                <div className="container px-4 md:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/10 border border-black/20 text-black text-sm font-medium mb-8"
                        >
                            <Sparkles className="h-4 w-4" />
                            Premium Service
                        </motion.div>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-8"
                        >
                            <EditableContent
                                contentKey="howitworks.concierge.title"
                                initialValue={content['howitworks.concierge.title']}
                                isEditing={isEditing}
                                as="h2"
                                className="text-4xl md:text-6xl font-serif font-light"
                            />
                            <EditableContent
                                contentKey="howitworks.concierge.description"
                                initialValue={content['howitworks.concierge.description']}
                                type="textarea"
                                isEditing={isEditing}
                                as="p"
                                className="text-black/80 text-xl leading-relaxed font-light"
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <Button asChild size="lg" className="mt-4 bg-black text-white hover:bg-black/80 h-14 text-lg rounded-full px-8 border-2 border-transparent hover:border-black/20 transition-all duration-300">
                                    <Link href="/contact">
                                        <EditableContent
                                            contentKey="howitworks.concierge.button"
                                            initialValue={content['howitworks.concierge.button']}
                                            isEditing={isEditing}
                                            as="span"
                                        />
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="bg-black/5 p-10 rounded-xl backdrop-blur-sm border border-black/10 shadow-2xl"
                        >
                            <EditableContent
                                contentKey="howitworks.concierge.list.title"
                                initialValue={content['howitworks.concierge.list.title']}
                                isEditing={isEditing}
                                as="h3"
                                className="text-2xl font-serif mb-8 text-black"
                            />
                            <ul className="space-y-6">
                                <motion.li
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    className="flex items-center gap-4"
                                >
                                    <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center shrink-0 font-serif font-bold text-black shadow-lg">1</div>
                                    <EditableContent
                                        contentKey="howitworks.concierge.list.item1"
                                        initialValue={content['howitworks.concierge.list.item1']}
                                        isEditing={isEditing}
                                        as="span"
                                        className="text-lg font-light text-black/80"
                                    />
                                </motion.li>
                                <motion.li
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.7 }}
                                    className="flex items-center gap-4"
                                >
                                    <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center shrink-0 font-serif font-bold text-black shadow-lg">2</div>
                                    <EditableContent
                                        contentKey="howitworks.concierge.list.item2"
                                        initialValue={content['howitworks.concierge.list.item2']}
                                        isEditing={isEditing}
                                        as="span"
                                        className="text-lg font-light text-black/80"
                                    />
                                </motion.li>
                                <motion.li
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.8 }}
                                    className="flex items-center gap-4"
                                >
                                    <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center shrink-0 font-serif font-bold text-black shadow-lg">3</div>
                                    <EditableContent
                                        contentKey="howitworks.concierge.list.item3"
                                        initialValue={content['howitworks.concierge.list.item3']}
                                        isEditing={isEditing}
                                        as="span"
                                        className="text-lg font-light text-black/80"
                                    />
                                </motion.li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Preview */}
            <section className="py-24 md:py-32 bg-secondary/20 border-t border-border/40">
                <div className="container px-4 md:px-6 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-8"
                        >
                            <Shield className="h-4 w-4" />
                            Common Questions
                        </motion.div>
                        <EditableContent
                            contentKey="howitworks.faq.title"
                            initialValue={content['howitworks.faq.title']}
                            isEditing={isEditing}
                            as="h2"
                            className="text-4xl md:text-5xl font-serif mb-6 text-foreground"
                        />
                        <EditableContent
                            contentKey="howitworks.faq.description"
                            initialValue={content['howitworks.faq.description']}
                            type="textarea"
                            isEditing={isEditing}
                            as="p"
                            className="text-xl text-muted-foreground font-light leading-relaxed"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="space-y-6"
                    >
                        <EditableList
                            contentKey="howitworks.faq.list"
                            items={faqs}
                            isEditing={isEditing}
                            itemSchema={{
                                question: { type: 'text', label: 'Question', placeholder: 'Enter question' },
                                answer: { type: 'textarea', label: 'Answer', placeholder: 'Enter answer' }
                            }}
                            renderItem={(faq: any, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <Accordion type="single" collapsible className="w-full" key={index}>
                                        <AccordionItem value={`item-${index}`} className="border border-border/40 rounded-xl px-6 bg-background/50 backdrop-blur-sm shadow-lg hover:shadow-gold/5 data-[state=open]:border-gold/30 transition-all duration-300">
                                            <AccordionTrigger className="text-lg md:text-xl font-medium hover:text-gold transition-colors py-8 text-left">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground text-base md:text-lg leading-relaxed pb-8 font-light">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </motion.div>
                            )}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="mt-20 text-center"
                    >
                        <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full border-border/50 hover:border-gold hover:bg-gold/5 hover:text-gold transition-all duration-300 shadow-lg hover:shadow-gold/10">
                            <Link href="/faq">
                                <EditableContent
                                    contentKey="howitworks.faq.button"
                                    initialValue={content['howitworks.faq.button']}
                                    isEditing={isEditing}
                                    as="span"
                                    className="text-base font-medium"
                                />
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>
        </>
    )
}

// Step Card Component
function StepCard({ step, index }: { step: any, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className={`grid lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-24 ${
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
                    {step.image && (
                        <Image
                            src={step.image}
                            alt={step.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    )}
                    <div className="absolute inset-0 border-2 border-white/10 m-4 rounded-lg pointer-events-none group-hover:border-gold/30 transition-colors duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Step Number Overlay */}
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.5, type: "spring" }}
                    className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-gold text-black flex items-center justify-center text-2xl font-serif font-bold shadow-xl shadow-gold/25"
                >
                    {index + 1}
                </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, x: index % 2 === 1 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 + 0.4 }}
                className="space-y-8"
            >
                <div>
                    <h3 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
                        {step.title}
                    </h3>
                    <p className="text-muted-foreground text-xl leading-relaxed font-light">
                        {step.description}
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.6 }}
                    className="bg-secondary/30 p-8 rounded-lg border border-border/40 hover:border-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5"
                >
                    <h4 className="font-medium mb-6 flex items-center gap-3 text-lg text-foreground">
                        <CheckCircle2 className="h-6 w-6 text-gold" />
                        Key Details
                    </h4>
                    <ul className="space-y-4">
                        {(step.details || []).map((detail: string, idx: number) => (
                            <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.2 + 0.7 + idx * 0.1 }}
                                className="text-muted-foreground text-base flex items-start gap-3"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2.5 shrink-0" />
                                {detail}
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

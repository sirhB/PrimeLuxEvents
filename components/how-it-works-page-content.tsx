"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, ArrowRight, Sparkles, Clock, Shield, Search, MousePointerClick, CalendarCheck, PartyPopper } from "lucide-react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef } from "react"
import { EditableContent } from "@/components/admin/editable-content"
import { EditableList } from "@/components/admin/editable-list"
import { cn } from "@/lib/utils"

interface HowItWorksPageContentProps {
    content: any
    isEditing?: boolean
}

export function HowItWorksPageContent({ content, isEditing = false }: HowItWorksPageContentProps) {
    const steps = content['howitworks.steps.list'] || []
    const faqs = content['howitworks.faq.list'] || []

    // Hardcoded images for a premium feel as per the new design
    const processImages = [
        "/images/luxury_furniture_collection_1767781427931.png",
        "/images/luxury_selection_interface_1767781469895.png",
        "/images/luxury-event-hero.png", // Use hero as a high-quality fallback for Step 3
        "/images/luxury_event_setup_celebration_1767781442112.png"
    ]

    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    return (
        <div ref={containerRef} className="bg-[#1A1A1A] text-white selection:bg-gold selection:text-black">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('/images/luxury-texture.png')] opacity-10 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[#1A1A1A]" />
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.3, scale: 1 }}
                        transition={{ duration: 2 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src="/images/luxury_event_setup_celebration_1767781442112.png"
                            alt="Luxury Event Background"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
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
                            Premium Experience
                        </motion.div>

                        <div className="relative mb-8">
                            <EditableContent
                                contentKey="howitworks.hero.title"
                                initialValue={content['howitworks.hero.title']}
                                isEditing={isEditing}
                                as={motion.h1}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-white mb-6 leading-[0.9]"
                            />
                        </div>

                        <EditableContent
                            contentKey="howitworks.hero.description"
                            initialValue={content['howitworks.hero.description']}
                            type="textarea"
                            isEditing={isEditing}
                            as={motion.p}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto mb-16"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
                        >
                            <Link
                                href="#steps"
                                className="group relative h-16 inline-flex items-center justify-center px-12 overflow-hidden rounded-full bg-gold text-black text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:scale-105"
                            >
                                <span className="relative z-10">Explore Our Process</span>
                                <div className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 group-hover:translate-x-0" />
                            </Link>
                        </motion.div>
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
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold/60">Scroll to Begin</span>
                        <div className="w-px h-20 bg-gradient-to-b from-gold/60 to-transparent" />
                    </div>
                </motion.div>
            </section>

            {/* Steps Section */}
            <section id="steps" className="relative py-24 md:py-48 overflow-hidden">
                <div className="absolute top-0 left-1/2 w-px h-full bg-white/5 -translate-x-1/2 z-0" />
                <motion.div
                    style={{ scaleY: scrollYProgress }}
                    className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-gold via-gold to-transparent -translate-x-1/2 z-0 origin-top"
                />

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-3xl mx-auto mb-32 md:mb-56"
                    >
                        <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">The Journey</span>
                        <h2 className="text-4xl md:text-7xl font-serif font-light text-white mb-8 tracking-tighter">
                            A Seamless Path to Luxury
                        </h2>
                        <p className="text-xl text-gray-400 font-light leading-relaxed">
                            Every step of our process is meticulously crafted to ensure your event planning is as elegant as the celebration itself.
                        </p>
                    </motion.div>

                    <div className="space-y-32 md:space-y-64">
                        {steps.map((step: any, index: number) => (
                            <StepCard
                                key={index}
                                step={{
                                    ...step,
                                    image: processImages[index] || step.image
                                }}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Concierge Service */}
            <section className="py-24 md:py-48 bg-[#151515] relative overflow-hidden border-t border-white/5">
                <div className="absolute inset-0 bg-[url('/images/luxury-texture.png')] opacity-5 mix-blend-overlay" />
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative aspect-[4/5] overflow-hidden rounded-2xl"
                        >
                            <Image
                                src="/images/premium_concierge_service_1767781456386.png"
                                alt="Concierge Service"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-12 left-12">
                                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Personalized Support</span>
                                <h3 className="text-3xl font-serif font-light text-white tracking-tight">Dedicated Consultation</h3>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-12"
                        >
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-[0.3em]"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    The Signature Service
                                </motion.div>
                                <EditableContent
                                    contentKey="howitworks.concierge.title"
                                    initialValue={content['howitworks.concierge.title']}
                                    isEditing={isEditing}
                                    as="h2"
                                    className="text-4xl md:text-6xl font-serif font-light text-white tracking-tighter leading-tight"
                                />
                                <EditableContent
                                    contentKey="howitworks.concierge.description"
                                    initialValue={content['howitworks.concierge.description']}
                                    type="textarea"
                                    isEditing={isEditing}
                                    as="p"
                                    className="text-gray-400 text-xl leading-relaxed font-light"
                                />
                            </div>

                            <div className="glass-card p-10 rounded-2xl border border-white/5 space-y-8">
                                <EditableContent
                                    contentKey="howitworks.concierge.list.title"
                                    initialValue={content['howitworks.concierge.list.title']}
                                    isEditing={isEditing}
                                    as="h3"
                                    className="text-xl font-serif text-white tracking-tight"
                                />
                                <ul className="space-y-8">
                                    {[1, 2, 3].map((num) => (
                                        <motion.li
                                            key={num}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: num * 0.1 }}
                                            className="flex items-start gap-6 group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gold font-serif text-lg group-hover:bg-gold group-hover:text-black transition-all duration-500">
                                                0{num}
                                            </div>
                                            <EditableContent
                                                contentKey={`howitworks.concierge.list.item${num}`}
                                                initialValue={content[`howitworks.concierge.list.item${num}`]}
                                                isEditing={isEditing}
                                                as="span"
                                                className="text-lg font-light text-gray-300 mt-2 block"
                                            />
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <Button asChild size="lg" className="h-16 px-12 rounded-full bg-gold text-black hover:bg-white transition-all duration-500 text-[11px] font-bold uppercase tracking-[0.2em]">
                                <Link href="/contact" className="flex items-center gap-3">
                                    <EditableContent
                                        contentKey="howitworks.concierge.button"
                                        initialValue={content['howitworks.concierge.button']}
                                        isEditing={isEditing}
                                        as="span"
                                    />
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 md:py-48 bg-[#1A1A1A] relative overflow-hidden">
                <div className="container px-4 md:px-6 max-w-4xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-24"
                    >
                        <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Assistance</span>
                        <EditableContent
                            contentKey="howitworks.faq.title"
                            initialValue={content['howitworks.faq.title']}
                            isEditing={isEditing}
                            as="h2"
                            className="text-4xl md:text-7xl font-serif font-light text-white mb-8 tracking-tighter"
                        />
                        <EditableContent
                            contentKey="howitworks.faq.description"
                            initialValue={content['howitworks.faq.description']}
                            type="textarea"
                            isEditing={isEditing}
                            as="p"
                            className="text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto"
                        />
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq: any, index: number) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value={`item-${index}`} className="border-b border-white/5 last:border-0">
                                        <AccordionTrigger className="text-xl md:text-2xl font-serif font-light text-white hover:text-gold transition-colors py-8 text-left uppercase tracking-tight">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-gray-400 text-lg leading-relaxed pb-8 font-light max-w-2xl">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="mt-24 text-center"
                    >
                        <Link
                            href="/faq"
                            className="group inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] text-white hover:text-gold transition-colors"
                        >
                            <EditableContent
                                contentKey="howitworks.faq.button"
                                initialValue={content['howitworks.faq.button']}
                                isEditing={isEditing}
                                as="span"
                            />
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-gold group-hover:translate-x-2 transition-all duration-500">
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

function StepCard({ step, index }: { step: any, index: number }) {
    const isEven = index % 2 === 0

    return (
        <div className={cn(
            "grid lg:grid-cols-2 gap-16 md:gap-32 items-center",
            !isEven && "lg:flex-row-reverse"
        )}>
            {/* Image Side */}
            <motion.div
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                    "relative aspect-[4/5] rounded-3xl overflow-hidden group shadow-2xl",
                    !isEven && "lg:order-2"
                )}
            >
                <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />

                {/* Step Number Badge */}
                <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-[#1A1A1A]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-gold font-serif text-2xl z-20">
                    0{index + 1}
                </div>
            </motion.div>

            {/* Content Side */}
            <motion.div
                initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className={cn(
                    "flex flex-col gap-8",
                    !isEven && "lg:order-1"
                )}
            >
                <div className="space-y-6">
                    <h3 className="text-4xl md:text-6xl font-serif font-light text-white tracking-tighter leading-tight uppercase">
                        {step.title}
                    </h3>
                    <p className="text-gray-400 text-xl leading-relaxed font-light">
                        {step.description}
                    </p>
                </div>

                {step.details && (
                    <div className="glass-card p-10 rounded-2xl border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 text-gold">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Key Details</span>
                        </div>
                        <ul className="grid gap-4">
                            {step.details.map((detail: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-4 text-gray-300 font-light">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold/60 mt-2 shrink-0" />
                                    <span className="text-lg">{detail}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </motion.div>
        </div>
    )
}


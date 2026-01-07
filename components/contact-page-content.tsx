"use client"

import { MapPin, Phone, Mail, Sparkles } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import { motion } from "framer-motion"
import { EditableContent } from "@/components/admin/editable-content"
import { NonEditableOverlay } from "@/components/admin/non-editable-overlay"

interface ContactPageContentProps {
    content: any
    isEditing?: boolean
}

export function ContactPageContent({ content, isEditing = false }: ContactPageContentProps) {
    return (
        <section className="py-24 md:py-40 bg-[#FDFBF7] min-h-screen relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-gold/50 to-transparent" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-start">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-16"
                    >
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Get in Touch</span>
                                <span className="w-12 h-px bg-gold/30" />
                            </div>
                            <h1 className="text-5xl md:text-8xl font-serif font-light tracking-tighter text-gray-900 leading-[0.9]">
                                Request a <br />
                                <span className="italic text-gold">Consultation</span>
                            </h1>
                            <EditableContent
                                contentKey="contact.hero.description"
                                initialValue={content['contact.hero.description']}
                                type="textarea"
                                isEditing={isEditing}
                                as="p"
                                className="text-lg text-gray-500 max-w-md font-light leading-relaxed"
                            />
                        </div>

                        <div className="space-y-12">
                            <div className="flex items-start gap-8 group">
                                <div className="h-16 w-16 rounded-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex items-center justify-center shrink-0 border border-border/5 group-hover:scale-110 transition-all duration-500">
                                    <MapPin className="h-6 w-6 text-gold stroke-[1.5]" />
                                </div>
                                <div>
                                    <EditableContent
                                        contentKey="contact.info.address.title"
                                        initialValue={content['contact.info.address.title']}
                                        isEditing={isEditing}
                                        as="h3"
                                        className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-3"
                                    />
                                    <EditableContent
                                        contentKey="contact.info.address.value"
                                        initialValue={content['contact.info.address.value']}
                                        type="textarea"
                                        isEditing={isEditing}
                                        as="p"
                                        className="text-gray-900 text-xl font-serif font-light leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-8 group">
                                <div className="h-16 w-16 rounded-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex items-center justify-center shrink-0 border border-border/5 group-hover:scale-110 transition-all duration-500">
                                    <Phone className="h-6 w-6 text-gold stroke-[1.5]" />
                                </div>
                                <div>
                                    <EditableContent
                                        contentKey="contact.info.phone.title"
                                        initialValue={content['contact.info.phone.title']}
                                        isEditing={isEditing}
                                        as="h3"
                                        className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-3"
                                    />
                                    <EditableContent
                                        contentKey="contact.info.phone.value"
                                        initialValue={content['contact.info.phone.value']}
                                        isEditing={isEditing}
                                        as="p"
                                        className="text-gray-900 text-xl font-serif font-light leading-relaxed"
                                    />
                                    <EditableContent
                                        contentKey="contact.info.phone.hours"
                                        initialValue={content['contact.info.phone.hours']}
                                        isEditing={isEditing}
                                        as="p"
                                        className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2"
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-8 group">
                                <div className="h-16 w-16 rounded-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex items-center justify-center shrink-0 border border-border/5 group-hover:scale-110 transition-all duration-500">
                                    <Mail className="h-6 w-6 text-gold stroke-[1.5]" />
                                </div>
                                <div>
                                    <EditableContent
                                        contentKey="contact.info.email.title"
                                        initialValue={content['contact.info.email.title']}
                                        isEditing={isEditing}
                                        as="h3"
                                        className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-3"
                                    />
                                    <EditableContent
                                        contentKey="contact.info.email.value"
                                        initialValue={content['contact.info.email.value']}
                                        isEditing={isEditing}
                                        as="p"
                                        className="text-gray-900 text-xl font-serif font-light leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>

                        <NonEditableOverlay isEditing={isEditing} message="Map configuration is managed in settings">
                            <div className="h-80 w-full bg-white rounded-[2rem] overflow-hidden relative border border-border/5 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
                                {/* Map Placeholder */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50">
                                    <Sparkles className="w-12 h-12 text-gold/20 mb-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">Interactive Map View</span>
                                </div>
                            </div>
                        </NonEditableOverlay>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white p-10 md:p-16 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-border/5 relative"
                    >
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gold rounded-full flex items-center justify-center shadow-xl">
                            <Sparkles className="w-10 h-10 text-black" />
                        </div>

                        <EditableContent
                            contentKey="contact.form.title"
                            initialValue={content['contact.form.title']}
                            isEditing={isEditing}
                            as="h2"
                            className="text-4xl font-serif font-bold mb-10 text-gray-900 tracking-tight"
                        />
                        <NonEditableOverlay isEditing={isEditing} message="Contact form fields are managed in settings">
                            <ContactForm />
                        </NonEditableOverlay>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

"use client"

import { MapPin, Phone, Mail } from "lucide-react"
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
        <section className="py-24 md:py-32 bg-background min-h-screen">
            <div className="container px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-12"
                    >
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-foreground">Request a Consultation</h1>
                            <EditableContent
                                contentKey="contact.hero.description"
                                initialValue={content['contact.hero.description']}
                                type="textarea"
                                isEditing={isEditing}
                                as="p"
                                className="text-xl text-muted-foreground max-w-md font-light leading-relaxed"
                            />
                        </div>

                        <div className="space-y-10">
                            <div className="flex items-start gap-6 group">
                                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50 group-hover:border-gold/50 transition-colors">
                                    <MapPin className="h-5 w-5 text-foreground group-hover:text-gold transition-colors" />
                                </div>
                                <div>
                                    <EditableContent
                                        contentKey="contact.info.address.title"
                                        initialValue={content['contact.info.address.title']}
                                        isEditing={isEditing}
                                        as="h3"
                                        className="font-serif text-xl mb-2"
                                    />
                                    <EditableContent
                                        contentKey="contact.info.address.value"
                                        initialValue={content['contact.info.address.value']}
                                        type="textarea"
                                        isEditing={isEditing}
                                        as="p"
                                        className="text-muted-foreground whitespace-pre-line text-lg font-light"
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50 group-hover:border-gold/50 transition-colors">
                                    <Phone className="h-5 w-5 text-foreground group-hover:text-gold transition-colors" />
                                </div>
                                <div>
                                    <EditableContent
                                        contentKey="contact.info.phone.title"
                                        initialValue={content['contact.info.phone.title']}
                                        isEditing={isEditing}
                                        as="h3"
                                        className="font-serif text-xl mb-2"
                                    />
                                    <EditableContent
                                        contentKey="contact.info.phone.value"
                                        initialValue={content['contact.info.phone.value']}
                                        isEditing={isEditing}
                                        as="p"
                                        className="text-muted-foreground text-lg font-light"
                                    />
                                    <EditableContent
                                        contentKey="contact.info.phone.hours"
                                        initialValue={content['contact.info.phone.hours']}
                                        isEditing={isEditing}
                                        as="p"
                                        className="text-sm text-muted-foreground mt-1"
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50 group-hover:border-gold/50 transition-colors">
                                    <Mail className="h-5 w-5 text-foreground group-hover:text-gold transition-colors" />
                                </div>
                                <div>
                                    <EditableContent
                                        contentKey="contact.info.email.title"
                                        initialValue={content['contact.info.email.title']}
                                        isEditing={isEditing}
                                        as="h3"
                                        className="font-serif text-xl mb-2"
                                    />
                                    <EditableContent
                                        contentKey="contact.info.email.value"
                                        initialValue={content['contact.info.email.value']}
                                        isEditing={isEditing}
                                        as="p"
                                        className="text-muted-foreground text-lg font-light"
                                    />
                                </div>
                            </div>
                        </div>

                        <NonEditableOverlay isEditing={isEditing} message="Map configuration is managed in settings">
                            <div className="h-64 w-full bg-secondary rounded-sm overflow-hidden relative border border-border/50">
                                {/* Map Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center bg-muted-foreground/5">
                                    <span className="text-muted-foreground font-medium uppercase tracking-widest">Map View</span>
                                </div>
                            </div>
                        </NonEditableOverlay>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white p-8 md:p-12 rounded-sm border border-border shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <EditableContent
                            contentKey="contact.form.title"
                            initialValue={content['contact.form.title']}
                            isEditing={isEditing}
                            as="h2"
                            className="text-3xl font-serif mb-8 text-foreground"
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

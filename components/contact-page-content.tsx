"use client"

import { MapPin, Phone, Mail, Sparkles, Clock, ArrowRight, Calendar } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import { motion } from "framer-motion"
import Link from "next/link"
import { EditableContent } from "@/components/admin/editable-content"
import { NonEditableOverlay } from "@/components/admin/non-editable-overlay"
import { cn } from "@/lib/utils"

interface ContactPageContentProps {
    content: any
    settings?: any
    isEditing?: boolean
}

export function ContactPageContent({ content, settings = {}, isEditing = false }: ContactPageContentProps) {
    // Map settings to content if settings exist, otherwise use content table values
    const addressValue = settings.company_address || content['contact.info.address.value']
    const emailValue = settings.company_email || content['contact.info.email.value']
    const phoneValue = settings.company_phone || content['contact.info.phone.value']
    return (
        <section className="pt-32 pb-24 md:pt-48 md:pb-40 bg-[#1A1A1A] min-h-screen relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gold/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('/images/luxury-texture.png')] opacity-5 mix-blend-overlay pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-start">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-20"
                    >
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Connect With Us</span>
                                <span className="w-12 h-px bg-gold/30" />
                            </div>
                            <h1 className="text-6xl md:text-9xl font-serif font-light tracking-tighter text-white leading-[0.85] mb-8">
                                Concierge <br />
                                <span className="italic text-gold">Inquiry</span>
                            </h1>
                            <EditableContent
                                contentKey="contact.hero.description"
                                initialValue={content['contact.hero.description']}
                                type="textarea"
                                isEditing={isEditing}
                                as="p"
                                className="text-xl text-gray-400 max-w-md font-light leading-relaxed"
                            />
                        </div>

                        <div className="space-y-16">
                            <ContactInfoItem
                                icon={MapPin}
                                titleKey="contact.info.address.title"
                                value={addressValue}
                                contentKey={isEditing ? "contact.info.address.value" : undefined}
                                subtitleKey="contact.info.address.hours"
                                content={content}
                                isEditing={isEditing}
                            />
                            <ContactInfoItem
                                icon={Phone}
                                titleKey="contact.info.phone.title"
                                value={phoneValue}
                                contentKey={isEditing ? "contact.info.phone.value" : undefined}
                                subtitleKey="contact.info.phone.hours"
                                content={content}
                                isEditing={isEditing}
                            />
                            <ContactInfoItem
                                icon={Mail}
                                titleKey="contact.info.email.title"
                                value={emailValue}
                                contentKey={isEditing ? "contact.info.email.value" : undefined}
                                content={content}
                                isEditing={isEditing}
                            />
                        </div>

                        <div className="pt-12 border-t border-white/5">
                            <div className="flex items-center gap-4 text-gray-400">
                                <Clock className="w-5 h-5 text-gold" />
                                <span className="text-sm font-light tracking-wide">Typical response within 4 business hours</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form Container */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-br from-gold/20 to-transparent blur-2xl opacity-20" />
                        <div className="relative glass-card bg-[#1E1E1E] p-10 md:p-16 rounded-[2rem] border border-white/5 shadow-2xl">
                            <div className="flex items-center justify-between mb-12">
                                <EditableContent
                                    contentKey="contact.form.title"
                                    initialValue={content['contact.form.title']}
                                    isEditing={isEditing}
                                    as="h2"
                                    className="text-3xl md:text-4xl font-serif font-light text-white tracking-tight"
                                />
                                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-gold" />
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm font-light mb-10 -mt-8 max-w-sm">
                                To schedule a showroom viewing or discuss your event in detail, please provide your information below.
                            </p>

                            <NonEditableOverlay isEditing={isEditing} message="Contact form fields are managed in settings">
                                <div className="contact-form-dark">
                                    <ContactForm />
                                </div>
                            </NonEditableOverlay>
                        </div>

                        {/* Social Links or additional info */}
                        <div className="mt-12 flex justify-between items-center px-4">
                            <div className="flex gap-8">
                                {['Instagram', 'Pinterest', 'LinkedIn'].map((social) => (
                                    <Link key={social} href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-gold transition-colors">
                                        {social}
                                    </Link>
                                ))}
                            </div>
                            <div className="w-px h-8 bg-white/5" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

function ContactInfoItem({ icon: Icon, titleKey, valueKey, value, contentKey, subtitleKey, content, isEditing }: any) {
    return (
        <div className="flex items-start gap-10 group">
            <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-gold group-hover:border-gold transition-all duration-500 group-hover:translate-x-2">
                <Icon className="h-8 w-8 text-gold group-hover:text-black transition-colors duration-500 stroke-[1.2]" />
            </div>
            <div className="space-y-3 pt-2">
                <EditableContent
                    contentKey={titleKey}
                    initialValue={content[titleKey]}
                    isEditing={isEditing}
                    as="h3"
                    className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold/60"
                />
                {isEditing ? (
                    <EditableContent
                        contentKey={contentKey || valueKey}
                        initialValue={value || content[valueKey]}
                        type="textarea"
                        isEditing={isEditing}
                        as="p"
                        className="text-white text-2xl font-serif font-light leading-snug group-hover:text-gold transition-colors duration-300"
                    />
                ) : (
                    <p className="text-white text-2xl font-serif font-light leading-snug group-hover:text-gold transition-colors duration-300 whitespace-pre-line">
                        {value}
                    </p>
                )}
                {subtitleKey && (
                    <div className="flex items-center gap-2 mt-2">
                        {content[subtitleKey] === 'By Appointment Only' && (
                            <Calendar className="w-3 h-3 text-gold" />
                        )}
                        <EditableContent
                            contentKey={subtitleKey}
                            initialValue={content[subtitleKey]}
                            isEditing={isEditing}
                            as="p"
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-widest",
                                content[subtitleKey] === 'By Appointment Only' ? "text-gold" : "text-gray-500"
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}


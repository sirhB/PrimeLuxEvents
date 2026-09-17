"use client"

import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import { motion } from "framer-motion"
import { EditableContent } from "@/components/admin/editable-content"
import { NonEditableOverlay } from "@/components/admin/non-editable-overlay"
import { COMPANY } from "@/lib/company"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

interface ContactPageContentProps {
    content: any
    settings?: any
    isEditing?: boolean
}

export function ContactPageContent({ content, settings = {}, isEditing = false }: ContactPageContentProps) {
    const addressValue = settings.company_address || content['contact.info.address.value'] || COMPANY.address
    const emailValue = settings.company_email || content['contact.info.email.value'] || COMPANY.email
    const phoneValue = settings.company_phone || content['contact.info.phone.value'] || COMPANY.phone
    const reduceMotion = usePrefersReducedMotion()

    return (
        <section className="page-shell pt-28 pb-20 md:pt-36 md:pb-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-14 lg:gap-24 items-start">
                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.5 }}
                        className="space-y-14"
                    >
                        <div className="space-y-6">
                            <p className="lux-label">Connect with us</p>
                            <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tighter text-foreground leading-[0.95]">
                                Concierge <span className="italic text-gold">inquiry</span>
                            </h1>
                            <EditableContent
                                contentKey="contact.hero.description"
                                initialValue={content['contact.hero.description'] || 'Schedule a showroom visit or ask about rentals for your event in Connecticut, Rhode Island, or Massachusetts.'}
                                isEditing={isEditing}
                                as="p"
                                className="text-muted-foreground text-lg font-light leading-relaxed max-w-md"
                            />
                        </div>

                        <div className="space-y-8">
                            <ContactInfoItem icon={MapPin} title="Showroom" value={addressValue} />
                            <ContactInfoItem icon={Phone} title="Call" value={phoneValue} href={`tel:${String(phoneValue).replace(/\D/g, '')}`} />
                            <ContactInfoItem icon={Mail} title="Email" value={emailValue} href={`mailto:${emailValue}`} />
                            <ContactInfoItem icon={Clock} title="Hours" value={content['contact.info.hours.value'] || 'By appointment'} />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.1 }}
                    >
                        <div className="surface-panel rounded-md p-8 md:p-12">
                            <h2 className="text-2xl md:text-3xl font-serif font-light text-foreground tracking-tight mb-3">
                                {content['contact.form.title'] || 'Tell us about your event'}
                            </h2>
                            <p className="text-muted-foreground text-sm font-light mb-10 max-w-sm">
                                Share a few details and we&apos;ll follow up about availability, delivery, or a showroom visit.
                            </p>
                            <NonEditableOverlay isEditing={isEditing} message="Contact form fields are managed in settings">
                                <ContactForm />
                            </NonEditableOverlay>
                        </div>

                        <div className="mt-8">
                            <a
                                href={COMPANY.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-gold transition-colors inline-flex items-center gap-2"
                            >
                                Instagram <ArrowRight className="h-3 w-3" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

function ContactInfoItem({ icon: Icon, title, value, href }: { icon: any; title: string; value: string; href?: string }) {
    const content = href ? (
        <a href={href} className="text-foreground hover:text-gold transition-colors font-light">
            {value}
        </a>
    ) : (
        <span className="text-foreground font-light whitespace-pre-line">{value}</span>
    )

    return (
        <div className="flex items-start gap-5 group">
            <div className="h-12 w-12 rounded-[var(--radius)] bg-[var(--surface-elevated)] border border-border flex items-center justify-center shrink-0 group-hover:border-gold/40 transition-colors">
                <Icon className="h-5 w-5 text-gold stroke-[1.5]" />
            </div>
            <div className="space-y-1 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
                {content}
            </div>
        </div>
    )
}

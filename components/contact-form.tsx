"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { submitConsultationRequest } from "@/app/actions/submit-consultation"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"

export function ContactForm() {
    const formRef = useRef<HTMLFormElement>(null)
    const [hasVenue, setHasVenue] = useState<string>("")
    const [hasCaterer, setHasCaterer] = useState<string>("")
    const [hasPlanner, setHasPlanner] = useState<string>("")
    const [budgetRange, setBudgetRange] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [validationErrors, setValidationErrors] = useState<string[]>([])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitMessage(null)
        setValidationErrors([])

        const formElement = e.currentTarget || formRef.current
        if (!formElement) {
            setIsSubmitting(false)
            return
        }

        const formData = new FormData(formElement)

        const firstName = (formData.get('first-name') as string)?.trim()
        const lastName = (formData.get('last-name') as string)?.trim()
        const email = (formData.get('email') as string)?.trim()
        const phone = (formData.get('phone') as string)?.trim()
        const message = (formData.get('message') as string)?.trim()
        const errors: string[] = []

        if (!firstName) errors.push('First name is required.')
        if (!lastName) errors.push('Last name is required.')
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email is required.')
        if (!phone) errors.push('Phone number is required.')
        if (!message) errors.push('Please share a short message about your event.')

        if (errors.length > 0) {
            setValidationErrors(errors)
            setIsSubmitting(false)
            return
        }

        const eventDateValue = formData.get('event-date') as string
        const eventDate = eventDateValue && eventDateValue.trim() ? eventDateValue : null

        const consultationData = {
            first_name: firstName,
            last_name: lastName,
            customer_name: `${firstName} ${lastName}`.trim(),
            customer_email: email,
            customer_phone: phone,
            event_date: eventDate,
            number_of_guests: (() => {
                const guestValue = formData.get('guests') as string
                if (!guestValue) return null
                const parsed = parseInt(guestValue, 10)
                return Number.isFinite(parsed) && parsed > 0 ? parsed : null
            })(),
            budget_range: budgetRange || null,
            has_venue: hasVenue === 'yes',
            venue_name: hasVenue === 'yes' ? (formData.get('venue') as string)?.trim() || null : null,
            has_caterer: hasCaterer === 'yes',
            caterer_name: hasCaterer === 'yes' ? (formData.get('caterer') as string)?.trim() || null : null,
            has_planner: hasPlanner === 'yes',
            planner_name: hasPlanner === 'yes' ? (formData.get('planner') as string)?.trim() || null : null,
            message,
            status: 'new_request' as const,
        }

        try {
            const result = await submitConsultationRequest(consultationData)
            if (!result.success) {
                throw new Error(result.error || 'Failed to submit request')
            }

            setSubmitMessage({
                type: 'success',
                text: 'Thank you! Your consultation request has been submitted. We\'ll be in touch soon!'
            })

            if (formElement) formElement.reset()
            setHasVenue('')
            setHasCaterer('')
            setHasPlanner('')
            setBudgetRange('')

            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 100)
        } catch (error) {
            console.error('Error submitting consultation:', error)
            setSubmitMessage({
                type: 'error',
                text: 'Sorry, there was an error submitting your request. Please try again.'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const inputClasses = "bg-transparent border-0 border-b border-gray-200 rounded-none px-0 h-12 focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-gray-300 font-light"
    const labelClasses = "text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400"

    return (
        <motion.form
            ref={formRef as React.RefObject<HTMLFormElement>}
            className="space-y-10"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <AnimatePresence>
                {submitMessage && (
                    <motion.div
                        key={submitMessage.type}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-6 rounded-2xl flex items-center gap-4 ${submitMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}
                    >
                        {submitMessage.type === 'success' ? <CheckCircle2 className="h-6 w-6 shrink-0" /> : <AlertCircle className="h-6 w-6 shrink-0" />}
                        <p className="text-sm font-medium">{submitMessage.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {validationErrors.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6 rounded-2xl border border-red-100 bg-red-50 text-red-800 space-y-2"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Please correct the following:</span>
                        </div>
                        <ul className="space-y-1 text-sm font-light">
                            {validationErrors.map((err) => (
                                <li key={err}>• {err}</li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid sm:grid-cols-2 gap-10">
                <div className="space-y-2">
                    <Label htmlFor="first-name" className={labelClasses}>First name *</Label>
                    <Input id="first-name" name="first-name" placeholder="E.g. Isabella" required className={inputClasses} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last-name" className={labelClasses}>Last name *</Label>
                    <Input id="last-name" name="last-name" placeholder="E.g. Rossi" required className={inputClasses} />
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-10">
                <div className="space-y-2">
                    <Label htmlFor="email" className={labelClasses}>Email Address *</Label>
                    <Input id="email" name="email" placeholder="isabella@example.com" type="email" required className={inputClasses} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone" className={labelClasses}>Phone Number *</Label>
                    <Input id="phone" name="phone" placeholder="(555) 000-0000" type="tel" required className={inputClasses} />
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-10">
                <div className="space-y-2">
                    <Label htmlFor="event-date" className={labelClasses}>Event Date</Label>
                    <Input id="event-date" name="event-date" type="date" className={inputClasses} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="guests" className={labelClasses}>Number of Guests</Label>
                    <Input id="guests" name="guests" type="number" placeholder="e.g. 150" min="1" className={inputClasses} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="budget" className={labelClasses}>Estimated Budget</Label>
                <Select value={budgetRange} onValueChange={setBudgetRange}>
                    <SelectTrigger id="budget" className={inputClasses}>
                        <SelectValue placeholder="Select a budget range" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#FDFBF7] border-border/10">
                        <SelectItem value="under-1000">Under $1,000</SelectItem>
                        <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                        <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                        <SelectItem value="10000-20000">$10,000 - $20,000</SelectItem>
                        <SelectItem value="20000+">$20,000+</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Radio Questions */}
            <div className="grid sm:grid-cols-3 gap-10">
                <div className="space-y-4">
                    <Label className={labelClasses}>Do you have a venue?</Label>
                    <div className="flex gap-6">
                        {['yes', 'no'].map((val) => (
                            <label key={val} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="has-venue"
                                    value={val}
                                    checked={hasVenue === val}
                                    onChange={(e) => setHasVenue(e.target.value)}
                                    className="w-4 h-4 text-gold accent-gold cursor-pointer"
                                />
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-gold transition-colors">{val}</span>
                            </label>
                        ))}
                    </div>
                    <AnimatePresence>
                        {hasVenue === "yes" && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <Input id="venue" name="venue" placeholder="Venue Name" className={inputClasses} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-4">
                    <Label className={labelClasses}>Do you have a caterer?</Label>
                    <div className="flex gap-6">
                        {['yes', 'no'].map((val) => (
                            <label key={val} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="has-caterer"
                                    value={val}
                                    checked={hasCaterer === val}
                                    onChange={(e) => setHasCaterer(e.target.value)}
                                    className="w-4 h-4 text-gold accent-gold cursor-pointer"
                                />
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-gold transition-colors">{val}</span>
                            </label>
                        ))}
                    </div>
                    <AnimatePresence>
                        {hasCaterer === "yes" && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <Input id="caterer" name="caterer" placeholder="Caterer Name" className={inputClasses} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-4">
                    <Label className={labelClasses}>Do you have a planner?</Label>
                    <div className="flex gap-6">
                        {['yes', 'no'].map((val) => (
                            <label key={val} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="has-planner"
                                    value={val}
                                    checked={hasPlanner === val}
                                    onChange={(e) => setHasPlanner(e.target.value)}
                                    className="w-4 h-4 text-gold accent-gold cursor-pointer"
                                />
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-gold transition-colors">{val}</span>
                            </label>
                        ))}
                    </div>
                    <AnimatePresence>
                        {hasPlanner === "yes" && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <Input id="planner" name="planner" placeholder="Planner Name" className={inputClasses} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="space-y-4">
                <Label htmlFor="message" className={labelClasses}>Tell us about your vision</Label>
                <Textarea id="message" name="message" placeholder="Share your event details, style preferences, and any specific items you're interested in..." className={`${inputClasses} min-h-[120px] resize-none border-b`} />
            </div>

            <Button
                type="submit"
                className="w-full h-16 bg-[#1A1A1A] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gold hover:text-black transition-all duration-500 group shadow-xl"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Sending Request...' : 'Send Consultation Request'}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </Button>
        </motion.form>
    )
}

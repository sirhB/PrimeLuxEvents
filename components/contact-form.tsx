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
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"

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

        // Capture form element before async operations
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

        // Normalize event_date - convert empty string to null
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
            status: 'new_request',
        }

        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('consultations')
                .insert([consultationData])
                .select()

            if (error) {
                console.error('Supabase error:', error)
                throw new Error(error.message || 'Failed to submit consultation request')
            }

            setSubmitMessage({
                type: 'success',
                text: 'Thank you! Your consultation request has been submitted. We\'ll be in touch soon!'
            })

            // Reset form using captured form element or ref
            if (formElement) {
                formElement.reset()
            }
            setHasVenue('')
            setHasCaterer('')
            setHasPlanner('')
            setBudgetRange('')

            // Scroll to success message
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 100)
        } catch (error) {
            console.error('Error submitting consultation:', error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            setSubmitMessage({
                type: 'error',
                text: errorMessage.includes('RLS') || errorMessage.includes('policy')
                    ? 'Sorry, there was an authentication error. Please refresh the page and try again.'
                    : `Sorry, there was an error: ${errorMessage}. Please try again or contact us directly.`
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <motion.form
            ref={formRef as React.RefObject<HTMLFormElement>}
            className="space-y-6"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <AnimatePresence>
                {submitMessage && (
                    <motion.div
                        key={submitMessage.type}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`p-4 rounded-md ${submitMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}
                    >
                        {submitMessage.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {validationErrors.length > 0 && (
                    <motion.ul
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="p-4 rounded-md border border-red-200 bg-red-50 text-red-800 space-y-1 text-sm"
                    >
                        {validationErrors.map((err) => (
                            <li key={err}>• {err}</li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first-name">First name *</Label>
                    <Input id="first-name" name="first-name" placeholder="Jane" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last-name">Last name *</Label>
                    <Input id="last-name" name="last-name" placeholder="Doe" required />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" placeholder="jane@example.com" type="email" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" placeholder="(555) 000-0000" type="tel" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="event-date">Event Date (Optional)</Label>
                <Input id="event-date" name="event-date" type="date" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <Input id="guests" name="guests" type="number" placeholder="e.g. 150" min="1" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Select value={budgetRange} onValueChange={setBudgetRange}>
                    <SelectTrigger id="budget">
                        <SelectValue placeholder="Select a budget range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="under-1000">Under $1,000</SelectItem>
                        <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                        <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                        <SelectItem value="10000-20000">$10,000 - $20,000</SelectItem>
                        <SelectItem value="20000+">$20,000+</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Venue Question */}
            <div className="space-y-2">
                <Label>Do you have a venue?</Label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="has-venue"
                            value="yes"
                            checked={hasVenue === "yes"}
                            onChange={(e) => setHasVenue(e.target.value)}
                            className="w-4 h-4 text-gold accent-gold cursor-pointer"
                        />
                        <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="has-venue"
                            value="no"
                            checked={hasVenue === "no"}
                            onChange={(e) => setHasVenue(e.target.value)}
                            className="w-4 h-4 text-gold accent-gold cursor-pointer"
                        />
                        <span className="text-sm">No</span>
                    </label>
                </div>
                <AnimatePresence>
                    {hasVenue === "yes" && (
                        <motion.div
                            key="venue-input"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="mt-3"
                        >
                            <Input id="venue" name="venue" placeholder="e.g. The Grand Hotel" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Caterer Question */}
            <div className="space-y-2">
                <Label>Do you have a caterer?</Label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="has-caterer"
                            value="yes"
                            checked={hasCaterer === "yes"}
                            onChange={(e) => setHasCaterer(e.target.value)}
                            className="w-4 h-4 text-gold accent-gold cursor-pointer"
                        />
                        <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="has-caterer"
                            value="no"
                            checked={hasCaterer === "no"}
                            onChange={(e) => setHasCaterer(e.target.value)}
                            className="w-4 h-4 text-gold accent-gold cursor-pointer"
                        />
                        <span className="text-sm">No</span>
                    </label>
                </div>
                <AnimatePresence>
                    {hasCaterer === "yes" && (
                        <motion.div
                            key="caterer-input"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="mt-3"
                        >
                            <Input id="caterer" name="caterer" placeholder="e.g. Delicious Eats" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Event Planner Question */}
            <div className="space-y-2">
                <Label>Do you have an event planner?</Label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="has-planner"
                            value="yes"
                            checked={hasPlanner === "yes"}
                            onChange={(e) => setHasPlanner(e.target.value)}
                            className="w-4 h-4 text-gold accent-gold cursor-pointer"
                        />
                        <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="has-planner"
                            value="no"
                            checked={hasPlanner === "no"}
                            onChange={(e) => setHasPlanner(e.target.value)}
                            className="w-4 h-4 text-gold accent-gold cursor-pointer"
                        />
                        <span className="text-sm">No</span>
                    </label>
                </div>
                <AnimatePresence>
                    {hasPlanner === "yes" && (
                        <motion.div
                            key="planner-input"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="mt-3"
                        >
                            <Input id="planner" name="planner" placeholder="Event planner name or company" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="Tell us about your event..." className="min-h-[150px]" />
            </div>

            <motion.div whileHover={{ scale: isSubmitting ? 1 : 1.01 }} whileTap={{ scale: isSubmitting ? 1 : 0.99 }}>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Request Consultation'}
                </Button>
            </motion.div>
        </motion.form>
    )
}

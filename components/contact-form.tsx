"use client"

import { useState } from "react"
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
import { useRouter } from "next/navigation"

export function ContactForm() {
    const [hasVenue, setHasVenue] = useState<string>("")
    const [hasCaterer, setHasCaterer] = useState<string>("")
    const [hasPlanner, setHasPlanner] = useState<string>("")
    const [budgetRange, setBudgetRange] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitMessage(null)

        const formData = new FormData(e.currentTarget)

        const consultationData = {
            first_name: formData.get('first-name') as string,
            last_name: formData.get('last-name') as string,
            customer_name: `${formData.get('first-name')} ${formData.get('last-name')}`,
            customer_email: formData.get('email') as string,
            customer_phone: formData.get('phone') as string,
            event_date: formData.get('event-date') as string || null,
            number_of_guests: formData.get('guests') ? parseInt(formData.get('guests') as string) : null,
            budget_range: budgetRange || null,
            has_venue: hasVenue === 'yes',
            venue_name: hasVenue === 'yes' ? formData.get('venue') as string : null,
            has_caterer: hasCaterer === 'yes',
            caterer_name: hasCaterer === 'yes' ? formData.get('caterer') as string : null,
            has_planner: hasPlanner === 'yes',
            planner_name: hasPlanner === 'yes' ? formData.get('planner') as string : null,
            message: formData.get('message') as string,
            status: 'new_request',
        }

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('consultations')
                .insert([consultationData])

            if (error) throw error

            setSubmitMessage({
                type: 'success',
                text: 'Thank you! Your consultation request has been submitted. We\'ll be in touch soon!'
            })

            // Reset form
            e.currentTarget.reset()
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
            setSubmitMessage({
                type: 'error',
                text: 'Sorry, there was an error submitting your request. Please try again or contact us directly.'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {submitMessage && (
                <div className={`p-4 rounded-md ${submitMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {submitMessage.text}
                </div>
            )}

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
                {hasVenue === "yes" && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Input id="venue" name="venue" placeholder="e.g. The Grand Hotel" />
                    </div>
                )}
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
                {hasCaterer === "yes" && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Input id="caterer" name="caterer" placeholder="e.g. Delicious Eats" />
                    </div>
                )}
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
                {hasPlanner === "yes" && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Input id="planner" name="planner" placeholder="Event planner name or company" />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="Tell us about your event..." className="min-h-[150px]" />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Request Consultation'}
            </Button>
        </form>
    )
}

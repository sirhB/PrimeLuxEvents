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

export function ContactForm() {
    const [hasVenue, setHasVenue] = useState<string>("")
    const [hasCaterer, setHasCaterer] = useState<string>("")
    const [hasPlanner, setHasPlanner] = useState<string>("")

    return (
        <form className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="Jane" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Doe" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="jane@example.com" type="email" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="(555) 000-0000" type="tel" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="event-date">Event Date (Optional)</Label>
                <Input id="event-date" type="date" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <Input id="guests" type="number" placeholder="e.g. 150" min="1" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Select>
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
                            className="w-4 h-4 text-primary"
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
                            className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm">No</span>
                    </label>
                </div>
                {hasVenue === "yes" && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Input id="venue" placeholder="e.g. The Grand Hotel" />
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
                            className="w-4 h-4 text-primary"
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
                            className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm">No</span>
                    </label>
                </div>
                {hasCaterer === "yes" && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Input id="caterer" placeholder="e.g. Delicious Eats" />
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
                            className="w-4 h-4 text-primary"
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
                            className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm">No</span>
                    </label>
                </div>
                {hasPlanner === "yes" && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Input id="planner" placeholder="Event planner name or company" />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Tell us about your event..." className="min-h-[150px]" />
            </div>

            <Button type="submit" className="w-full" size="lg">
                Request Consultation
            </Button>
        </form>
    )
}

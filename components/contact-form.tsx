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
import { motion } from "framer-motion"

export function ContactForm() {
    const [hasVenue, setHasVenue] = useState<string>("")
    const [hasCaterer, setHasCaterer] = useState<string>("")
    const [hasPlanner, setHasPlanner] = useState<string>("")

    const fieldVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.5,
            },
        }),
    }

    return (
        <form className="space-y-6">
            <motion.div
                custom={0}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fieldVariants}
                className="grid sm:grid-cols-2 gap-4"
            >
                <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="Jane" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Doe" />
                </div>
            </motion.div>

            <motion.div
                custom={1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fieldVariants}
                className="space-y-2"
            >
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="jane@example.com" type="email" />
            </motion.div>

            <motion.div
                custom={2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fieldVariants}
                className="space-y-2"
            >
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="(555) 000-0000" type="tel" />
            </motion.div>

            <motion.div
                custom={3}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fieldVariants}
                className="space-y-2"
            >
                <Label htmlFor="event-date">Event Date (Optional)</Label>
                <Input id="event-date" type="date" />
            </motion.div>

            <motion.div
                custom={4}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fieldVariants}
                className="space-y-2"
            >
                <Label htmlFor="guests">Number of Guests</Label>
                <Input id="guests" type="number" placeholder="e.g. 150" min="1" />
            </motion.div>

            <motion.div
                custom={5}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fieldVariants}
                className="space-y-2"
            >
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
            </motion.div>

            {/* Venue Question */}
            <motion.div
                custom={6}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fieldVariants}
                className="space-y-2"
            >
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
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3"
                    >
                        <Input id="venue" placeholder="e.g. The Grand Hotel" />
                    </motion.div>
                )}
            </motion.div>

            {/* Caterer Question */}
            <motion.div
                custom={7}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fieldVariants}
                className="space-y-2"
            >
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
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3"
                    >
                        <Input id="caterer" placeholder="e.g. Delicious Eats" />
                    </motion.div>
                )}
            </motion.div>

            {/* Event Planner Question */}
            <motion.div
                custom={8}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fieldVariants}
                className="space-y-2"
            >
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
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3"
                    >
                        <Input id="planner" placeholder="Event planner name or company" />
                    </motion.div>
                )}
            </motion.div>

            <motion.div
                custom={9}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fieldVariants}
                className="space-y-2"
            >
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Tell us about your event..." className="min-h-[150px]" />
            </motion.div>

            <motion.div
                custom={10}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fieldVariants}
            >
                <Button type="submit" className="w-full hover:scale-105 transition-transform" size="lg">
                    Request Consultation
                </Button>
            </motion.div>
        </form>
    )
}

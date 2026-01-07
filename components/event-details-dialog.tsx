"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export type EventDetails = {
    eventName: string
    date: Date
    eventType: string
    guestCount: number
    venue: string
}

interface EventDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (details: EventDetails) => void
    initialData: EventDetails | null
}

export function EventDetailsDialog({
    open,
    onOpenChange,
    onSubmit,
    initialData,
}: EventDetailsDialogProps) {
    const [date, setDate] = useState<Date | undefined>(initialData?.date)
    const [eventName, setEventName] = useState(initialData?.eventName || "")
    const [eventType, setEventType] = useState(initialData?.eventType || "")
    const [guestCount, setGuestCount] = useState(initialData?.guestCount?.toString() || "")
    const [venue, setVenue] = useState(initialData?.venue || "")

    useEffect(() => {
        if (open && initialData) {
            setDate(initialData.date)
            setEventName(initialData.eventName || "")
            setEventType(initialData.eventType || "")
            setGuestCount(initialData.guestCount?.toString() || "")
            setVenue(initialData.venue || "")
        }
    }, [open, initialData])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!date || !eventType || !guestCount || !venue) {
            return // Basic validation
        }

        onSubmit({
            eventName,
            date,
            eventType,
            guestCount: parseInt(guestCount, 10),
            venue,
        })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Event Details</DialogTitle>
                    <DialogDescription>
                        Please provide details about your event to help us serve you better.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="eventName" className="text-right">
                            Event Name
                        </Label>
                        <Input
                            id="eventName"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="e.g. Smith Wedding"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <div className="col-span-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="eventType" className="text-right">
                            Type
                        </Label>
                        <Select value={eventType} onValueChange={setEventType}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="wedding">Wedding</SelectItem>
                                <SelectItem value="corporate">Corporate Event</SelectItem>
                                <SelectItem value="birthday">Birthday Party</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="guestCount" className="text-right">
                            Guests
                        </Label>
                        <Input
                            id="guestCount"
                            type="number"
                            value={guestCount}
                            onChange={(e) => setGuestCount(e.target.value)}
                            placeholder="Estimated count"
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="venue" className="text-right">
                            Venue
                        </Label>
                        <Input
                            id="venue"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            placeholder="Event location"
                            className="col-span-3"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Details</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, Clock, MapPin, Truck } from "lucide-react"
import { format } from "date-fns"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

export type EventDetails = {
  date: Date | undefined
  startTime: string
  endTime: string
  venueAddress: string
  venueType: string
  logistics: {
    hasElevator: boolean
    hasStairs: boolean
    hasLoadingDock: boolean
    notes: string
  }
  eventType: string
}

interface EventDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (details: EventDetails) => void
  initialData?: EventDetails | null
}

export function EventDetailsDialog({ open, onOpenChange, onSubmit, initialData }: EventDetailsDialogProps) {
  const [date, setDate] = useState<Date | undefined>(initialData?.date)
  const [startTime, setStartTime] = useState(initialData?.startTime || "")
  const [endTime, setEndTime] = useState(initialData?.endTime || "")
  const [venueAddress, setVenueAddress] = useState(initialData?.venueAddress || "")
  const [venueType, setVenueType] = useState(initialData?.venueType || "")
  const [eventType, setEventType] = useState(initialData?.eventType || "")

  const [hasElevator, setHasElevator] = useState(initialData?.logistics?.hasElevator || false)
  const [hasStairs, setHasStairs] = useState(initialData?.logistics?.hasStairs || false)
  const [hasLoadingDock, setHasLoadingDock] = useState(initialData?.logistics?.hasLoadingDock || false)
  const [logisticsNotes, setLogisticsNotes] = useState(initialData?.logistics?.notes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      date,
      startTime,
      endTime,
      venueAddress,
      venueType,
      eventType,
      logistics: {
        hasElevator,
        hasStairs,
        hasLoadingDock,
        notes: logisticsNotes,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Event Details</DialogTitle>
          <DialogDescription>
            Please provide details about your event so we can ensure seamless delivery and setup.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Date and Time */}
          <div className="grid gap-4">
            <h3 className="font-medium flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" /> Date & Time
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label>Start Time</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label>End Time</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              </div>
            </div>
          </div>

          {/* Venue Info */}
          <div className="grid gap-4">
            <h3 className="font-medium flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" /> Venue Information
            </h3>
            <div className="grid gap-2">
              <Label>Venue Address</Label>
              <Input
                placeholder="123 Event St, City, State"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Venue Type</Label>
                <Select value={venueType} onValueChange={setVenueType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="private_residence">Private Residence</SelectItem>
                    <SelectItem value="corporate_office">Corporate Office</SelectItem>
                    <SelectItem value="event_space">Event Space</SelectItem>
                    <SelectItem value="outdoor">Outdoor / Tent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Event Type</Label>
                <Input
                  placeholder="Wedding, Gala, etc."
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Logistics */}
          <div className="grid gap-4">
            <h3 className="font-medium flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4" /> Logistics & Access
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="elevator" checked={hasElevator} onCheckedChange={(c) => setHasElevator(c as boolean)} />
                <Label htmlFor="elevator">Elevator Access</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="stairs" checked={hasStairs} onCheckedChange={(c) => setHasStairs(c as boolean)} />
                <Label htmlFor="stairs">Stairs Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="loading_dock"
                  checked={hasLoadingDock}
                  onCheckedChange={(c) => setHasLoadingDock(c as boolean)}
                />
                <Label htmlFor="loading_dock">Loading Dock</Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Gate codes, parking instructions, specific room names..."
                value={logisticsNotes}
                onChange={(e) => setLogisticsNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">
              Save Event Details
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

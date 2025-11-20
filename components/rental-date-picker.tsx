"use client"

import { useState } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { addDays, differenceInDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

interface RentalDatePickerProps {
    onDateChange: (dateRange: DateRange | undefined, days: number) => void
    minDays?: number
    disabledDates?: Date[]
    className?: string
}

export function RentalDatePicker({
    onDateChange,
    minDays = 1,
    disabledDates = [],
    className
}: RentalDatePickerProps) {
    const [date, setDate] = useState<DateRange | undefined>()

    const handleDateChange = (newDate: DateRange | undefined) => {
        setDate(newDate)

        if (newDate?.from && newDate?.to) {
            const days = differenceInDays(newDate.to, newDate.from) + 1
            onDateChange(newDate, days)
        } else {
            onDateChange(newDate, 0)
        }
    }

    const rentalDays = date?.from && date?.to
        ? differenceInDays(date.to, date.from) + 1
        : 0

    return (
        <div className={cn("space-y-3", className)}>
            <Label className="text-base font-medium">Select Rental Dates</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                    <span className="ml-2 text-muted-foreground">
                                        ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})
                                    </span>
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick your event dates</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={handleDateChange}
                        numberOfMonths={2}
                        disabled={(date) => {
                            // Disable past dates
                            if (date < new Date()) return true
                            // Disable specific dates
                            return disabledDates.some(
                                (disabledDate) =>
                                    date.toDateString() === disabledDate.toDateString()
                            )
                        }}
                    />
                    {rentalDays > 0 && rentalDays < minDays && (
                        <div className="p-3 border-t bg-muted/50">
                            <p className="text-sm text-destructive">
                                Minimum rental period is {minDays} {minDays === 1 ? 'day' : 'days'}
                            </p>
                        </div>
                    )}
                </PopoverContent>
            </Popover>

            {date?.from && date?.to && rentalDays >= minDays && (
                <div className="text-sm text-muted-foreground">
                    <p>Event Duration: {rentalDays} {rentalDays === 1 ? 'day' : 'days'}</p>
                    <p className="text-xs mt-1">
                        *Delivery typically occurs the day before your event, pickup the day after
                    </p>
                </div>
            )}
        </div>
    )
}

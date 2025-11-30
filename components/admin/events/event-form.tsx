'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, Users, MapPin, User, Building, Phone, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface EventFormData {
    event_id: string
    name: string
    event_date: string
    location: string
    status: string
    guest_count: number | null
    budget: number | null
    manager_name: string
    customer_name: string
    customer_email: string
    customer_phone: string
    notes: string
    event_type: string
    venue_name: string
}

interface EventFormProps {
    event?: EventFormData & { id: string }
    onSuccess?: () => void
    onCancel?: () => void
}

const eventTypes = [
    'wedding',
    'corporate',
    'birthday',
    'engagement',
    'anniversary',
    'charity',
    'retirement',
    'baby_shower',
    'art_exhibition',
    'fashion',
    'graduation',
    'other'
]

const statuses = [
    { value: 'planning', label: 'Planning' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
]

export function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
    const [formData, setFormData] = useState<EventFormData>({
        event_id: event?.event_id || '',
        name: event?.name || '',
        event_date: event?.event_date || '',
        location: event?.location || '',
        status: event?.status || 'planning',
        guest_count: event?.guest_count || null,
        budget: event?.budget || null,
        manager_name: event?.manager_name || '',
        customer_name: event?.customer_name || '',
        customer_email: event?.customer_email || '',
        customer_phone: event?.customer_phone || '',
        notes: event?.notes || '',
        event_type: event?.event_type || '',
        venue_name: event?.venue_name || ''
    })

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const generateEventId = () => {
        const timestamp = Date.now().toString().slice(-4)
        const random = Math.random().toString(36).substring(2, 5).toUpperCase()
        return `EVT-${timestamp}${random}`
    }

    useEffect(() => {
        if (!event && !formData.event_id) {
            setFormData(prev => ({ ...prev, event_id: generateEventId() }))
        }
    }, [event, formData.event_id])

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) newErrors.name = 'Event name is required'
        if (!formData.event_date) newErrors.event_date = 'Event date is required'
        if (!formData.customer_name.trim()) newErrors.customer_name = 'Customer name is required'
        if (!formData.event_type) newErrors.event_type = 'Event type is required'

        if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
            newErrors.customer_email = 'Please enter a valid email address'
        }

        if (formData.customer_phone && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.customer_phone)) {
            newErrors.customer_phone = 'Please enter a valid phone number'
        }

        if (formData.budget !== null && formData.budget < 0) {
            newErrors.budget = 'Budget cannot be negative'
        }

        if (formData.guest_count !== null && formData.guest_count < 0) {
            newErrors.guest_count = 'Guest count cannot be negative'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)
        const supabase = createClient()

        try {
            const eventData = {
                ...formData,
                budget: formData.budget ? Math.round(formData.budget * 100) : null, // Convert to cents
                updated_at: new Date().toISOString()
            }

            if (event?.id) {
                // Update existing event
                const { error } = await supabase
                    .from('events')
                    .update(eventData)
                    .eq('id', event.id)

                if (error) throw error
            } else {
                // Create new event
                const { error } = await supabase
                    .from('events')
                    .insert({
                        ...eventData,
                        created_by: 'admin' // This should come from auth context
                    })

                if (error) throw error
            }

            onSuccess?.()
        } catch (error) {
            console.error('Error saving event:', error)
            setErrors({ submit: 'Failed to save event. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: keyof EventFormData, value: string | number | null) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="event_id">Event ID</Label>
                            <Input
                                id="event_id"
                                value={formData.event_id}
                                onChange={(e) => handleInputChange('event_id', e.target.value)}
                                placeholder="EVT-001"
                            />
                            {errors.event_id && <p className="text-sm text-red-600 mt-1">{errors.event_id}</p>}
                        </div>

                        <div>
                            <Label htmlFor="name">Event Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Emma & Liam's Wedding"
                                required
                            />
                            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="event_date">Event Date *</Label>
                            <Input
                                id="event_date"
                                type="date"
                                value={formData.event_date}
                                onChange={(e) => handleInputChange('event_date', e.target.value)}
                                required
                            />
                            {errors.event_date && <p className="text-sm text-red-600 mt-1">{errors.event_date}</p>}
                        </div>

                        <div>
                            <Label htmlFor="event_type">Event Type *</Label>
                            <Select value={formData.event_type} onValueChange={(value) => handleInputChange('event_type', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {eventTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.event_type && <p className="text-sm text-red-600 mt-1">{errors.event_type}</p>}
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Customer Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="customer_name">Customer Name *</Label>
                            <Input
                                id="customer_name"
                                value={formData.customer_name}
                                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                                placeholder="Emma Thompson"
                                required
                            />
                            {errors.customer_name && <p className="text-sm text-red-600 mt-1">{errors.customer_name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="customer_email">Email</Label>
                            <Input
                                id="customer_email"
                                type="email"
                                value={formData.customer_email}
                                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                                placeholder="emma@example.com"
                            />
                            {errors.customer_email && <p className="text-sm text-red-600 mt-1">{errors.customer_email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="customer_phone">Phone</Label>
                            <Input
                                id="customer_phone"
                                value={formData.customer_phone}
                                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                                placeholder="(555) 123-4567"
                            />
                            {errors.customer_phone && <p className="text-sm text-red-600 mt-1">{errors.customer_phone}</p>}
                        </div>

                        <div>
                            <Label htmlFor="manager_name">Event Manager</Label>
                            <Input
                                id="manager_name"
                                value={formData.manager_name}
                                onChange={(e) => handleInputChange('manager_name', e.target.value)}
                                placeholder="Maya Brooks"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Venue & Logistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Venue & Logistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="venue_name">Venue Name</Label>
                            <Input
                                id="venue_name"
                                value={formData.venue_name}
                                onChange={(e) => handleInputChange('venue_name', e.target.value)}
                                placeholder="Seaside Cliffs Resort"
                            />
                        </div>

                        <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                placeholder="Malibu, California"
                            />
                        </div>

                        <div>
                            <Label htmlFor="guest_count">Guest Count</Label>
                            <Input
                                id="guest_count"
                                type="number"
                                value={formData.guest_count || ''}
                                onChange={(e) => handleInputChange('guest_count', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="150"
                                min="0"
                            />
                            {errors.guest_count && <p className="text-sm text-red-600 mt-1">{errors.guest_count}</p>}
                        </div>

                        <div>
                            <Label htmlFor="budget">Budget ($)</Label>
                            <Input
                                id="budget"
                                type="number"
                                value={formData.budget ? (formData.budget / 100).toString() : ''}
                                onChange={(e) => handleInputChange('budget', e.target.value ? parseFloat(e.target.value) * 100 : null)}
                                placeholder="5000.00"
                                min="0"
                                step="0.01"
                            />
                            {errors.budget && <p className="text-sm text-red-600 mt-1">{errors.budget}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Any additional notes or special requirements..."
                            rows={4}
                        />
                    </CardContent>
                </Card>
            </div>

            {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {errors.submit}
                </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
                </Button>
            </div>
        </form>
    )
}

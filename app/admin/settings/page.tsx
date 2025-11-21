'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
    const [deliveryZones, setDeliveryZones] = useState([
        'Beverly Hills',
        'Los Angeles',
        'Santa Monica',
        'Malibu',
        'Pasadena',
        'Orange County',
    ])

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Configure store settings and policies
                </p>
            </div>

            {/* Delivery Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Delivery Settings</CardTitle>
                    <CardDescription>Configure delivery zones and fees</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="base-delivery-fee">Base Delivery Fee</Label>
                        <Input
                            id="base-delivery-fee"
                            type="number"
                            placeholder="0.00"
                            defaultValue="150.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="delivery-zones">Delivery Zones</Label>
                        <Textarea
                            id="delivery-zones"
                            placeholder="Enter delivery zones, one per line"
                            value={deliveryZones.join('\n')}
                            onChange={(e) => setDeliveryZones(e.target.value.split('\n'))}
                            rows={6}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="long-distance-fee">Long Distance Fee (per mile)</Label>
                        <Input
                            id="long-distance-fee"
                            type="number"
                            placeholder="0.00"
                            defaultValue="2.50"
                        />
                    </div>
                    <Button>Save Delivery Settings</Button>
                </CardContent>
            </Card>

            {/* Rental Policies */}
            <Card>
                <CardHeader>
                    <CardTitle>Rental Policies</CardTitle>
                    <CardDescription>Configure rental terms and conditions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="min-rental-days">Minimum Rental Days</Label>
                        <Input
                            id="min-rental-days"
                            type="number"
                            placeholder="1"
                            defaultValue="1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deposit-percentage">Deposit Percentage</Label>
                        <Input
                            id="deposit-percentage"
                            type="number"
                            placeholder="50"
                            defaultValue="50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cancellation-policy">Cancellation Policy</Label>
                        <Textarea
                            id="cancellation-policy"
                            placeholder="Enter cancellation policy"
                            defaultValue="Orders cancelled more than 30 days prior to the event date are eligible for a full refund less a 10% administrative fee. Cancellations made within 30 days of the event are subject to a 50% cancellation fee."
                            rows={4}
                        />
                    </div>
                    <Button>Save Rental Policies</Button>
                </CardContent>
            </Card>

            {/* Payment Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                    <CardDescription>Configure payment options and tax rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                        <Input id="tax-rate" type="number" placeholder="0.00" defaultValue="9.5" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="damage-waiver">Damage Waiver Fee (%)</Label>
                        <Input
                            id="damage-waiver"
                            type="number"
                            placeholder="0.00"
                            defaultValue="5"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="setup-fee">Setup Fee (per hour)</Label>
                        <Input
                            id="setup-fee"
                            type="number"
                            placeholder="0.00"
                            defaultValue="75.00"
                        />
                    </div>
                    <Button>Save Payment Settings</Button>
                </CardContent>
            </Card>

            {/* Email Templates */}
            <Card>
                <CardHeader>
                    <CardTitle>Email Templates</CardTitle>
                    <CardDescription>Customize automated email templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="quote-email">Quote Confirmation Email</Label>
                        <Textarea
                            id="quote-email"
                            placeholder="Enter email template"
                            defaultValue="Thank you for your quote request! We'll review your selections and get back to you within 24 hours."
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="order-email">Order Confirmation Email</Label>
                        <Textarea
                            id="order-email"
                            placeholder="Enter email template"
                            defaultValue="Your order has been confirmed! We'll contact you 48 hours before your event to coordinate delivery details."
                            rows={3}
                        />
                    </div>
                    <Button>Save Email Templates</Button>
                </CardContent>
            </Card>
        </div>
    )
}

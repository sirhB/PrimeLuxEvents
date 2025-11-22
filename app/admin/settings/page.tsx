'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Check, Settings as SettingsIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getDistanceBetweenAddresses } from '@/lib/geocoding'

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isTesting, setIsTesting] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [testResult, setTestResult] = useState<string | null>(null)

    const [settings, setSettings] = useState({
        tax_rate: '',
        delivery_base_fee: '',
        delivery_per_mile_rate: '',
        warehouse_address: '',
    })

    const [testAddress, setTestAddress] = useState('')

    useEffect(() => {
        async function fetchSettings() {
            const supabase = createClient()
            const { data, error } = await supabase.from('settings').select('key, value')

            if (data) {
                const settingsMap: Record<string, string> = {}
                data.forEach((setting) => {
                    settingsMap[setting.key] = setting.value
                })
                setSettings({
                    tax_rate: settingsMap.tax_rate || '0.08875',
                    delivery_base_fee: (parseInt(settingsMap.delivery_base_fee || '5000') / 100).toString(),
                    delivery_per_mile_rate: (parseInt(settingsMap.delivery_per_mile_rate || '150') / 100).toString(),
                    warehouse_address: settingsMap.warehouse_address || '',
                })
            }

            setIsLoading(false)
        }

        fetchSettings()
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        setSaveSuccess(false)

        try {
            const supabase = createClient()

            // Convert dollar amounts to cents
            const updates = [
                {
                    key: 'tax_rate',
                    value: parseFloat(settings.tax_rate).toString(),
                    description: 'Sales tax rate (decimal, e.g., 0.08875 for 8.875%)',
                },
                {
                    key: 'delivery_base_fee',
                    value: Math.round(parseFloat(settings.delivery_base_fee) * 100).toString(),
                    description: 'Base delivery fee in cents',
                },
                {
                    key: 'delivery_per_mile_rate',
                    value: Math.round(parseFloat(settings.delivery_per_mile_rate) * 100).toString(),
                    description: 'Delivery cost per mile in cents',
                },
                {
                    key: 'warehouse_address',
                    value: settings.warehouse_address,
                    description: 'Warehouse address for delivery distance calculation',
                },
            ]

            for (const update of updates) {
                await supabase
                    .from('settings')
                    .upsert(
                        {
                            key: update.key,
                            value: update.value,
                            description: update.description,
                            updated_at: new Date().toISOString(),
                        },
                        {
                            onConflict: 'key',
                        }
                    )
            }

            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (error) {
            console.error('Error saving settings:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleTestDistance = async () => {
        if (!testAddress || !settings.warehouse_address) return

        setIsTesting(true)
        setTestResult(null)

        try {
            const distance = await getDistanceBetweenAddresses(settings.warehouse_address, testAddress)

            if (distance !== null) {
                const baseFee = parseFloat(settings.delivery_base_fee)
                const perMileRate = parseFloat(settings.delivery_per_mile_rate)
                const totalFee = baseFee + distance * perMileRate

                setTestResult(
                    `Distance: ${distance} miles\nBase Fee: $${baseFee.toFixed(2)}\nDistance Fee: $${(distance * perMileRate).toFixed(2)}\nTotal Delivery Fee: $${totalFee.toFixed(2)}`
                )
            } else {
                setTestResult('Could not calculate distance. Please check the addresses.')
            }
        } catch (error) {
            setTestResult('Error calculating distance.')
        } finally {
            setIsTesting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif mb-2">Settings</h1>
                <p className="text-muted-foreground">Configure global settings for your store</p>
            </div>

            <div className="grid gap-6 max-w-4xl">
                {/* Tax Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tax Configuration</CardTitle>
                        <CardDescription>Set the sales tax rate for all orders</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                            <Input
                                id="tax_rate"
                                type="number"
                                step="0.0001"
                                min="0"
                                max="100"
                                value={(parseFloat(settings.tax_rate) * 100).toFixed(4)}
                                onChange={(e) =>
                                    setSettings({ ...settings, tax_rate: (parseFloat(e.target.value) / 100).toString() })
                                }
                                placeholder="8.875"
                            />
                            <p className="text-sm text-muted-foreground">
                                Current rate: {(parseFloat(settings.tax_rate) * 100).toFixed(2)}%
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Fee Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Fee Configuration</CardTitle>
                        <CardDescription>Set base fee and per-mile rate for delivery calculations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="delivery_base_fee">Base Delivery Fee ($)</Label>
                                <Input
                                    id="delivery_base_fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={settings.delivery_base_fee}
                                    onChange={(e) => setSettings({ ...settings, delivery_base_fee: e.target.value })}
                                    placeholder="50.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="delivery_per_mile_rate">Per Mile Rate ($)</Label>
                                <Input
                                    id="delivery_per_mile_rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={settings.delivery_per_mile_rate}
                                    onChange={(e) => setSettings({ ...settings, delivery_per_mile_rate: e.target.value })}
                                    placeholder="1.50"
                                />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Formula: Base Fee + (Distance × Per Mile Rate)
                        </p>
                    </CardContent>
                </Card>

                {/* Warehouse Address */}
                <Card>
                    <CardHeader>
                        <CardTitle>Warehouse Location</CardTitle>
                        <CardDescription>Set your warehouse address for delivery distance calculations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="warehouse_address">Warehouse Address</Label>
                            <Textarea
                                id="warehouse_address"
                                value={settings.warehouse_address}
                                onChange={(e) => setSettings({ ...settings, warehouse_address: e.target.value })}
                                placeholder="123 Main St, New York, NY 10001"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Distance Calculator Test */}
                <Card>
                    <CardHeader>
                        <CardTitle>Test Distance Calculator</CardTitle>
                        <CardDescription>Test the delivery fee calculation with a sample address</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="test_address">Test Delivery Address</Label>
                            <Textarea
                                id="test_address"
                                value={testAddress}
                                onChange={(e) => setTestAddress(e.target.value)}
                                placeholder="456 Park Ave, New York, NY 10022"
                                rows={2}
                            />
                        </div>
                        <Button onClick={handleTestDistance} disabled={isTesting || !testAddress || !settings.warehouse_address}>
                            {isTesting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Calculating...
                                </>
                            ) : (
                                'Calculate Distance & Fee'
                            )}
                        </Button>
                        {testResult && (
                            <div className="bg-muted/50 border border-border rounded-lg p-4">
                                <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                    <Button onClick={handleSave} disabled={isSaving} size="lg">
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <SettingsIcon className="mr-2 h-4 w-4" />
                                Save Settings
                            </>
                        )}
                    </Button>
                    {saveSuccess && (
                        <div className="flex items-center gap-2 text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="text-sm">Settings saved successfully!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

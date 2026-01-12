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

export default function SettingsClient() {
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
        company_address: '',
        company_email: '',
        company_phone: '',
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
                    company_address: settingsMap.company_address || '123 Luxury Lane, Suite 100, Beverly Hills, CA 90210',
                    company_email: settingsMap.company_email || 'info@primeluxevents.com',
                    company_phone: settingsMap.company_phone || '(555) 123-4567',
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
                {
                    key: 'company_address',
                    value: settings.company_address,
                    description: 'Publicly displayed company address',
                },
                {
                    key: 'company_email',
                    value: settings.company_email,
                    description: 'Publicly displayed company email',
                },
                {
                    key: 'company_phone',
                    value: settings.company_phone,
                    description: 'Publicly displayed company phone number',
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
            <div className="flex items-center justify-center min-h-screen bg-[var(--dashboard-background)]">
                <div className="h-8 w-8 border-4 border-[var(--dashboard-accent-gold)] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Configuration
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Settings
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Configure global settings for your store, tax, and delivery.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 max-w-4xl">
                {/* Tax Settings */}
                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="border-b border-[var(--dashboard-border)] pb-6">
                        <CardTitle className="font-serif text-2xl">Tax Configuration</CardTitle>
                        <CardDescription className="text-[var(--dashboard-text-muted)]">Set the sales tax rate for all orders</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-3">
                            <Label htmlFor="tax_rate" className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Tax Rate (%)</Label>
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
                                className="h-12 bg-black/20 border-none rounded-xl text-[var(--dashboard-text)] focus:ring-1 focus:ring-[var(--dashboard-accent-gold)]/30 transition-all"
                                placeholder="8.875"
                            />
                            <p className="text-[10px] text-[var(--dashboard-accent-gold)] font-bold uppercase tracking-wider">
                                Current effective rate: {(parseFloat(settings.tax_rate) * 100).toFixed(2)}%
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Fee Settings */}
                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="border-b border-[var(--dashboard-border)] pb-6">
                        <CardTitle className="font-serif text-2xl">Delivery Fee Configuration</CardTitle>
                        <CardDescription className="text-[var(--dashboard-text-muted)]">Set base fee and per-mile rate for delivery calculations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="delivery_base_fee" className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Base Delivery Fee ($)</Label>
                                <Input
                                    id="delivery_base_fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={settings.delivery_base_fee}
                                    onChange={(e) => setSettings({ ...settings, delivery_base_fee: e.target.value })}
                                    className="h-12 bg-black/20 border-none rounded-xl text-[var(--dashboard-text)] focus:ring-1 focus:ring-[var(--dashboard-accent-gold)]/30 transition-all"
                                    placeholder="50.00"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="delivery_per_mile_rate" className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Per Mile Rate ($)</Label>
                                <Input
                                    id="delivery_per_mile_rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={settings.delivery_per_mile_rate}
                                    onChange={(e) => setSettings({ ...settings, delivery_per_mile_rate: e.target.value })}
                                    className="h-12 bg-black/20 border-none rounded-xl text-[var(--dashboard-text)] focus:ring-1 focus:ring-[var(--dashboard-accent-gold)]/30 transition-all"
                                    placeholder="1.50"
                                />
                            </div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl border border-[var(--dashboard-border)]">
                            <p className="text-xs text-[var(--dashboard-text-muted)] font-medium">
                                Formula: <span className="text-[var(--dashboard-accent-gold)] font-bold">Base Fee</span> + (Distance × <span className="text-[var(--dashboard-accent-gold)] font-bold">Per Mile Rate</span>)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Company Information */}
                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="border-b border-[var(--dashboard-border)] pb-6">
                        <CardTitle className="font-serif text-2xl">Company Information</CardTitle>
                        <CardDescription className="text-[var(--dashboard-text-muted)]">Set public contact information for your business</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="company_email" className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Company Email</Label>
                                <Input
                                    id="company_email"
                                    type="email"
                                    value={settings.company_email}
                                    onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                                    className="h-12 bg-black/20 border-none rounded-xl text-[var(--dashboard-text)] focus:ring-1 focus:ring-[var(--dashboard-accent-gold)]/30 transition-all"
                                    placeholder="info@primeluxevents.com"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="company_phone" className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Company Phone</Label>
                                <Input
                                    id="company_phone"
                                    type="tel"
                                    value={settings.company_phone}
                                    onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                                    className="h-12 bg-black/20 border-none rounded-xl text-[var(--dashboard-text)] focus:ring-1 focus:ring-[var(--dashboard-accent-gold)]/30 transition-all"
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="company_address" className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Display Address</Label>
                            <Textarea
                                id="company_address"
                                value={settings.company_address}
                                onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                                className="min-h-[100px] bg-black/20 border-none rounded-xl text-[var(--dashboard-text)] focus:ring-1 focus:ring-[var(--dashboard-accent-gold)]/30 transition-all resize-none"
                                placeholder="123 Luxury Lane, Suite 100, Beverly Hills, CA 90210"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Warehouse Address */}
                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="border-b border-[var(--dashboard-border)] pb-6">
                        <CardTitle className="font-serif text-2xl">Warehouse Location</CardTitle>
                        <CardDescription className="text-[var(--dashboard-text-muted)]">Set your warehouse address for delivery distance calculations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-3">
                            <Label htmlFor="warehouse_address" className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Warehouse Address</Label>
                            <Textarea
                                id="warehouse_address"
                                value={settings.warehouse_address}
                                onChange={(e) => setSettings({ ...settings, warehouse_address: e.target.value })}
                                className="min-h-[100px] bg-black/20 border-none rounded-xl text-[var(--dashboard-text)] focus:ring-1 focus:ring-[var(--dashboard-accent-gold)]/30 transition-all resize-none"
                                placeholder="123 Main St, New York, NY 10001"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Distance Calculator Test */}
                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="border-b border-[var(--dashboard-border)] pb-6">
                        <CardTitle className="font-serif text-2xl">Test Distance Calculator</CardTitle>
                        <CardDescription className="text-[var(--dashboard-text-muted)]">Analyze the delivery fee calculation with a sample address</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-3">
                            <Label htmlFor="test_address" className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Test Delivery Address</Label>
                            <Textarea
                                id="test_address"
                                value={testAddress}
                                onChange={(e) => setTestAddress(e.target.value)}
                                className="min-h-[80px] bg-black/20 border-none rounded-xl text-[var(--dashboard-text)] focus:ring-1 focus:ring-[var(--dashboard-accent-gold)]/30 transition-all resize-none"
                                placeholder="456 Park Ave, New York, NY 10022"
                                rows={2}
                            />
                        </div>
                        <Button
                            onClick={handleTestDistance}
                            disabled={isTesting || !testAddress || !settings.warehouse_address}
                            className="w-full sm:w-auto rounded-full bg-white/5 hover:bg-white/10 text-[var(--dashboard-text)] border border-[var(--dashboard-border)] font-bold uppercase text-[10px] tracking-widest h-12 px-8 transition-all"
                        >
                            {isTesting ? (
                                <>
                                    <div className="mr-2 h-4 w-4 border-2 border-[var(--dashboard-accent-gold)] border-t-transparent rounded-full animate-spin" />
                                    Calculating...
                                </>
                            ) : (
                                'Calculate Distance & Fee'
                            )}
                        </Button>
                        {testResult && (
                            <div className="bg-black/30 border border-[var(--dashboard-border)] rounded-2xl p-6 animate-fade-in shadow-2xl">
                                <pre className="text-sm font-mono text-[var(--dashboard-text)] whitespace-pre-wrap leading-relaxed">
                                    {testResult}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex items-center gap-6 pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="lg"
                        className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-bold uppercase text-[11px] tracking-[0.2em] px-10 h-14 shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all transform active:scale-95"
                    >
                        {isSaving ? (
                            <>
                                <div className="mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <SettingsIcon className="mr-2 h-4 w-4" />
                                Save Global Settings
                            </>
                        )}
                    </Button>
                    {saveSuccess && (
                        <div className="flex items-center gap-3 text-[var(--dashboard-accent-green)] animate-fade-in">
                            <div className="bg-[var(--dashboard-accent-green)]/10 p-1.5 rounded-full border border-[var(--dashboard-accent-green)]/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <Check className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Settings updated successfully</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

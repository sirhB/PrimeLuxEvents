'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Check, Settings as SettingsIcon, Eye, Palette } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getDistanceBetweenAddresses } from '@/lib/geocoding'
import Link from 'next/link'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'
import { COMPANY } from '@/lib/company'

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
        security_deposit_type: 'percent',
        security_deposit_flat_cents: '100',
        security_deposit_percent: '20',
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
                    company_address: settingsMap.company_address || COMPANY.address,
                    company_email: settingsMap.company_email || COMPANY.email,
                    company_phone: settingsMap.company_phone || COMPANY.phone,
                    security_deposit_type: settingsMap.security_deposit_type === 'flat' ? 'flat' : 'percent',
                    security_deposit_flat_cents: (
                        parseInt(settingsMap.security_deposit_flat_cents || '10000', 10) / 100
                    ).toString(),
                    security_deposit_percent: settingsMap.security_deposit_percent || '20',
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
                {
                    key: 'security_deposit_type',
                    value: settings.security_deposit_type === 'flat' ? 'flat' : 'percent',
                    description: 'flat or percent',
                },
                {
                    key: 'security_deposit_flat_cents',
                    value: Math.round(parseFloat(settings.security_deposit_flat_cents || '0') * 100).toString(),
                    description: 'Flat security deposit in cents when type=flat',
                },
                {
                    key: 'security_deposit_percent',
                    value: parseFloat(settings.security_deposit_percent || '20').toString(),
                    description: 'Percent of merchandise subtotal when type=percent',
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
        <AdminPage>
            <AdminPageHeader
                eyebrow="Configuration"
                title="Settings"
                description="Configure global settings for your store, tax, and delivery."
                actions={
                    <Button asChild variant="outline" className="rounded-md">
                        <Link href="/admin/visual-editor">
                            <Eye className="mr-2 h-4 w-4" />
                            Open Visual Editor
                        </Link>
                    </Button>
                }
            />

            <div className="grid gap-6 max-w-4xl">
                {/* Branding & Appearance Shortcut */}
                <Card className="border-none glass-card overflow-hidden border-gold/20 bg-gold/[0.02]">
                    <CardHeader className="border-b border-gold/10 pb-4 bg-gold/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold text-gold">Appearance & Branding</CardTitle>
                                <CardDescription className="text-gold/60">Customize your store's visual identity and landing pages</CardDescription>
                            </div>
                            <Palette className="h-8 w-8 text-gold/40" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-sm text-[var(--dashboard-text-muted)] mb-6">
                            Use the Visual Editor to modify your logo, brand colors, and section layouts in real-time. Changes are saved automatically and applied across your storefront.
                        </p>
                        <Button asChild className="rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase text-[10px] tracking-widest px-8">
                            <Link href="/admin/visual-editor">Launch Visual Editor</Link>
                        </Button>
                    </CardContent>
                </Card>
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
                                    placeholder={COMPANY.email}
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
                                    placeholder={COMPANY.phone}
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
                                placeholder={COMPANY.address}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Deposit */}
                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="border-b border-[var(--dashboard-border)] pb-6">
                        <CardTitle className="font-serif text-2xl">Security Deposit</CardTitle>
                        <CardDescription className="text-[var(--dashboard-text-muted)]">
                            Refundable deposit charged as a separate Stripe payment at checkout (flat or % of cart)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                Deposit type
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, security_deposit_type: 'percent' })}
                                    className={`h-12 rounded-xl border text-sm font-medium transition-all ${
                                        settings.security_deposit_type === 'percent'
                                            ? 'border-[var(--dashboard-accent-gold)] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)]'
                                            : 'border-[var(--dashboard-border)] text-[var(--dashboard-text-muted)]'
                                    }`}
                                >
                                    Percent of cart
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, security_deposit_type: 'flat' })}
                                    className={`h-12 rounded-xl border text-sm font-medium transition-all ${
                                        settings.security_deposit_type === 'flat'
                                            ? 'border-[var(--dashboard-accent-gold)] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)]'
                                            : 'border-[var(--dashboard-border)] text-[var(--dashboard-text-muted)]'
                                    }`}
                                >
                                    Flat rate
                                </button>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="security_deposit_percent" className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                    Percent (%)
                                </Label>
                                <Input
                                    id="security_deposit_percent"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={settings.security_deposit_percent}
                                    onChange={(e) =>
                                        setSettings({ ...settings, security_deposit_percent: e.target.value })
                                    }
                                    disabled={settings.security_deposit_type !== 'percent'}
                                    className="h-12 bg-black/20 border-none rounded-xl text-[var(--dashboard-text)] focus:ring-1 focus:ring-[var(--dashboard-accent-gold)]/30 transition-all"
                                    placeholder="20"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="security_deposit_flat" className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                    Flat amount ($)
                                </Label>
                                <Input
                                    id="security_deposit_flat"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={settings.security_deposit_flat_cents}
                                    onChange={(e) =>
                                        setSettings({ ...settings, security_deposit_flat_cents: e.target.value })
                                    }
                                    disabled={settings.security_deposit_type !== 'flat'}
                                    className="h-12 bg-black/20 border-none rounded-xl text-[var(--dashboard-text)] focus:ring-1 focus:ring-[var(--dashboard-accent-gold)]/30 transition-all"
                                    placeholder="100.00"
                                />
                            </div>
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
                                placeholder={COMPANY.warehouseAddress}
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
                                placeholder="456 Park Ave, Bridgeport, CT 06604"
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
        </AdminPage>
    )
}

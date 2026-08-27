'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePartnerBranding } from '@/app/actions/partners'
import { PartnerLogoUpload } from '@/components/partner/partner-logo-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  initial: {
    company_name: string
    brand_display_name: string | null
    brand_logo_url: string | null
    brand_accent_color: string | null
    brand_tagline: string | null
    business_email: string | null
    business_address: string | null
    business_city: string | null
    business_region: string | null
    business_postal: string | null
    invoice_footer_note: string | null
    phone: string | null
    website: string | null
  }
}

export function PartnerBrandingForm({ initial }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    company_name: initial.company_name || '',
    brand_display_name: initial.brand_display_name || '',
    brand_logo_url: initial.brand_logo_url || '',
    brand_accent_color: initial.brand_accent_color || '#1c1917',
    brand_tagline: initial.brand_tagline || '',
    business_email: initial.business_email || '',
    business_address: initial.business_address || '',
    business_city: initial.business_city || '',
    business_region: initial.business_region || '',
    business_postal: initial.business_postal || '',
    invoice_footer_note: initial.invoice_footer_note || '',
    phone: initial.phone || '',
    website: initial.website || '',
  })

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await updatePartnerBranding(form)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Branding saved — client invoices will use your look')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--champagne,#B8956B)]">
          White-label invoices
        </p>
        <h2 className="font-serif text-3xl font-light tracking-tight">Your brand on client invoices</h2>
        <p className="text-sm text-muted-foreground">
          Shared selection links look like invoices from your studio — not PrimeLux. Add your logo,
          colors, and business details below.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="font-serif text-xl font-light">Brand</h3>
        <div className="space-y-2">
          <Label>Logo</Label>
          <PartnerLogoUpload
            value={form.brand_logo_url}
            onChange={(url) => set('brand_logo_url', url)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company_name">Legal / company name</Label>
            <Input
              id="company_name"
              required
              value={form.company_name}
              onChange={(e) => set('company_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand_display_name">Invoice display name</Label>
            <Input
              id="brand_display_name"
              placeholder="Shown as the invoice sender"
              value={form.brand_display_name}
              onChange={(e) => set('brand_display_name', e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brand_tagline">Tagline</Label>
            <Input
              id="brand_tagline"
              placeholder="Optional short line under your name"
              value={form.brand_tagline}
              onChange={(e) => set('brand_tagline', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand_accent_color">Accent color</Label>
            <div className="flex gap-2">
              <Input
                id="brand_accent_color"
                type="color"
                className="h-10 w-14 cursor-pointer p-1"
                value={form.brand_accent_color || '#1c1917'}
                onChange={(e) => set('brand_accent_color', e.target.value)}
              />
              <Input
                value={form.brand_accent_color}
                onChange={(e) => set('brand_accent_color', e.target.value)}
                placeholder="#1c1917"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t pt-8">
        <h3 className="font-serif text-xl font-light">Business contact</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="business_email">Email on invoice</Label>
            <Input
              id="business_email"
              type="email"
              value={form.business_email}
              onChange={(e) => set('business_email', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="https://"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business_address">Street address</Label>
          <Input
            id="business_address"
            value={form.business_address}
            onChange={(e) => set('business_address', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="business_city">City</Label>
            <Input
              id="business_city"
              value={form.business_city}
              onChange={(e) => set('business_city', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_region">State / region</Label>
            <Input
              id="business_region"
              value={form.business_region}
              onChange={(e) => set('business_region', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_postal">Postal code</Label>
            <Input
              id="business_postal"
              value={form.business_postal}
              onChange={(e) => set('business_postal', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t pt-8">
        <h3 className="font-serif text-xl font-light">Invoice footer</h3>
        <div className="space-y-2">
          <Label htmlFor="invoice_footer_note">Footer note</Label>
          <Textarea
            id="invoice_footer_note"
            rows={3}
            placeholder="Payment terms, thank-you line, deposit policy…"
            value={form.invoice_footer_note}
            onChange={(e) => set('invoice_footer_note', e.target.value)}
          />
        </div>
      </section>

      <Button type="submit" disabled={loading} className="rounded-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save branding'}
      </Button>
    </form>
  )
}

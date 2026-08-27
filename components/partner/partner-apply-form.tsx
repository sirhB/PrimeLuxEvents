'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { applyToPartnerProgram } from '@/app/actions/partners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  mode: 'apply' | 'pending' | 'suspended' | 'revoked'
  companyName?: string
}

export function PartnerApplyForm({ mode, companyName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    companyName: '',
    businessType: 'planner',
    phone: '',
    website: '',
    instagram: '',
  })

  if (mode === 'pending') {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--champagne,#B8956B)]">
          Preferred vendor
        </p>
        <h2 className="font-serif text-3xl font-light">Application under review</h2>
        <p className="text-sm text-muted-foreground">
          Thanks{companyName ? `, ${companyName}` : ''}. Our team will confirm your Preferred
          Partner status shortly. You will unlock trade rates and client share links once approved.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/account">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  if (mode === 'suspended' || mode === 'revoked') {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h2 className="font-serif text-3xl font-light">Partner access unavailable</h2>
        <p className="text-sm text-muted-foreground">
          Your Preferred Vendor status is currently {mode}. Please contact PrimeLux to restore
          access.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await applyToPartnerProgram({
      companyName: form.companyName,
      businessType: form.businessType as 'planner' | 'decorator' | 'designer' | 'other',
      phone: form.phone,
      website: form.website,
      instagram: form.instagram,
    })
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Application submitted')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--champagne,#B8956B)]">
          Preferred vendor program
        </p>
        <h2 className="font-serif text-3xl font-light">Partner with PrimeLux</h2>
        <p className="text-sm text-muted-foreground">
          Exclusive trade rates for planners and decorators who list us as a preferred rental
          vendor. Share curated carts with clients — they review only; you collect and settle with
          us at your trade price.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">Company name</Label>
        <Input
          id="companyName"
          required
          value={form.companyName}
          onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Business type</Label>
        <Select
          value={form.businessType}
          onValueChange={(v) => setForm((f) => ({ ...f, businessType: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planner">Event planner</SelectItem>
            <SelectItem value="decorator">Decorator</SelectItem>
            <SelectItem value="designer">Designer</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          required
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://"
            value={form.website}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            placeholder="@studio"
            value={form.instagram}
            onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full rounded-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit application'}
      </Button>
    </form>
  )
}

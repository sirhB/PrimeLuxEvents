'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePartnerPaymentMethods } from '@/app/actions/partners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  initial: {
    payment_zelle: string | null
    payment_venmo: string | null
    payment_apple_cash: string | null
    payment_cash_app: string | null
    payment_other_label: string | null
    payment_other_value: string | null
    payment_instructions: string | null
  }
}

export function PartnerPaymentMethodsForm({ initial }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    payment_zelle: initial.payment_zelle || '',
    payment_venmo: initial.payment_venmo || '',
    payment_apple_cash: initial.payment_apple_cash || '',
    payment_cash_app: initial.payment_cash_app || '',
    payment_other_label: initial.payment_other_label || '',
    payment_other_value: initial.payment_other_value || '',
    payment_instructions: initial.payment_instructions || '',
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await updatePartnerPaymentMethods(form)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Payment methods saved')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--champagne,#B8956B)]">
          Client payments
        </p>
        <h2 className="font-serif text-3xl font-light tracking-tight">How clients pay you</h2>
        <p className="text-sm text-muted-foreground">
          These details appear on the shared selection invoice so your client can pay you directly
          (Zelle, Venmo, etc.). PrimeLux is never paid from that link.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zelle">Zelle</Label>
        <Input
          id="zelle"
          placeholder="Email or phone on Zelle"
          value={form.payment_zelle}
          onChange={(e) => setForm((f) => ({ ...f, payment_zelle: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="venmo">Venmo</Label>
        <Input
          id="venmo"
          placeholder="@your-handle"
          value={form.payment_venmo}
          onChange={(e) => setForm((f) => ({ ...f, payment_venmo: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="apple">Apple Cash</Label>
        <Input
          id="apple"
          placeholder="Phone number for Apple Cash"
          value={form.payment_apple_cash}
          onChange={(e) => setForm((f) => ({ ...f, payment_apple_cash: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cashapp">Cash App</Label>
        <Input
          id="cashapp"
          placeholder="$cashtag"
          value={form.payment_cash_app}
          onChange={(e) => setForm((f) => ({ ...f, payment_cash_app: e.target.value }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="otherLabel">Other method label</Label>
          <Input
            id="otherLabel"
            placeholder="e.g. Check, wire"
            value={form.payment_other_label}
            onChange={(e) => setForm((f) => ({ ...f, payment_other_label: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="otherValue">Other method details</Label>
          <Input
            id="otherValue"
            placeholder="Account or instructions"
            value={form.payment_other_value}
            onChange={(e) => setForm((f) => ({ ...f, payment_other_value: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Payment note (optional)</Label>
        <Textarea
          id="instructions"
          rows={3}
          placeholder="Include your name on the transfer, due date, etc."
          value={form.payment_instructions}
          onChange={(e) => setForm((f) => ({ ...f, payment_instructions: e.target.value }))}
        />
      </div>

      <Button type="submit" disabled={loading} className="rounded-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save payment methods'}
      </Button>
    </form>
  )
}

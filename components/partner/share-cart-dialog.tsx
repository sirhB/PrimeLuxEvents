'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/cart-provider'
import { createSharedCartForClient } from '@/app/actions/partners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Check, Copy, Share2 } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareCartWithClientDialog({ open, onOpenChange }: Props) {
  const { items, eventDetails, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    title: '',
    notes: '',
    deliveryAddress: eventDetails?.venueAddress || '',
    eventDate: eventDetails?.date
      ? new Date(eventDetails.date).toISOString().slice(0, 10)
      : '',
    eventType: eventDetails?.eventType || '',
  })

  const reset = () => {
    setShareUrl(null)
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!form.clientName.trim() || !form.deliveryAddress.trim()) {
      toast.error('Client name and delivery address are required')
      return
    }
    if (items.length === 0) {
      toast.error('Add items to your cart first')
      return
    }

    setLoading(true)
    const result = await createSharedCartForClient({
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone,
      title: form.title,
      notes: form.notes,
      deliveryAddress: form.deliveryAddress,
      deliveryDate: form.eventDate,
      eventDate: form.eventDate,
      eventType: form.eventType,
      venueAddress: form.deliveryAddress,
      items: items.map((item) => ({
        productId: item.productId,
        packageId: item.packageId,
        packageData: item.packageData,
        packageSelections: item.packageSelections,
        quantity: item.quantity,
        modifiers: item.modifiers,
      })),
    })
    setLoading(false)

    if (result.error || !result.sharePath) {
      toast.error(result.error || 'Could not create share link')
      return
    }

    const url = `${window.location.origin}${result.sharePath}`
    setShareUrl(url)
    toast.success('Client review link ready')
  }

  const copyLink = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">
            Share cart with client
          </DialogTitle>
          <DialogDescription>
            Your client gets a white-label invoice with your branding and retail pricing.
            They pay you directly — then you settle your trade rate with PrimeLux.
          </DialogDescription>
        </DialogHeader>

        {shareUrl ? (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">Link created</p>
                <p className="break-all text-xs text-muted-foreground">{shareUrl}</p>
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={copyLink} className="gap-2">
                <Copy className="h-4 w-4" /> Copy link
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  clearCart()
                  router.push('/account/partner/carts')
                }}
              >
                View shared carts
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client name</Label>
              <Input
                id="clientName"
                value={form.clientName}
                onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                placeholder="Couple or company name"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Client phone</Label>
                <Input
                  id="clientPhone"
                  value={form.clientPhone}
                  onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Venue / delivery address</Label>
              <Input
                id="deliveryAddress"
                value={form.deliveryAddress}
                onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event type</Label>
                <Input
                  id="eventType"
                  value={form.eventType}
                  onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
                  placeholder="Wedding, gala…"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Note to client (optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {items.length} item{items.length === 1 ? '' : 's'} from your current cart will be
              included.
            </p>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreate} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                Create link
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

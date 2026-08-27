'use client'

import { useEffect, useState } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ShareCartWithClientDialog } from '@/components/partner/share-cart-dialog'

export function PartnerShareCartButton({ disabled }: { disabled?: boolean }) {
  const [isPartner, setIsPartner] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('partner_profiles')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()
      if (!cancelled) setIsPartner(Boolean(data))
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!isPartner) return null

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 rounded-full border-gold/40 text-[10px] font-bold uppercase tracking-[0.25em] text-gold hover:bg-gold/10"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share with client
      </Button>
      <ShareCartWithClientDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

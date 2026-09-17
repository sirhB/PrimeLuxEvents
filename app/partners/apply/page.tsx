import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPartnerProfileForUser } from '@/lib/auth/partners'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Apply as a Preferred Partner | PrimeLux Events',
  description:
    'Apply for PrimeLux trade rates and client share carts — for planners and decorators in CT, RI, and MA.',
}

export default async function PublicPartnerApplyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const partner = await getPartnerProfileForUser()
    if (partner?.status === 'active') redirect('/account/partner')
    redirect('/account/partner/apply')
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#121110] via-[#1c1917] to-[#2a2420] px-6 py-24 text-[var(--linen,#F7F4EF)] md:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 30%, rgba(184,149,107,0.4), transparent 55%)',
          }}
        />
        <div className="relative mx-auto max-w-2xl space-y-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--champagne,#B8956B)]">
            Preferred partner program
          </p>
          <h1 className="font-serif text-4xl font-light tracking-tight md:text-5xl">
            Apply for trade rates
          </h1>
          <p className="max-w-lg text-sm font-light leading-relaxed text-white/70">
            Create an account, then submit your studio details. Once approved, your portal unlocks
            merchandise trade pricing and client share carts.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="rounded-[var(--radius-cta)] bg-gold text-black hover:bg-white">
              <Link href="/signup?next=/account/partner/apply" className="gap-2">
                Create account &amp; apply <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-[var(--radius-cta)] border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/login?next=/account/partner/apply">Already have an account? Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-16 md:px-12 space-y-8">
        <div className="space-y-3">
          <h2 className="font-serif text-2xl font-light">What you get</h2>
          <ul className="space-y-3 text-sm text-muted-foreground font-light leading-relaxed list-disc pl-5">
            <li>Trade % off catalog merchandise (delivery &amp; setup at standard rates)</li>
            <li>Share a review-only cart link with your client (retail totals)</li>
            <li>Collect from your client externally, then settle your trade portion with us</li>
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">
          Prefer the overview first?{' '}
          <Link href="/partners" className="text-gold underline underline-offset-2">
            How the partner program works
          </Link>
        </p>
      </section>
    </div>
  )
}

import { CreditCard, CheckCircle2, AlertTriangle } from 'lucide-react'
import { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** Server-rendered Stripe readiness for Settings. */
export function StripeStatusCard() {
  const publishableConfigured = Boolean(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_'))
  const secretConfigured = Boolean(process.env.STRIPE_SECRET_KEY?.startsWith('sk_'))
  const webhookConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET)
  const ready = publishableConfigured && secretConfigured

  return (
    <Card className="border-none glass-card overflow-hidden">
      <CardHeader className="border-b border-[var(--dashboard-border)] pb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="font-serif text-2xl">Stripe payments</CardTitle>
            <CardDescription className="text-[var(--dashboard-text-muted)]">
              Checkout and balance payments require live Stripe keys on this environment.
            </CardDescription>
          </div>
          <CreditCard className="h-8 w-8 text-[var(--dashboard-accent-gold)]/50" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div
          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
            ready
              ? 'border-[var(--dashboard-accent-green)]/30 bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)]'
              : 'border-[var(--dashboard-accent-orange)]/30 bg-[var(--dashboard-accent-orange)]/10 text-[var(--dashboard-accent-orange)]'
          }`}
        >
          {ready ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          {ready ? 'Stripe is configured for this environment' : 'Stripe is not fully configured'}
        </div>
        <ul className="space-y-2 text-sm text-[var(--dashboard-text-muted)]">
          <li className="flex justify-between gap-3">
            <span>Publishable key</span>
            <span className="font-medium text-[var(--dashboard-text)]">
              {publishableConfigured ? 'Set' : 'Missing'}
            </span>
          </li>
          <li className="flex justify-between gap-3">
            <span>Secret key</span>
            <span className="font-medium text-[var(--dashboard-text)]">
              {secretConfigured ? 'Set' : 'Missing'}
            </span>
          </li>
          <li className="flex justify-between gap-3">
            <span>Webhook secret</span>
            <span className="font-medium text-[var(--dashboard-text)]">
              {webhookConfigured ? 'Set' : 'Optional / missing'}
            </span>
          </li>
        </ul>
        <p className="text-xs text-[var(--dashboard-text-muted)]">
          Keys are read from environment variables — update them in your host (Vercel / .env), not
          in this form.
        </p>
      </CardContent>
    </Card>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPANY } from '@/lib/company'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms of service for ${COMPANY.name} rentals and event services.`,
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Legal</p>
        <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight mb-4">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-12">
          Last updated for launch. Operated by {COMPANY.legalName}, {COMPANY.address}.
        </p>

        <div className="space-y-10 text-gray-300 font-light leading-relaxed text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">1. Agreement</h2>
            <p>
              By browsing our catalog, requesting a consultation, or placing a rental order through {COMPANY.domain.replace('https://', '')},
              you agree to these terms and our{' '}
              <Link href="/rental-agreement" className="text-gold underline underline-offset-2">rental agreement</Link>.
              If you do not agree, do not use the site or place an order.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">2. Rentals &amp; bookings</h2>
            <p>
              Product availability, pricing, and delivery fees are confirmed at checkout. A deposit or full payment may be required to reserve inventory.
              Changes within 72 hours of delivery may not be guaranteed. Cancellations, damage, and weather policies are governed by the rental agreement signed at checkout.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">3. Service area</h2>
            <p>
              We primarily deliver within {COMPANY.serviceAreaLong}. Out-of-area requests are subject to approval and additional fees.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">4. Accounts &amp; conduct</h2>
            <p>
              You are responsible for accurate contact and event information. Do not misuse the site, attempt unauthorized access to admin areas,
              or interfere with other customers&apos; orders.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">5. Payments</h2>
            <p>
              Payments are processed by Stripe. Charge amounts are calculated server-side from your cart and delivery details.
              Disputed charges should be raised with us at {COMPANY.email} or {COMPANY.phone} before initiating a card dispute when possible.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">6. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, {COMPANY.legalName} is not liable for indirect or consequential damages arising from use of the site or rentals.
              Nothing in these terms limits rights you may have under Connecticut consumer law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">7. Contact</h2>
            <p>
              {COMPANY.name}<br />
              {COMPANY.address}<br />
              <a href={`tel:${COMPANY.phone.replace(/\D/g, '')}`} className="text-gold hover:underline">{COMPANY.phone}</a>
              {' · '}
              <a href={`mailto:${COMPANY.email}`} className="text-gold hover:underline">{COMPANY.email}</a>
            </p>
          </section>
        </div>

        <p className="mt-16 text-sm text-gray-500">
          See also our{' '}
          <Link href="/privacy" className="text-gold underline underline-offset-2">Privacy Policy</Link>
          {' '}and{' '}
          <Link href="/rental-agreement" className="text-gold underline underline-offset-2">Rental Agreement</Link>.
        </p>
      </div>
    </main>
  )
}

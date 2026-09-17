import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPANY } from '@/lib/company'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${COMPANY.name} collects and uses personal information.`,
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Legal</p>
        <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-12">
          {COMPANY.legalName} ({COMPANY.address}) respects your privacy.
        </p>

        <div className="space-y-10 text-gray-300 font-light leading-relaxed text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">1. Information we collect</h2>
            <p>
              We collect information you provide when creating an account, checking out, signing a rental agreement, or contacting us —
              such as name, email, phone, event/venue details, and payment-related metadata (processed by Stripe; we do not store full card numbers).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">2. How we use information</h2>
            <p>
              We use your information to fulfill rentals, schedule delivery and pickup, communicate about orders, improve our catalog and site,
              and comply with legal obligations. Staff may access order data as needed to operate the business.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">3. Sharing</h2>
            <p>
              We share data with service providers who help us run the platform (for example Supabase for hosting data/auth, Stripe for payments, and Vercel for the website).
              We do not sell your personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">4. Cookies &amp; analytics</h2>
            <p>
              We use essential cookies for authentication, carts, and security. We may use Vercel Analytics or similar tools to understand aggregate traffic.
              You can control cookies through your browser settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">5. Retention &amp; security</h2>
            <p>
              We retain order and account records as needed for operations, tax, and dispute resolution. We use industry-standard safeguards;
              no method of transmission is 100% secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">6. Your choices</h2>
            <p>
              Contact us to update your account details or request access/deletion where applicable. Marketing emails (if any) include an unsubscribe option.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-white">7. Contact</h2>
            <p>
              Privacy questions: <a href={`mailto:${COMPANY.email}`} className="text-gold hover:underline">{COMPANY.email}</a>
              {' '}or {COMPANY.phone}.
            </p>
          </section>
        </div>

        <p className="mt-16 text-sm text-gray-500">
          See also our{' '}
          <Link href="/terms" className="text-gold underline underline-offset-2">Terms of Service</Link>.
        </p>
      </div>
    </main>
  )
}

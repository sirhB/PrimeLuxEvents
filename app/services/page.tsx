import Image from "next/image"
import Link from "next/link"
import { getSiteContent } from "@/lib/content"

export const revalidate = 60

const SERVICES = [
  {
    key: 'design',
    imageKey: 'services.list.design.image',
    titleKey: 'services.list.design.title',
    descriptionKey: 'services.list.design.description',
    featuresKey: 'services.design.features',
    fallbackImage: '/images/service-design.png',
    alt: 'Design consultation',
  },
  {
    key: 'delivery',
    imageKey: 'services.list.delivery.image',
    titleKey: 'services.list.delivery.title',
    descriptionKey: 'services.list.delivery.description',
    featuresKey: 'services.delivery.features',
    fallbackImage: '/images/service-logistics.png',
    alt: 'Delivery crew unloading rentals',
  },
  {
    key: 'setup',
    imageKey: 'services.list.setup.image',
    titleKey: 'services.list.setup.title',
    descriptionKey: 'services.list.setup.description',
    featuresKey: 'services.setup.features',
    fallbackImage: '/images/service-setup.png',
    alt: 'Setup and breakdown',
  },
] as const

export default async function ServicesPage() {
  const content = await getSiteContent()

  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-28">
        <p className="lux-label">Services</p>
        <h1 className="mt-4 font-serif text-5xl font-medium leading-[0.95] md:text-7xl">
          {content['services.hero.title']}
        </h1>
        <p className="mt-5 text-base font-light leading-relaxed text-[var(--theme-muted)] md:text-lg">
          {content['services.hero.description']}
        </p>
      </section>

      <div className="border-t border-[var(--theme-dark)]/10">
        {SERVICES.map((service, index) => {
          const features: string[] = content[service.featuresKey] || []
          return (
            <section key={service.key} className="border-b border-[var(--theme-dark)]/10">
              <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 md:grid-cols-2 md:gap-16 md:px-8 md:py-20">
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--theme-surface)]">
                    <Image
                      src={content[service.imageKey] || service.fallbackImage}
                      alt={service.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="lux-label">{String(index + 1).padStart(2, '0')}</p>
                  <h2 className="mt-3 font-serif text-4xl font-medium leading-none">{content[service.titleKey]}</h2>
                  <p className="mt-4 text-base font-light leading-relaxed text-[var(--theme-muted)]">
                    {content[service.descriptionKey]}
                  </p>
                  {features.length > 0 && (
                    <ul className="mt-6 space-y-2 text-sm font-light text-[var(--theme-dark)]">
                      {features.map((feature) => (
                        <li key={feature} className="border-t border-[var(--theme-dark)]/10 py-2">{feature}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <section className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
        <h2 className="font-serif text-4xl font-medium leading-none md:text-5xl">{content['services.cta.title']}</h2>
        <p className="mx-auto mt-5 max-w-lg text-base font-light leading-relaxed text-[var(--theme-muted)]">
          {content['services.cta.description']}
        </p>
        <Link href="/plan" className="lux-cta mt-8">{content['services.cta.button'] || 'Plan your event'}</Link>
      </section>
    </div>
  )
}

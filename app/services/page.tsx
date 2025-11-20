import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PencilRuler, Truck, Armchair, Sparkles } from "lucide-react"
import { getSiteContent } from "@/lib/content"

export default async function ServicesPage() {
  const content = await getSiteContent()

  const designFeatures = JSON.parse(content['services.list.design.features'] || '[]')
  const deliveryFeatures = JSON.parse(content['services.list.delivery.features'] || '[]')
  const setupFeatures = JSON.parse(content['services.list.setup.features'] || '[]')

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight">{content['services.hero.title']}</h1>
          <p className="text-lg md:text-xl font-light text-muted-foreground max-w-2xl mx-auto">
            {content['services.hero.description']}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 md:gap-24">
            {/* Service 1 */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="order-2 md:order-1 relative aspect-video md:aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <Image
                  src={content['services.list.design.image'] || "/placeholder.svg?key=design-consult"}
                  alt="Design Consultation"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <PencilRuler className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-serif">{content['services.list.design.title']}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {content['services.list.design.description']}
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  {designFeatures.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Service 2 */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="space-y-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Truck className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-serif">{content['services.list.delivery.title']}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {content['services.list.delivery.description']}
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  {deliveryFeatures.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative aspect-video md:aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <Image
                  src={content['services.list.delivery.image'] || "/placeholder.svg?key=delivery"}
                  alt="White Glove Delivery"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Service 3 */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="order-2 md:order-1 relative aspect-video md:aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <Image
                  src={content['services.list.setup.image'] || "/placeholder.svg?key=setup"}
                  alt="Setup and Breakdown"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Armchair className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-serif">{content['services.list.setup.title']}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {content['services.list.setup.description']}
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  {setupFeatures.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 md:px-6 text-center space-y-8">
          <div className="h-16 w-16 mx-auto rounded-full bg-background border border-border flex items-center justify-center text-primary mb-6">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif">{content['services.cta.title']}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {content['services.cta.description']}
          </p>
          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="/contact">{content['services.cta.button']}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

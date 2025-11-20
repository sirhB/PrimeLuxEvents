import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-muted">
        <div className="absolute inset-0 z-0">
          <Image
            src="/luxury-event-setup-ballroom-chandelier.jpg"
            alt="Luxury Event Setup"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="container relative z-10 text-center text-white space-y-6 max-w-3xl px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight">Curating Extraordinary Moments</h1>
          <p className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto">
            PrimeLux Events is the premier destination for luxury event rentals, bringing your vision to life with our
            curated collection of exquisite furniture and decor.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif">Our Story</h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Founded in 2010, PrimeLux Events began with a simple mission: to elevate the standard of event
                  rentals. We noticed a gap in the market for truly high-end, well-maintained furniture that could
                  transform a space rather than just fill it.
                </p>
                <p>
                  Over the past decade, we have grown from a small boutique collection to a comprehensive design house,
                  partnering with the world's top event planners and designers to execute weddings, galas, and corporate
                  gatherings of distinction.
                </p>
                <p>
                  Our commitment goes beyond inventory. We believe in the art of hospitality, ensuring that every
                  interaction, from the first quote to the final pickup, is seamless and professional.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/5] md:aspect-square bg-muted rounded-lg overflow-hidden">
              <Image
                src="/elegant-wedding-reception-table-setting.jpg"
                alt="Our Story Image"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">The PrimeLux Standard</h2>
            <p className="text-muted-foreground">
              We hold ourselves to the highest standards of quality and service, ensuring your event is nothing short of
              perfection.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Curated Excellence",
                description:
                  "Every piece in our collection is hand-selected for its design, craftsmanship, and ability to make a statement.",
              },
              {
                title: "Impeccable Maintenance",
                description:
                  "Our inventory is meticulously inspected and maintained after every event to ensure it arrives in pristine condition.",
              },
              {
                title: "Seamless Logistics",
                description:
                  "Our experienced logistics team handles the complexities of delivery and setup, so you can focus on your guests.",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-background p-8 rounded-lg border border-border/50 hover:border-primary/20 transition-colors"
              >
                <h3 className="text-xl font-serif mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-serif">Ready to elevate your event?</h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Browse our collection and build your quote online instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" variant="secondary" className="min-w-[200px]">
              <Link href="/catalog">Start Your Quote</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-[200px] bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

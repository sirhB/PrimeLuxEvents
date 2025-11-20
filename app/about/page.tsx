import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSiteContent } from "@/lib/content"

export default async function AboutPage() {
  const content = await getSiteContent()
  const values = JSON.parse(content['about.values.items'] || '[]')

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-muted">
        <div className="absolute inset-0 z-0">
          <Image
            src={content['about.hero.image'] || "/luxury-event-setup-ballroom-chandelier.jpg"}
            alt="Luxury Event Setup"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="container relative z-10 text-center text-white space-y-6 max-w-3xl px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight">{content['about.hero.title']}</h1>
          <p className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto">
            {content['about.hero.description']}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif">{content['about.story.title']}</h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>{content['about.story.p1']}</p>
                <p>{content['about.story.p2']}</p>
                <p>{content['about.story.p3']}</p>
              </div>
            </div>
            <div className="relative aspect-[4/5] md:aspect-square bg-muted rounded-lg overflow-hidden">
              <Image
                src={content['about.story.image'] || "/elegant-wedding-reception-table-setting.jpg"}
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
            <h2 className="text-3xl md:text-4xl font-serif mb-4">{content['about.values.title']}</h2>
            <p className="text-muted-foreground">
              {content['about.values.description']}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value: any, index: number) => (
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
          <h2 className="text-3xl md:text-5xl font-serif">{content['about.cta.title']}</h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            {content['about.cta.description']}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" variant="secondary" className="min-w-[200px]">
              <Link href="/catalog">{content['about.cta.primary']}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-[200px] bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link href="/contact">{content['about.cta.secondary']}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

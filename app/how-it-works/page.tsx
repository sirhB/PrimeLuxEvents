import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { getSiteContent } from "@/lib/content"

export default async function HowItWorksPage() {
  const content = await getSiteContent()

  const steps = content['howitworks.steps.list'] || []
  const faqs = content['howitworks.faq.list'] || []

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight">{content['howitworks.hero.title']}</h1>
          <p className="text-lg md:text-xl font-light text-muted-foreground max-w-2xl mx-auto">
            {content['howitworks.hero.description']}
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:gap-24">
            {steps.map((step: any, index: number) => (
              <div key={index} className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                {/* Image - alternates left/right on desktop */}
                <div className={`relative aspect-video lg:aspect-[4/3] bg-muted rounded-lg overflow-hidden ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  {step.image && (
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-serif">
                    {index + 1}
                  </div>
                  <h2 className="text-3xl font-serif">{step.title}</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>

                  <div className="bg-muted p-6 rounded-lg border border-border/50">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Key Details
                    </h3>
                    <ul className="space-y-3">
                      {step.details.map((detail: string, idx: number) => (
                        <li key={idx} className="text-muted-foreground text-sm flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-2 shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concierge Service */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif">{content['howitworks.concierge.title']}</h2>
              <p className="text-primary-foreground/80 text-lg leading-relaxed">
                {content['howitworks.concierge.description']}
              </p>
              <Button asChild size="lg" variant="secondary" className="mt-4">
                <Link href="/contact">
                  {content['howitworks.concierge.button']} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm border border-white/20">
              <h3 className="text-xl font-medium mb-6">{content['howitworks.concierge.list.title']}</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">1</div>
                  <span>{content['howitworks.concierge.list.item1']}</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">2</div>
                  <span>{content['howitworks.concierge.list.item2']}</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">3</div>
                  <span>{content['howitworks.concierge.list.item3']}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-24 bg-background">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif mb-4">{content['howitworks.faq.title']}</h2>
            <p className="text-muted-foreground">
              {content['howitworks.faq.description']}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq: any, index: number) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link href="/faq">{content['howitworks.faq.button']}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getSiteContent } from "@/lib/content"

export default async function FAQPage() {
  const content = await getSiteContent()
  const faqs = content['faq.list'] || []

  return (
    <>
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight">{content['faq.hero.title']}</h1>
          <p className="text-lg md:text-xl font-light text-muted-foreground max-w-2xl mx-auto">
            {content['faq.hero.description']}
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq: any, index: number) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-serif">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  )
}

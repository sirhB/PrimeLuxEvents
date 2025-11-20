import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <>
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight">Frequently Asked Questions</h1>
          <p className="text-lg md:text-xl font-light text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about renting with PrimeLux Events.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-serif">How far in advance should I book?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                We recommend booking as soon as you have your date and venue secured. For peak seasons (spring and
                fall), we suggest booking 6-9 months in advance to ensure availability of your desired items. However,
                we can often accommodate last-minute requests depending on inventory.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-rental-duration">
              <AccordionTrigger className="text-lg font-serif">How long is the rental period?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Our standard rental period is 24 hours. We typically deliver on the day of the event and pick up the
                following day. If you need the items for longer or require a same-night pickup, please let us know so we
                can adjust your quote accordingly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-serif">Do you offer delivery and setup?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                We offer professional delivery to your venue. Standard delivery includes drop-off at a designated area.
                Full setup and installation (placing furniture, styling decor) is available for an additional fee.
                Please request this service when building your quote so we can allocate the proper time and crew.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-serif">What is your cancellation policy?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Orders cancelled more than 30 days prior to the event date are eligible for a full refund less a 10%
                administrative fee. Cancellations made within 30 days of the event are subject to a 50% cancellation
                fee. Orders cannot be cancelled within 7 days of the scheduled delivery.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-serif">Can I view the items in person?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Absolutely. We invite you to visit our showroom in Beverly Hills to see our collection in person. Please
                contact us to schedule an appointment with one of our design consultants.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-serif">Do you require a deposit?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes, a 50% non-refundable deposit is required to secure your items for your date. The remaining balance
                is due 14 days prior to your event.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-serif">What happens if an item is damaged?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                We charge a mandatory damage waiver fee on all rentals which covers minor wear and tear. However,
                significant damage, loss, or theft is the responsibility of the client and will be billed at the
                replacement cost of the item.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </>
  )
}

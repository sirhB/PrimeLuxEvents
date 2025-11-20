import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PencilRuler, Truck, Armchair, Sparkles } from "lucide-react"

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight">Our Services</h1>
          <p className="text-lg md:text-xl font-light text-muted-foreground max-w-2xl mx-auto">
            Beyond our exceptional inventory, we offer a suite of services designed to make your event planning
            experience seamless and stress-free.
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
                  src="/placeholder.svg?key=design-consult"
                  alt="Design Consultation"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <PencilRuler className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-serif">Design Consultation</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Not sure where to start? Our expert design team is here to help. We offer complimentary design
                  consultations to help you curate the perfect look for your event. Whether you have a full mood board
                  or just a vague idea, we'll guide you through our collection to find pieces that bring your vision to
                  life.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Personalized style recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Floor plan assistance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Custom mood boards
                  </li>
                </ul>
              </div>
            </div>

            {/* Service 2 */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="space-y-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Truck className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-serif">White Glove Delivery</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our logistics team is the backbone of our operation. We pride ourselves on punctuality and
                  professionalism. Our uniformed delivery crew handles every item with care, ensuring that your rentals
                  arrive in perfect condition and on time, every time.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Scheduled delivery windows
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Real-time tracking updates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Careful handling and protection
                  </li>
                </ul>
              </div>
              <div className="relative aspect-video md:aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <Image src="/placeholder.svg?key=delivery" alt="White Glove Delivery" fill className="object-cover" />
              </div>
            </div>

            {/* Service 3 */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="order-2 md:order-1 relative aspect-video md:aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <Image src="/placeholder.svg?key=setup" alt="Setup and Breakdown" fill className="object-cover" />
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Armchair className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-serif">Setup & Installation</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Want to walk into a fully realized event? For an additional fee, our team can handle the complete
                  setup and installation of your rentals. From placing chairs to hanging lighting, we ensure everything
                  is positioned exactly according to your floor plan.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Available as an add-on service
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Execution of detailed floor plans
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    On-site styling assistance
                  </li>
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
          <h2 className="text-3xl md:text-4xl font-serif">Experience the PrimeLux Difference</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Let us handle the details so you can enjoy the moment. Contact us today to discuss your event needs.
          </p>
          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

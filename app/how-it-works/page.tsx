import { CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const steps = [
  {
    id: "01",
    title: "Browse & Select",
    description:
      "Explore our extensive catalog of luxury furniture and decor online. Our platform allows you to view real-time availability, detailed specifications, and high-resolution images. Simply add items to your cart to start building your event.",
    image: "/design-consultation.jpg",
    features: ["Real-Time Availability", "Detailed Product Specs", "Curated Collections"],
  },
  {
    id: "02",
    title: "Build Your Quote",
    description:
      "Create a comprehensive quote instantly. Adjust quantities, select your event dates, and input venue details directly in your cart. No waiting for a salesperson—you have full control over your rental list and budget.",
    image: "/curated-proposal.jpg",
    features: ["Instant Pricing", "Self-Service Cart", "Budget Management"],
  },
  {
    id: "03",
    title: "Secure Reservation",
    description:
      "Ready to book? Secure your items immediately with a 50% deposit through our secure online portal. You'll receive an instant confirmation and a detailed contract. Our logistics team will then reach out to coordinate the finer details.",
    image: "/logistics-planning.jpg",
    features: ["Instant Booking", "Secure Online Payment", "Immediate Confirmation"],
  },
  {
    id: "04",
    title: "Professional Delivery",
    description:
      "On the day of your event, our uniformed team arrives on time to deliver your items to a secure drop-off location. Need us to handle the heavy lifting? Full setup and installation services are available for an additional fee.",
    image: "/event-setup.jpg",
    features: ["Uniformed Delivery Team", "Scheduled Drop-off", "Setup Available (Add-on)"],
  },
  {
    id: "05",
    title: "Seamless Retrieval",
    description:
      "Standard rentals cover a 24-hour period. We typically schedule pickup for the day following your event to ensure a stress-free conclusion. Same-night or custom pickup times can be arranged upon request.",
    image: "/event-breakdown.jpg",
    features: ["24-Hour Rental Period", "Next-Day Pickup", "Flexible Scheduling"],
  },
]

const faqs = [
  {
    question: "Can I book everything online without talking to anyone?",
    answer:
      "Yes! Our platform is designed for a complete self-service experience. You can browse, build your quote, and secure your rentals entirely online. If you need assistance, our support team is just a click away.",
  },
  {
    question: "How far in advance should I book?",
    answer:
      "We recommend booking as soon as you have your venue and date secured. For peak wedding seasons (May-October), 6-9 months in advance is ideal to ensure availability of our most popular items.",
  },
  {
    question: "Do you offer delivery outside the metro area?",
    answer:
      "Yes, we travel! We regularly service events up to 150 miles from our warehouse. Long-distance delivery fees are calculated based on mileage and crew requirements.",
  },
  {
    question: "Is setup included in the delivery fee?",
    answer:
      "Our standard delivery fee covers drop-off at a designated location. Full setup and installation—placing chairs, styling lounges, etc.—is a separate service that can be added to your quote for an additional fee.",
  },
  {
    question: "Can I make changes to my order after booking?",
    answer:
      "Absolutely. We understand that guest counts and plans change. You can make adjustments to your order up to 14 days before your event date, subject to inventory availability.",
  },
  {
    question: "Is there a minimum order amount?",
    answer:
      "We have a $1,000 rental minimum for delivery orders during peak season. For will-call pickups (available for select small items), the minimum is $250.",
  },
]

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-secondary/30 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-serif mb-6">The PrimeLux Experience</h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              We've refined the rental process into a seamless digital experience. From browsing to booking, control
              every detail of your event rentals online, on your time.
            </p>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="space-y-24 md:space-y-32">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col md:flex-row gap-12 md:gap-20 items-center ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Image Side */}
                <div className="w-full md:w-1/2 relative">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm shadow-xl">
                    <Image
                      src={step.image || "/placeholder.svg"}
                      alt={step.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  {/* Decorative number */}
                  <div className="absolute -top-10 -left-10 text-[120px] font-serif text-secondary font-bold opacity-50 select-none z-[-1]">
                    {step.id}
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="inline-block px-3 py-1 bg-secondary text-primary text-xs font-medium tracking-widest uppercase rounded-full mb-2">
                    Step {step.id}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif">{step.title}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>

                  <ul className="space-y-3 pt-4">
                    {step.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concierge Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-5xl font-serif">Need a Custom Touch?</h2>
              <p className="text-primary-foreground/80 text-lg leading-relaxed">
                While our platform is designed for self-service, our Concierge Team is available for large-scale
                productions requiring custom sourcing or complex logistics.
              </p>
              <div className="pt-4">
                <a
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-background px-8 text-sm font-medium text-primary transition-colors hover:bg-background/90"
                >
                  Contact Concierge
                </a>
              </div>
            </div>
            <div className="flex-1 relative h-[400px] w-full rounded-lg overflow-hidden border border-white/20">
              <Image src="/concierge-service.jpg" alt="Concierge Service" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-secondary/20">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Common Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about renting with us.</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium font-serif">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  )
}

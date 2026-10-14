"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getSiteContentClient } from "@/lib/content-client"
import { COMPANY } from "@/lib/company"

export default function FAQPage() {
  const [content, setContent] = useState<any>({})
  const [faqs, setFaqs] = useState<any[]>([])

  useEffect(() => {
    const loadContent = async () => {
      const siteContent = await getSiteContentClient()
      setContent(siteContent)
      setFaqs(siteContent['faq.list'] || [
        {
          question: "How far in advance should I book?",
          answer: "For peak wedding and holiday weekends, book 4–8 weeks ahead so popular pieces stay available. We can often accommodate shorter lead times — call us at " + COMPANY.phone + " and we’ll check inventory for your date."
        },
        {
          question: "Where do you deliver?",
          answer: "We deliver and pick up throughout " + COMPANY.serviceAreaLong + " from our showroom at " + COMPANY.address + ". Delivery fees are calculated from our Shelton warehouse based on distance."
        },
        {
          question: "How do deposits and payment work?",
          answer: "Reserve online with a deposit (typically 50%) or pay in full at checkout. Payment is processed securely through Stripe. The remaining balance is due before delivery unless you paid in full."
        },
        {
          question: "What about damage, rain, or changes?",
          answer: "Please review our rental agreement at checkout. Report damage promptly; normal wear is expected. Need to add items? Contact us at least 72 hours before your delivery date. Cancellations and weather policies are covered in the agreement."
        },
        {
          question: "Do you have an event hall?",
          answer: "Yes — Prime Lux Event Hall at " + COMPANY.address + " hosts birthdays, showers, weddings, anniversaries, and more. Inquire via our contact form or call " + COMPANY.phone + " for availability."
        }
      ])
    }

    loadContent()
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-28">
      <p className="lux-label">Questions</p>
      <h1 className="mt-4 font-serif text-5xl font-medium leading-[0.95] md:text-7xl">
        {content['faq.hero.title'] || 'Frequently asked'}
      </h1>
      <p className="mt-5 text-base font-light leading-relaxed text-[var(--theme-muted)]">
        {content['faq.hero.description'] || 'Booking, delivery, deposits, and our Shelton showroom — answers for planning your rental.'}
      </p>

      <Accordion type="single" collapsible className="mt-12 border-t border-[var(--theme-dark)]/10">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-b border-[var(--theme-dark)]/10">
            <AccordionTrigger className="py-5 text-left font-serif text-2xl font-medium hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-base font-light leading-relaxed text-[var(--theme-muted)]">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-16 border-t border-[var(--theme-dark)]/10 pt-10">
        <h2 className="font-serif text-3xl font-medium">Still have a question?</h2>
        <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-[var(--theme-muted)]">
          Tell us the date and the room. We will answer with what is available.
        </p>
        <Link href="/contact" className="lux-cta mt-6">Write to us</Link>
      </div>
    </div>
  )
}

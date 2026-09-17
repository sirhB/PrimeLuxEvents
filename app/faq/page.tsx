"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getSiteContentClient } from "@/lib/content-client"
import { motion } from "framer-motion"
import { HelpCircle, MessageCircle, Clock, Sparkles, ArrowRight } from "lucide-react"
import { COMPANY } from "@/lib/company"
import Link from "next/link"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export default function FAQPage() {
  const [content, setContent] = useState<any>({})
  const [faqs, setFaqs] = useState<any[]>([])
  const reduceMotion = usePrefersReducedMotion()
  const motionProps = reduceMotion
    ? { initial: false as const, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } }

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
    <main className="min-h-screen bg-[#1A1A1A] text-white selection:bg-gold selection:text-black pt-32 pb-24 md:pt-48 md:pb-40 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gold/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-5 mix-blend-overlay pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            {...motionProps}
            transition={{ duration: reduceMotion ? 0 : 0.8 }}
            className="text-center mb-24 md:mb-32 space-y-8"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-gold/30" />
              <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Rental FAQ</span>
              <span className="w-12 h-px bg-gold/30" />
            </div>

            <h1 className="text-6xl md:text-9xl font-serif font-light tracking-tighter leading-[0.85]">
              {(content['faq.hero.title']?.trim().split(' ')[0] || 'Frequently')} <br />
              <span className="italic text-gold">{(content['faq.hero.title']?.trim().split(' ').slice(1).join(' ') || 'Asked')}</span>
            </h1>

            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
              {content['faq.hero.description'] || 'Booking, delivery, deposits, and our Shelton showroom — answers for planning your rental.'}
            </p>
          </motion.div>

          {/* FAQ Items */}
          <motion.div
            {...motionProps}
            transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.2 }}
            className="space-y-6"
          >
            <Accordion type="single" collapsible className="w-full space-y-6">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-white/5 rounded-2xl bg-[#1E1E1E]/50 backdrop-blur-sm overflow-hidden px-6 md:px-10 transition-all duration-300 hover:border-gold/20"
                >
                  <AccordionTrigger className="py-8 text-left hover:no-underline group">
                    <div className="flex items-start gap-6">
                      <span className="text-gold font-serif text-2xl opacity-40 group-hover:opacity-100 transition-opacity">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xl md:text-2xl font-serif font-light text-white group-hover:text-gold transition-colors duration-300 pr-8">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-8 pl-14 text-lg text-gray-400 font-light leading-relaxed max-w-2xl">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {!faqs || faqs.length === 0 && (
              <div className="text-center py-40">
                <Sparkles className="h-16 w-16 text-gold/20 mx-auto mb-8" />
                <h3 className="text-2xl font-serif text-white mb-4">The Curtain Rises Soon</h3>
                <p className="text-gray-500 font-light">We are preparing our intelligence briefing.</p>
              </div>
            )}
          </motion.div>

          {/* Support CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-32 p-12 rounded-[2rem] border border-white/5 bg-gradient-to-br from-[#1E1E1E] to-transparent text-center relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <HelpCircle className="w-12 h-12 text-gold mx-auto mb-8 stroke-[1]" />
            <h2 className="text-3xl md:text-4xl font-serif font-light text-white mb-6">Still have questions?</h2>
            <p className="text-gray-400 font-light mb-10 max-w-lg mx-auto leading-relaxed">
              Our concierge team is available for private consultations to discuss your specific requirements in detail.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-4 bg-gold text-black px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 hover:scale-105 active:scale-95"
            >
              Inquire Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  )
}


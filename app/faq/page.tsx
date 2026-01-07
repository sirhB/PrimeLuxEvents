"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getSiteContentClient } from "@/lib/content-client"
import { motion } from "framer-motion"
import { HelpCircle, MessageCircle, Clock, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

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
          answer: "For larger weddings and corporate galas, we recommend booking 12-18 months in advance. For social gatherings and smaller events, 6-9 months is typically sufficient. However, we always welcome last-minute inquiries and will do our best to accommodate your schedule."
        },
        {
          question: "Do you offer full-service planning?",
          answer: "Yes, we specialize in comprehensive, end-to-end planning. This includes venue selection, vendor management, design concept development, logistics, and on-site coordination. We also offer partial planning for clients who have already secured some elements."
        },
        {
          question: "What is your typical budget range?",
          answer: "As a luxury event firm, our clients typically invest between $50,000 and $500,000+ per event. We work closely with you to maximize your investment and ensure every dollar contributes to an extraordinary guest experience."
        },
        {
          question: "Can you help with destination events?",
          answer: "Absolutely. Our team has extensive experience coordinating luxury events globally. Whether it's a private villa in Tuscany or a beachside celebration in St. Barts, we handle all travel logistics, local vendor vetting, and cultural considerations."
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
      <div className="absolute inset-0 bg-[url('/images/luxury-texture.png')] opacity-5 mix-blend-overlay pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24 md:mb-32 space-y-8"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-gold/30" />
              <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Curated Intelligence</span>
              <span className="w-12 h-px bg-gold/30" />
            </div>

            <h1 className="text-6xl md:text-9xl font-serif font-light tracking-tighter leading-[0.85]">
              {(content['faq.hero.title']?.trim().split(' ')[0] || 'Frequently')} <br />
              <span className="italic text-gold">{(content['faq.hero.title']?.trim().split(' ').slice(1).join(' ') || 'Asked')}</span>
            </h1>

            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
              {content['faq.hero.description'] || 'Discover the finer details of our bespoke event orchestration and concierge services.'}
            </p>
          </motion.div>

          {/* FAQ Items */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
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


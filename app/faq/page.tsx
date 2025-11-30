"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getSiteContentClient } from "@/lib/content-client"
import { motion } from "framer-motion"
import { HelpCircle, MessageCircle, Clock } from "lucide-react"

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
          answer: "We recommend booking as soon as you have your date and venue secured. For peak seasons (spring and fall), we suggest booking 6-9 months in advance to ensure availability of your desired items."
        },
        {
          question: "How long is the rental period?",
          answer: "Our standard rental period is 24 hours. We typically deliver on the day of the event and pick up the following day."
        },
        {
          question: "Do you offer delivery and setup?",
          answer: "We offer professional delivery to your venue. Standard delivery includes drop-off at a designated area. Full setup and installation is available for an additional fee."
        },
        {
          question: "What is your cancellation policy?",
          answer: "Orders cancelled more than 30 days prior to the event date are eligible for a full refund less a 10% administrative fee. Cancellations made within 30 days of the event are subject to a 50% cancellation fee."
        }
      ])
    }

    loadContent()
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/20 via-background to-secondary/10">
        {/* Background Pattern */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />

        <div className="container relative z-10 px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-8"
            >
              <HelpCircle className="h-4 w-4" />
              Frequently Asked Questions
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-6xl md:text-8xl font-serif font-light tracking-tight text-foreground text-center mb-6"
            >
              {content['faq.hero.title'] || 'Frequently Asked Questions'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto text-center mb-12"
            >
              {content['faq.hero.description'] || 'Everything you need to know about renting with PrimeLux Events.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Clock className="h-4 w-4" />
                <span>Quick answers to common questions</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-8"
            >
              <MessageCircle className="h-4 w-4" />
              Your Questions Answered
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
              Everything You Need to Know
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Find answers to common questions about our rental process and services.
            </p>
          </motion.div>

          {faqs && faqs.length > 0 ? (
            faqs.map((faq: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={`item-${index}`} className="border border-border/40 rounded-xl px-6 bg-background/50 backdrop-blur-sm shadow-lg hover:shadow-gold/5 mb-6 data-[state=open]:border-gold/30 transition-all duration-300">
                    <AccordionTrigger className="text-lg md:text-xl font-medium hover:text-gold transition-colors py-8 text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base md:text-lg leading-relaxed pb-8 font-light">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto">
                <HelpCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-serif mb-2">No FAQs found</h3>
                <p className="text-muted-foreground">Check back soon for frequently asked questions.</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}

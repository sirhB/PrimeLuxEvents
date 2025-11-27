"use client"

import { motion } from "framer-motion"
import { FileText, Shield, Clock, DollarSign, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RentalAgreementPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/20 via-background to-secondary/10">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
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
              <FileText className="h-4 w-4" />
              Rental Agreement
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-6xl md:text-8xl font-serif font-light tracking-tight text-foreground mb-6"
            >
              Terms of Service
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto mb-12"
            >
              Please read our rental agreement carefully before proceeding with your booking.
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
                <Shield className="h-4 w-4" />
                <span>Last updated: December 2024</span>
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

      {/* Content Section */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="prose prose-lg max-w-none"
          >
            <div className="space-y-12">
              {/* Introduction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-secondary/30 p-8 rounded-xl border border-border/40"
              >
                <h2 className="text-2xl font-serif mb-4 text-foreground">Agreement Overview</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  This Rental Agreement ("Agreement") is between PrimeLux Events ("Company") and the individual or entity
                  ("Renter") identified in the rental order. By proceeding with a rental, the Renter agrees to be bound by
                  the terms and conditions set forth herein.
                </p>
                <div className="flex items-center gap-2 text-gold text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Please read carefully before signing</span>
                </div>
              </motion.div>

              {/* Key Terms */}
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-background/50 p-6 rounded-lg border border-border/40"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-6 w-6 text-gold" />
                    <h3 className="text-xl font-serif text-foreground">Rental Period</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Standard rental period is 24 hours. Delivery occurs on the event date and pickup the following day.
                    Extended rentals or custom scheduling may incur additional fees.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-background/50 p-6 rounded-lg border border-border/40"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="h-6 w-6 text-gold" />
                    <h3 className="text-xl font-serif text-foreground">Payment Terms</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    A 50% non-refundable deposit is required to secure items. The remaining balance is due 14 days
                    prior to the event. Late payments may result in cancellation.
                  </p>
                </motion.div>
              </div>

              {/* Terms and Conditions */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-serif text-foreground">Terms and Conditions</h2>

                <div className="space-y-6">
                  <div className="border-l-4 border-gold pl-6">
                    <h3 className="text-xl font-serif mb-3 text-foreground">1. Rental Items & Condition</h3>
                    <ul className="text-muted-foreground space-y-2 leading-relaxed">
                      <li>• All items are inspected and cleaned before delivery</li>
                      <li>• Normal wear and tear is covered by our damage waiver</li>
                      <li>• Significant damage, loss, or theft is the responsibility of the Renter</li>
                      <li>• Replacement costs will be charged for damaged or missing items</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-gold pl-6">
                    <h3 className="text-xl font-serif mb-3 text-foreground">2. Delivery & Setup</h3>
                    <ul className="text-muted-foreground space-y-2 leading-relaxed">
                      <li>• Professional delivery within our service area</li>
                      <li>• Drop-off at designated location unless setup services are purchased</li>
                      <li>• Setup services include placement and basic styling</li>
                      <li>• Additional fees apply for setup and long-distance delivery</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-gold pl-6">
                    <h3 className="text-xl font-serif mb-3 text-foreground">3. Cancellation Policy</h3>
                    <ul className="text-muted-foreground space-y-2 leading-relaxed">
                      <li>• Cancellations more than 30 days prior: Full deposit refund minus 10% administrative fee</li>
                      <li>• Cancellations 7-30 days prior: 50% cancellation fee</li>
                      <li>• Cancellations within 7 days: No refund</li>
                      <li>• Weather-related cancellations are handled on a case-by-case basis</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-gold pl-6">
                    <h3 className="text-xl font-serif mb-3 text-foreground">4. Insurance & Liability</h3>
                    <ul className="text-muted-foreground space-y-2 leading-relaxed">
                      <li>• Mandatory damage waiver covers minor wear and tear</li>
                      <li>• Renter assumes responsibility for gross negligence or misuse</li>
                      <li>• Additional event insurance is recommended</li>
                      <li>• Company is not liable for indirect or consequential damages</li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Important Notice */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-gold/5 p-8 rounded-xl border border-gold/20"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-gold mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-serif mb-3 text-foreground">Important Notice</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      By proceeding with your rental, you acknowledge that you have read, understood, and agree to
                      be bound by all terms and conditions outlined in this agreement. If you have any questions
                      about these terms, please contact us before placing your order.
                    </p>
                    <p className="text-muted-foreground text-sm">
                      This agreement constitutes the entire understanding between the parties and supersedes all
                      prior agreements, whether written or oral, relating to the subject matter hereof.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-center pt-8"
              >
                <h3 className="text-xl font-serif mb-4 text-foreground">Questions About This Agreement?</h3>
                <p className="text-muted-foreground mb-6">
                  Contact our team if you need clarification on any terms or conditions.
                </p>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-border/50 hover:border-gold hover:bg-gold/5 transition-all duration-300">
                  <Link href="/contact">
                    Contact Support
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

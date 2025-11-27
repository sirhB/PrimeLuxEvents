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
              PrimeLux Events
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto mb-12"
            >
              This Contract is executed between PrimeLux Events (the "Company") and the Renter.
              Acceptance of the rental order binds the Renter to the entirety of these terms.
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
                <span>Effective Date: November 2025</span>
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
                <p className="text-muted-foreground leading-relaxed mb-4">
                  This Contract is executed between PrimeLux Events (the "Company") and the Renter. Acceptance of the rental order binds the Renter to the entirety of these terms.
                </p>
                <div className="flex items-center gap-2 text-gold text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Please read carefully before proceeding</span>
                </div>
              </motion.div>

              {/* Contract Sections */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-8"
              >
                {/* I. Contract Execution & Financial Terms */}
                <div className="bg-background/50 p-8 rounded-xl border border-border/40">
                  <h2 className="text-2xl font-serif mb-6 text-foreground border-b border-border/40 pb-2">I. Contract Execution & Financial Terms</h2>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Showroom Consultations</h3>
                        <p className="text-muted-foreground text-sm">Located in Shelton, CT. While walk-ins are accommodated, pre-scheduled appointments are strongly recommended to ensure dedicated attention from an Event Consultant.</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Rental Duration</h3>
                        <p className="text-muted-foreground text-sm">Standard engagements are for 24 hours. Custom or extended periods will incur specific scheduling fees.</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Pricing & Inventory</h3>
                        <p className="text-muted-foreground text-sm">All pricing, item selection, and availability are subject to immediate revision.</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Reservation Deposit</h3>
                        <p className="text-muted-foreground text-sm">A non-refundable 50% deposit is required to secure all items.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gold">Final Settlement</h3>
                      <p className="text-muted-foreground text-sm">The remaining balance is due in full seven (7) days prior to the delivery date. Failure to remit payment by this deadline grants the Company the right to cancel the order without deposit refund or apply late charges at the maximum lawful rate per Connecticut statute.</p>
                    </div>
                  </div>
                </div>

                {/* II. Equipment Condition & Accountability */}
                <div className="bg-background/50 p-8 rounded-xl border border-border/40">
                  <h2 className="text-2xl font-serif mb-6 text-foreground border-b border-border/40 pb-2">II. Equipment Condition & Accountability</h2>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Inspection & Care</h3>
                        <p className="text-muted-foreground text-sm">All equipment is rigorously inspected and sanitized before dispatch. The mandatory damage waiver covers minor, expected wear and tear only.</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Renter Accountability</h3>
                        <p className="text-muted-foreground text-sm">The Renter assumes full financial responsibility for significant damage, theft, or loss (including Acts of God). Replacement costs will be charged directly.</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Condition Assessment</h3>
                        <p className="text-muted-foreground text-sm">The Company reserves 72 hours following possession retrieval to formally assess the equipment's condition and determine liability for damages incurred during the rental period.</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Aesthetic Quality (Linens)</h3>
                        <p className="text-muted-foreground text-sm">Due to inherent material variances and digital display effects, exact color matching is not guaranteed. On-site inspection at the showroom is advised.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* III. Logistics: Delivery, Pickup, & Will-Call */}
                <div className="bg-background/50 p-8 rounded-xl border border-border/40">
                  <h2 className="text-2xl font-serif mb-6 text-foreground border-b border-border/40 pb-2">III. Logistics: Delivery, Pickup, & Will-Call</h2>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Standard Scheduling</h3>
                        <p className="text-muted-foreground text-sm">Deliveries typically occur 1–2 days before the event, with pickup 1–2 days following. Standard service hours are M–F, 9:00 AM–5:00 PM (in-season) or 9:00 AM–4:00 PM (off-season).</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Non-Standard Fees</h3>
                        <p className="text-muted-foreground text-sm">Additional fees apply for service outside standard hours, precise time windows, weekend logistics, or late-night retrievals.</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Minimum Order</h3>
                        <p className="text-muted-foreground text-sm">Delivery service requires a minimum equipment rental cost of $250.00 (excluding labor and fees).</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Delivery Window</h3>
                        <p className="text-muted-foreground text-sm">A minimum two (2) hour window is required. The Renter may contact us on the delivery morning for an estimated 2–3 hour arrival window.</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Renter Presence</h3>
                        <p className="text-muted-foreground text-sm">The Renter must be available for the entire window. After a 15-minute grace period, a waiting fee of up to $120.00 per hour will be assessed.</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Curbside Standard</h3>
                        <p className="text-muted-foreground text-sm">Delivery is to a ground-level, hard surface, obstruction-free location within 25 feet of the loading area. Equipment will be securely stacked.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gold">Excess Labor Charges</h3>
                      <p className="text-muted-foreground text-sm">Additional fees (up to $120.00/hour) apply for conditions that impede standard delivery (e.g., stairs, uneven terrain, rush orders, or inaccurate directions).</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Will-Call Location</h3>
                        <p className="text-muted-foreground text-sm">Customer pickup and return are available at our Shelton, CT warehouse for select, smaller orders.</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Will-Call Liability</h3>
                        <p className="text-muted-foreground text-sm">The Renter assumes all liability for will-call items from the moment they leave the facility. The Renter is responsible for securing, loading, and unloading all items. Failure to pick up the order may result in a minimum 50% rental fee charge.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gold">Setup & Breakdown</h3>
                      <p className="text-muted-foreground text-sm">Available for an additional fee. If the Renter is unavailable, the Company may setup as deemed appropriate or leave items curbside; no refund is issued, and the Renter assumes full liability for unsupervised equipment.</p>
                    </div>
                  </div>
                </div>

                {/* IV. Post-Use Protocols */}
                <div className="bg-background/50 p-8 rounded-xl border border-border/40">
                  <h2 className="text-2xl font-serif mb-6 text-foreground border-b border-border/40 pb-2">IV. Post-Use Protocols</h2>
                  <p className="text-muted-foreground leading-relaxed">The Renter is responsible for basic preparation prior to pickup:</p>
                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gold">China/Flatware/Glassware:</h3>
                      <p className="text-muted-foreground text-sm">All food debris must be scraped/rinsed, and liquids emptied. Return to designated crates.</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gold">Linens:</h3>
                      <p className="text-muted-foreground text-sm">Shake clear of debris and ensure dryness. Return in clear plastic bags.</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gold">Furniture:</h3>
                      <p className="text-muted-foreground text-sm">Tables and chairs must be broken down and stacked for driver retrieval in the same manner as delivered.</p>
                    </div>
                  </div>
                </div>

                {/* V. Cancellation & Adjustments */}
                <div className="bg-background/50 p-8 rounded-xl border border-border/40">
                  <h2 className="text-2xl font-serif mb-6 text-foreground border-b border-border/40 pb-2">V. Cancellation & Adjustments</h2>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Deposit Forfeiture</h3>
                        <p className="text-muted-foreground text-sm">The 50% reservation deposit is non-refundable regardless of the cancellation reason or timing.</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gold">Order Adjustments</h3>
                        <p className="text-muted-foreground text-sm">Reductions to non-specialty items are permitted up to seven (7) days before delivery, provided the contract price does not fall below the forfeited 50% deposit amount.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gold">Specialty Items</h3>
                      <p className="text-muted-foreground text-sm">Items requiring custom manufacturing, sub-rental, or purchase (including heaters) are fully non-refundable once ordered or production commences.</p>
                    </div>
                  </div>
                </div>

                {/* VI. Indemnification & Liability */}
                <div className="bg-background/50 p-8 rounded-xl border border-border/40">
                  <h2 className="text-2xl font-serif mb-6 text-foreground border-b border-border/40 pb-2">VI. Indemnification & Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The Renter shall take all necessary precautions for the rented items and protect all persons and property from harm. The Renter agrees to indemnify and hold PrimeLux Events harmless from and against all liability, claims, losses, or costs (including legal fees) arising from the use, installation, operation, or possession of the rented equipment, regardless of cause.
                  </p>
                </div>
              </motion.div>

              {/* Important Notice */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-gold/5 p-8 rounded-xl border border-gold/20"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-gold mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-serif mb-3 text-foreground">Important Notice</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      By proceeding with your rental order, you acknowledge that you have read, understood, and agree to
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
                transition={{ duration: 0.6, delay: 0.9 }}
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

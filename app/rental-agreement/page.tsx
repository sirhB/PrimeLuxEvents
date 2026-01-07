"use client"

import { motion } from "framer-motion"
import { FileText, Shield, Clock, DollarSign, AlertTriangle, CheckCircle, ArrowRight, BookOpen, Scale, Truck, RotateCcw, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RentalAgreementPage() {
  const handlePrint = () => {
    window.print()
  }
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-gold selection:text-black font-sans print:bg-white print:text-black rental-agreement-container">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          .rental-agreement-container * {
            color: black !important;
            background-color: transparent !important;
            border-color: #ddd !important;
          }
          .rental-agreement-container .bg-gold,
          .rental-agreement-container .bg-gold\\/10,
          .rental-agreement-container .bg-white\\/10,
          .rental-agreement-container .bg-white\\/\\[0\\.02\\] {
            background-color: transparent !important;
            border: 1px solid #ddd !important;
          }
          .rental-agreement-container h1, 
          .rental-agreement-container h2, 
          .rental-agreement-container h3, 
          .rental-agreement-container h4 {
            color: black !important;
          }
          .rental-agreement-container .text-gold,
          .rental-agreement-container .text-gold\\/90,
          .rental-agreement-container .text-gray-400,
          .rental-agreement-container .text-gray-500 {
            color: black !important;
          }
        }
      `}} />
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-gold/3 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/images/luxury-texture.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-white/5">
        <div className="container relative z-10 px-4 md:px-6 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-8 backdrop-blur-md">
              <FileText className="h-3.5 w-3.5" />
              Legal Framework
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-extralight tracking-tight text-white mb-8 leading-[1.1]">
              Rental <span className="italic text-gold/90">Agreement</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto mb-12">
              Our commitment to excellence is matched by our clear terms of engagement.
              Please review these standard conditions for PrimeLux Events collections.
            </p>

            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 print:text-black">
              <Shield className="h-4 w-4 text-gold/60 print:text-black" />
              Effective as of January 2026
            </div>

            <Button
              onClick={handlePrint}
              variant="outline"
              className="mt-12 h-14 px-8 rounded-full border-white/10 hover:border-gold hover:bg-gold/5 text-white transition-all duration-500 font-bold tracking-widest uppercase text-[10px] print:hidden"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Agreement
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-24 md:py-32 z-10 print:py-0">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-12"
          >
            {/* Introductory Clause */}
            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute inset-0 bg-gold/5 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 print:hidden" />
              <div className="relative p-10 md:p-12 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl print:bg-white print:border-black print:text-black">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="h-16 w-16 rounded-2xl bg-gold/10 flex items-center justify-center flex-shrink-0 border border-gold/20 print:border-black print:bg-white">
                    <BookOpen className="h-8 w-8 text-gold print:text-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-serif font-light text-white mb-6 print:text-black">Execution & Acceptance</h2>
                    <p className="text-gray-400 leading-relaxed text-lg font-light print:text-black">
                      This enforceable contract is executed between <span className="text-white font-normal print:text-black">PrimeLux Events</span> (the "Company") and the <span className="text-white font-normal print:text-black">Renter</span>.
                      Acceptance of any rental order—whether processed online, via invoice, or in person—binds the Renter
                      to the entirety of these terms. These conditions ensure the preservation of our curated collection
                      for all clients.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section I: Financials */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-4 sticky top-24 print:static">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px w-8 bg-gold print:bg-black" />
                  <span className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase print:text-black">Section I</span>
                </div>
                <h3 className="text-3xl font-serif font-light text-white mb-6 print:text-black">Financial Commitments</h3>
                <p className="text-gray-500 font-light text-sm leading-relaxed print:text-black">
                  Clear parameters for deposits, final settlements, and inventory reservations.
                </p>
              </div>

              <div className="md:col-span-8 space-y-6">
                {[
                  {
                    title: "Reservation Deposit",
                    content: "A non-refundable 50% deposit is required at point of engagement to secure curated items. This ensures inventory exclusivity for your event date."
                  },
                  {
                    title: "Final Settlement",
                    content: "Remaining balances are due seven (7) days prior to delivery. Late settlements may trigger automatic cancellation without refund or incur statutory late charges."
                  },
                  {
                    title: "Showroom Consultations",
                    content: "Located in Shelton, CT. While we welcome discovery, pre-scheduled appointments ensure dedicated attention from our designers."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-gold/30 transition-all duration-500 print:bg-white print:border-black print:text-black">
                    <h4 className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-4 print:text-black font-bold">{item.title}</h4>
                    <p className="text-gray-400 font-light leading-relaxed print:text-black">{item.content}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="py-12">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </motion.div>

            {/* Section II: Accountability */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-4 md:order-2 md:sticky md:top-24 print:static">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px w-8 bg-gold print:bg-black" />
                  <span className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase print:text-black">Section II</span>
                </div>
                <h3 className="text-3xl font-serif font-light text-white mb-6 print:text-black">Condition & Accountability</h3>
                <p className="text-gray-500 font-light text-sm leading-relaxed print:text-black">
                  Our inventory is meticulously maintained. We expect a reciprocal level of care during your stewardship.
                </p>
              </div>

              <div className="md:col-span-8 md:order-1 space-y-6">
                {[
                  {
                    title: "Mandatory Damage Waiver",
                    content: "Covers minor, expected wear. It does not indemnify against structural damage, neglect, theft, or exposure to elements."
                  },
                  {
                    title: "Renter Liability",
                    content: "Renters assume total financial responsibility from point of possession transfer until verified retrieval. Replacement costs for lost or destroyed assets are billed at current market value."
                  },
                  {
                    title: "Assessment Grace Period",
                    content: "The Company reserves 72 hours post-retrieval for formal auditing and condition assessment before final liability is determined."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-gold/30 transition-all duration-500 print:bg-white print:border-black print:text-black">
                    <h4 className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-4 print:text-black font-bold">{item.title}</h4>
                    <p className="text-gray-400 font-light leading-relaxed print:text-black">{item.content}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Section III: Logistics (Gold Card) */}
            <motion.div variants={itemVariants} className="relative py-12 print:py-6">
              <div className="p-10 md:p-16 rounded-[3rem] bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 backdrop-blur-2xl print:bg-white print:border-black print:text-black">
                <div className="flex flex-col lg:flex-row gap-12">
                  <div className="lg:w-1/3">
                    <div className="h-16 w-16 rounded-2xl bg-gold text-black flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(212,175,55,0.3)] print:bg-white print:border print:border-black">
                      <Truck className="h-8 w-8" />
                    </div>
                    <h3 className="text-4xl font-serif font-light text-white mb-6 leading-tight print:text-black">Elite Logistics & Delivery</h3>
                    <p className="text-gray-400 font-light leading-relaxed print:text-black">
                      White-glove service is our standard. We require specific conditions to ensure safe transfer.
                    </p>
                  </div>
                  <div className="lg:w-2/3 grid sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <span className="inline-block px-3 py-1 rounded bg-gold/20 text-gold text-[9px] font-bold uppercase tracking-widest print:text-black print:border print:border-black print:bg-white">Efficiency</span>
                      <p className="text-gray-300 text-sm leading-relaxed font-light print:text-black">
                        A minimum two-hour window is required. We provide refined estimates on the morning of deployment to ensure your team is ready.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <span className="inline-block px-3 py-1 rounded bg-gold/20 text-gold text-[9px] font-bold uppercase tracking-widest print:text-black print:border print:border-black print:bg-white">Ground Level</span>
                      <p className="text-gray-300 text-sm leading-relaxed font-light print:text-black">
                        Curbside delivery is standard. Stairs, elevators, and long-haul distances incur additional labor assessments by our field crew.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <span className="inline-block px-3 py-1 rounded bg-gold/20 text-gold text-[9px] font-bold uppercase tracking-widest print:text-black print:border print:border-black print:bg-white">Will-Call</span>
                      <p className="text-gray-300 text-sm leading-relaxed font-light print:text-black">
                        Available at our Shelton facility for select collections. Renter assumes all liability and labor for loading and securing at pickup.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <span className="inline-block px-3 py-1 rounded bg-gold/20 text-gold text-[9px] font-bold uppercase tracking-widest print:text-black print:border print:border-black print:bg-white">Minimum Order</span>
                      <p className="text-gray-300 text-sm leading-relaxed font-light print:text-black">
                        Delivery engagements require a $250.00 equipment minimum (excluding fees and tax) to sustain our standard of service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section IV: Post-Use */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-4 sticky top-24 print:static">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px w-8 bg-gold print:bg-black" />
                  <span className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase print:text-black">Section IV</span>
                </div>
                <h3 className="text-3xl font-serif font-light text-white mb-6 print:text-black">Possession Reversal</h3>
                <p className="text-gray-500 font-light text-sm leading-relaxed print:text-black">
                  Protocols for returning items to our facility.
                </p>
              </div>

              <div className="md:col-span-8 space-y-4">
                {[
                  { icon: Scale, label: "China & Glassware", desc: "Scraped, rinsed, and liquid-free. Return to architectural crates as provided." },
                  { icon: RotateCcw, label: "Linens", desc: "Shake free of debris and ensure dryness. Return in provided garment bags to avoid mildew." },
                  { icon: Clock, label: "Furniture", desc: "Stacked and ready for retrieval in the same location as original deployment." },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 p-6 rounded-2xl bg-white/[0.01] border border-white/5 items-center group hover:bg-white/[0.03] transition-all duration-300 print:bg-white print:border-black print:text-black">
                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-colors print:border-black">
                      <item.icon className="h-5 w-5 text-gold/80 print:text-black" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1 print:text-black">{item.label}</h4>
                      <p className="text-gray-400 text-sm font-light print:text-black">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Final Notice & Warning */}
            <motion.div variants={itemVariants} className="mt-12 text-center max-w-3xl mx-auto space-y-12">
              <div className="p-1 border border-gold/20 rounded-full inline-block print:hidden">
                <div className="px-6 py-2 bg-gold/10 rounded-full text-gold text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
                  Legal Acknowledgement
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-3xl md:text-4xl font-serif font-light text-white print:text-black">Understanding Your Engagement</h3>
                <p className="text-gray-400 font-light leading-relaxed text-lg print:text-black">
                  By confirming your selection, you acknowledge that you have read and accepted these terms in full.
                  This agreement constitutes the complete understanding between PrimeLux Events and the Renter.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 print:hidden">
                <Button
                  onClick={handlePrint}
                  className="h-16 px-10 rounded-full bg-white text-black hover:bg-gold transition-all duration-500 font-bold tracking-widest uppercase text-[10px]"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print for Records
                </Button>
                <Button asChild className="h-16 px-10 rounded-full bg-gold text-black hover:bg-white transition-all duration-500 font-bold tracking-widest uppercase text-[10px]">
                  <Link href="/catalog">
                    Return to Collection
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-16 px-10 rounded-full border-white/10 hover:border-gold hover:bg-gold/5 text-white transition-all duration-500 font-bold tracking-widest uppercase text-[10px]">
                  <Link href="/contact" className="flex items-center gap-2">
                    Inquire for Details <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer Decoration */}
      <div className="py-24 border-t border-white/5 text-center">
        <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-gray-600">
          PrimeLux Events • Luxury Rental Provisions
        </p>
      </div>
    </div>
  )
}

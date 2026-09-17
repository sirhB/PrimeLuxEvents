"use client"

import { motion, useScroll } from "framer-motion"
import { useRef } from "react"

const steps = [
  {
    id: 1,
    title: "Browse",
    description: "Explore furniture, lighting, tents, and décor in the online catalog.",
  },
  {
    id: 2,
    title: "Select",
    description: "Add pieces to your quote and set quantities for your guest count.",
  },
  {
    id: 3,
    title: "Reserve",
    description: "Submit your date. We confirm availability and send a clear proposal.",
  },
  {
    id: 4,
    title: "We deliver",
    description: "Delivery and setup are handled so you can focus on the celebration.",
  },
]

export function InteractiveProcess() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  })

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative overflow-hidden bg-background py-24 text-foreground md:py-36"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-16 max-w-2xl md:mb-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lux-label mb-4"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="font-serif text-4xl font-light tracking-tight md:text-6xl"
          >
            From browse to delivery
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-base font-light leading-relaxed text-muted-foreground md:text-lg"
          >
            Four clear steps to reserve rentals for your event date.
          </motion.p>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 hidden h-px w-full bg-border md:block" />
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="absolute left-0 top-0 hidden h-px w-full origin-left bg-[var(--champagne)] md:block"
          />

          <ol className="grid grid-cols-1 gap-0 md:grid-cols-4 md:gap-0">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className="border-t border-border py-8 md:border-t-0 md:border-l md:border-border md:px-6 md:pt-10 md:first:border-l-0 md:first:pl-0"
              >
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                >
                  <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--champagne)]">
                    0{step.id}
                  </p>
                  <h3 className="mb-3 font-serif text-2xl font-light tracking-tight md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="max-w-xs text-sm font-light leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

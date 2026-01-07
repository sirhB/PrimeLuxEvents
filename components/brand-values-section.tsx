"use client"

import { ShieldCheck, Sparkles, Clock, HeartHandshake, Diamond, Star, Award, Shield } from "lucide-react"
import { motion } from "framer-motion"

const defaultValues = [
  {
    icon: Diamond,
    title: "Curated Excellence",
    description:
      "Every piece in our collection is hand-selected for its craftsmanship, aesthetic appeal, and ability to transform a space.",
  },
  {
    icon: Award,
    title: "Uncompromising Quality",
    description:
      "We maintain our inventory to the highest standards. Each item is inspected and perfected before it arrives at your event.",
  },
  {
    icon: Clock,
    title: "Seamless Logistics",
    description:
      "Our white-glove delivery team handles every detail of transport and setup, ensuring a stress-free experience.",
  },
  {
    icon: HeartHandshake,
    title: "Personalized Service",
    description:
      "We believe in building relationships. Our dedicated consultants work closely with you to bring your unique vision to life.",
  },
]

interface BrandValuesSectionProps {
  title?: string
  description?: string
  items?: Array<{
    title: string
    description: string
  }>
}

export function BrandValuesSection({
  title = "The PrimeLux Standard",
  description = "We don't just rent furniture; we curate experiences. Our commitment to excellence sets the foundation for unforgettable events.",
  items,
}: BrandValuesSectionProps) {
  const displayValues = items
    ? items.map((item, index) => ({
      ...item,
      icon: defaultValues[index % defaultValues.length].icon
    }))
    : defaultValues

  return (
    <section className="py-24 md:py-40 bg-[#FDFBF7] relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-gold/50 to-transparent" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-4 block"
          >
            Our Philosophy
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-light mb-8 tracking-tight"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 font-light leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-8">
          {displayValues.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="h-20 w-20 rounded-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-border/5">
                <value.icon className="h-8 w-8 text-gold stroke-[1.5]" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4 tracking-tight group-hover:text-gold transition-colors">{value.title}</h3>
              <p className="text-gray-500 font-light leading-relaxed text-sm">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

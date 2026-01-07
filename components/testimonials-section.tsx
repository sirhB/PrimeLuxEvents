"use client"

import Image from "next/image"
import { Star, Quote } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  {
    quote:
      "PrimeLux transformed our wedding venue into a dream. The velvet lounge furniture was the talk of the night, and the service was impeccable.",
    author: "Isabella & Marcus",
    role: "Wedding at The Plaza",
    image: "/elegant-bride.png",
  },
  {
    quote:
      "As an event planner, I need partners I can rely on. PrimeLux delivers consistency, quality, and style every single time. They are my go-to.",
    author: "Sarah Jenkins",
    role: "Senior Planner, Elite Events",
    image: "/open-planner.png",
  },
  {
    quote:
      "The attention to detail is unmatched. From the initial consultation to the final pickup, the team was professional, punctual, and a joy to work with.",
    author: "David Chen",
    role: "Corporate Gala Organizer",
    image: "/diverse-executive-team.png",
  },
]

interface TestimonialsSectionProps {
  title?: string
  description?: string
  items?: Array<{
    quote: string
    author: string
    role: string
    image?: string
  }>
}

export function TestimonialsSection({
  title = "Client Stories",
  description = "Hear from those who have experienced the PrimeLux difference.",
  items = testimonials,
}: TestimonialsSectionProps) {
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
            Testimonials
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {items.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="relative bg-white p-12 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-border/5 group hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500"
            >
              <div className="absolute -top-6 left-12 w-12 h-12 bg-gold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Quote className="h-5 w-5 text-black fill-black" />
              </div>

              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                ))}
              </div>

              <blockquote className="text-xl font-serif font-light leading-relaxed mb-10 text-gray-800 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-4 pt-8 border-t border-gray-50">
                <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gray-100 border-2 border-white shadow-sm">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-serif font-bold text-gray-900">{testimonial.author}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gold">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

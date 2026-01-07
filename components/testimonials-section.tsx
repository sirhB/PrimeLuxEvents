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
  title = "Affirmations of Excellence",
  description = "Reflections from those who have entrusted PrimeLux with their most significant milestones.",
  items = testimonials,
}: TestimonialsSectionProps) {
  return (
    <section className="py-24 md:py-48 bg-[#1A1A1A] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-5 mix-blend-overlay pointer-events-none" />

      {/* Background Orbs */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <span className="h-px w-8 bg-gold/50" />
            <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Testimonials</span>
            <span className="h-px w-8 bg-gold/50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-7xl font-serif font-light mb-10 tracking-tight text-white leading-[1.1]"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-gray-400 font-light leading-relaxed max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {items.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white/5 backdrop-blur-sm p-12 rounded-[2.5rem] border border-white/5 group hover:border-gold/20 transition-all duration-700 shadow-2xl"
            >
              <div className="absolute -top-6 left-12 w-14 h-14 bg-gold rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.3)] group-hover:scale-110 group-hover:bg-white transition-all duration-700">
                <Quote className="h-6 w-6 text-black fill-black" />
              </div>

              <div className="flex gap-1.5 mb-10">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold opacity-80" />
                ))}
              </div>

              <blockquote className="text-2xl font-serif font-light leading-relaxed mb-12 text-white italic selection:bg-gold selection:text-black">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-5 pt-10 border-t border-white/10">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10 shadow-inner">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.author}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div>
                  <div className="font-serif text-lg font-light text-white tracking-wide">{testimonial.author}</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold mt-1">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

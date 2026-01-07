"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Search, MousePointerClick, CalendarCheck, PartyPopper, Sparkles, ShoppingBag, Send, GlassWater } from "lucide-react"

const steps = [
    {
        id: 1,
        title: "Browse Collection",
        description: "Explore our curated gallery of premium furniture, decor, and lighting.",
        icon: ShoppingBag,
    },
    {
        id: 2,
        title: "Select Favorites",
        description: "Add items to your quote cart and customize quantities for your event.",
        icon: MousePointerClick,
    },
    {
        id: 3,
        title: "Secure Your Date",
        description: "Submit your request. We'll confirm availability and send a custom proposal.",
        icon: Send,
    },
    {
        id: 4,
        title: "Celebrate in Style",
        description: "We handle delivery and setup so you can focus on enjoying your event.",
        icon: GlassWater,
    },
]

export function InteractiveProcess() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"],
    })

    return (
        <section ref={containerRef} className="py-24 md:py-40 bg-[#1A1A1A] text-white relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-full h-full bg-[url('/images/luxury-texture.png')] opacity-5 mix-blend-overlay" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-4 block"
                    >
                        The Process
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-serif font-light mb-8 tracking-tight"
                    >
                        Seamless Luxury Experience
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-400 font-light leading-relaxed"
                    >
                        From inspiration to celebration, we make the rental process effortless.
                    </motion.p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2 z-0" />
                    <motion.div
                        style={{ scaleX: scrollYProgress }}
                        className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gold -translate-y-1/2 z-0 origin-left"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                        {steps.map((step, index) => (
                            <ProcessStep key={step.id} step={step} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

function ProcessStep({ step, index }: { step: typeof steps[0]; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="flex flex-col items-center text-center group"
        >
            <div className="relative mb-10">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:bg-gold group-hover:border-gold group-hover:scale-110">
                    <step.icon className="w-8 h-8 text-gold group-hover:text-black transition-colors duration-500 stroke-[1.5]" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-[10px] font-bold text-gold">
                    0{step.id}
                </div>
            </div>
            <h3 className="text-xl font-serif font-bold mb-4 tracking-tight group-hover:text-gold transition-colors">{step.title}</h3>
            <p className="text-gray-400 text-sm font-light leading-relaxed max-w-[200px]">
                {step.description}
            </p>
        </motion.div>
    )
}

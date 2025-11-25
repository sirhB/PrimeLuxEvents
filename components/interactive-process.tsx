"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Search, MousePointerClick, CalendarCheck, PartyPopper } from "lucide-react"

const steps = [
    {
        id: 1,
        title: "Browse & Discover",
        description: "Explore our curated collection of premium furniture, decor, and lighting.",
        icon: Search,
    },
    {
        id: 2,
        title: "Select Your Favorites",
        description: "Add items to your quote cart and customize quantities for your event size.",
        icon: MousePointerClick,
    },
    {
        id: 3,
        title: "Secure Your Date",
        description: "Submit your quote request. We'll confirm availability and send a custom proposal.",
        icon: CalendarCheck,
    },
    {
        id: 4,
        title: "Celebrate in Style",
        description: "We handle delivery and setup so you can focus on enjoying your unforgettable event.",
        icon: PartyPopper,
    },
]

export function InteractiveProcess() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"],
    })

    return (
        <section ref={containerRef} className="py-32 bg-secondary/10 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-serif mb-6"
                    >
                        Seamless Luxury Experience
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-muted-foreground"
                    >
                        From inspiration to celebration, we make the rental process effortless.
                    </motion.p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
                    <motion.div
                        style={{ scaleX: scrollYProgress }}
                        className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-primary -translate-y-1/2 z-0 origin-left"
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
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="flex flex-col items-center text-center bg-background p-6 rounded-lg shadow-sm border border-border/50 relative group hover:-translate-y-2 transition-transform duration-300"
        >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <step.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
            </div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-2 text-xs font-bold text-muted-foreground border border-border rounded-full">
                0{step.id}
            </div>
            <h3 className="text-xl font-serif mb-3">{step.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
            </p>
        </motion.div>
    )
}

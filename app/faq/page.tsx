import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { getSiteContent } from "@/lib/content"
import { ChevronDown, HelpCircle } from "lucide-react"

export default async function FAQPage() {
  const content = await getSiteContent()
  const faqs = content['faq.list'] || []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Enhanced Hero Section */}
      <FAQHeroSection
        title={content['faq.hero.title']}
        description={content['faq.hero.description']}
      />

      {/* Enhanced FAQ Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="py-20 bg-background"
      >
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-12"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-flex items-center gap-2 text-primary text-sm font-medium tracking-widest uppercase mb-4 px-4 py-2 bg-primary/10 rounded-full"
            >
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq: any, index: number) => (
                <FAQItem
                  key={index}
                  faq={faq}
                  index={index}
                  delay={0.6 + index * 0.1}
                />
              ))}
            </Accordion>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  )
}

// Enhanced FAQ Hero Section with Parallax Effects
function FAQHeroSection({ title, description }: { title: string; description: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <div ref={containerRef} className="relative h-[50vh] min-h-[400px] w-full overflow-hidden bg-black">
      <motion.div style={{ y }} className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/70" />
      </motion.div>

      <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-4 md:px-6 z-10">
        <motion.div
          style={{ opacity }}
          className="max-w-4xl space-y-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif text-white tracking-tight leading-tight"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-light"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col items-center gap-4 pt-4"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-white/60">Find Your Answer</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-12 bg-gradient-to-b from-white/0 via-white/40 to-white/0"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// Enhanced FAQ Item Component with Animations
function FAQItem({ faq, index, delay }: { faq: any; index: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <AccordionItem
        value={`item-${index}`}
        className="bg-muted/20 border border-border/50 rounded-lg px-6 hover:bg-muted/30 hover:border-primary/20 transition-all duration-300 overflow-hidden"
      >
        <AccordionTrigger className="text-lg font-serif py-6 hover:text-primary transition-colors group-hover:no-underline">
          <motion.div
            className="flex items-center gap-3 w-full"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: delay + 0.1 }}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
            >
              <span className="text-xs font-bold text-primary">{index + 1}</span>
            </motion.div>
            <span className="text-left">{faq.question}</span>
          </motion.div>
        </AccordionTrigger>

        <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pl-11">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {faq.answer}
          </motion.div>
        </AccordionContent>
      </AccordionItem>
    </motion.div>
  )
}

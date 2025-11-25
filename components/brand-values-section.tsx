import { ShieldCheck, Sparkles, Clock, HeartHandshake } from "lucide-react"

const values = [
  {
    icon: Sparkles,
    title: "Curated Excellence",
    description:
      "Every piece in our collection is hand-selected for its craftsmanship, aesthetic appeal, and ability to transform a space.",
  },
  {
    icon: ShieldCheck,
    title: "Uncompromising Quality",
    description:
      "We maintain our inventory to the highest standards. Each item is inspected, cleaned, and perfected before it arrives at your event.",
  },
  {
    icon: Clock,
    title: "Seamless Logistics",
    description:
      "Our white-glove delivery team handles every detail of transport and setup, ensuring a stress-free experience from start to finish.",
  },
  {
    icon: HeartHandshake,
    title: "Personalized Service",
    description:
      "We believe in building relationships. Our dedicated design consultants work closely with you to bring your unique vision to life.",
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

const defaultValues = [
  {
    icon: Sparkles,
    title: "Curated Excellence",
    description:
      "Every piece in our collection is hand-selected for its craftsmanship, aesthetic appeal, and ability to transform a space.",
  },
  {
    icon: ShieldCheck,
    title: "Uncompromising Quality",
    description:
      "We maintain our inventory to the highest standards. Each item is inspected, cleaned, and perfected before it arrives at your event.",
  },
  {
    icon: Clock,
    title: "Seamless Logistics",
    description:
      "Our white-glove delivery team handles every detail of transport and setup, ensuring a stress-free experience from start to finish.",
  },
  {
    icon: HeartHandshake,
    title: "Personalized Service",
    description:
      "We believe in building relationships. Our dedicated design consultants work closely with you to bring your unique vision to life.",
  },
]

export function BrandValuesSection({
  title = "The PrimeLux Standard",
  description = "We don't just rent furniture; we curate experiences. Our commitment to excellence sets the foundation for unforgettable events.",
  items,
}: BrandValuesSectionProps) {
  // Merge passed items with default icons if possible, or just use defaults if no items passed
  // For simplicity in this demo, if items are passed via CMS (which don't have icons), we'll map them to the default icons by index

  const displayValues = items && Array.isArray(items)
    ? items.map((item, index) => ({
      ...item,
      icon: defaultValues[index % defaultValues.length].icon
    }))
    : defaultValues

  return (
    <section className="py-20 md:py-32 bg-background border-t border-border/40 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-serif mb-6">{title}</h2>
          <p className="text-lg text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {displayValues.map((value, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mb-2">
                <value.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-serif">{value.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

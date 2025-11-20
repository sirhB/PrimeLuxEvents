import { services } from "@/lib/data"

interface ServicesSectionProps {
  title?: string
  description?: string
  items?: Array<{
    title: string
    description: string
  }>
}

export function ServicesSection({
  title = "Our Services",
  description = "Beyond rentals, we provide comprehensive styling and logistical support to ensure your event is flawless.",
  items = services,
}: ServicesSectionProps) {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-serif mb-6">{title}</h2>
          <p className="text-lg text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((service, index) => (
            <div
              key={service.title}
              className="bg-background p-8 border border-border/50 hover:border-primary/20 transition-colors duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="font-serif text-xl mb-4">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

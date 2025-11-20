import Image from "next/image"
import { Star } from "lucide-react"

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

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif mb-6">Client Stories</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from those who have experienced the PrimeLux difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-background p-8 md:p-10 rounded-sm border border-border/40 shadow-sm">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-lg font-serif leading-relaxed mb-8">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-secondary">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

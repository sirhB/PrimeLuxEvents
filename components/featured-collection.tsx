import Link from "next/link"
import Image from "next/image"
import { products } from "@/lib/data"
import { ArrowRight } from "lucide-react"

export function FeaturedCollection() {
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4)

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 animate-fade-in-up">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Featured Rentals</h2>
            <p className="text-muted-foreground max-w-md">Hand-picked pieces that define luxury and elegance.</p>
          </div>
          <Link
            href="/catalog"
            className="group inline-flex items-center text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => (
            <Link
              key={product.id}
              href={`/catalog/${product.id}`}
              className="group block animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="font-serif text-lg group-hover:underline decoration-1 underline-offset-4">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

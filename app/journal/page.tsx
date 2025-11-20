import Image from "next/image"
import Link from "next/link"
import { journalPosts } from "@/lib/data"
import { ArrowRight } from "lucide-react"

export default function JournalPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 animate-fade-in-up">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif mb-4">The Edit</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Trends, inspiration, and expert advice from the world of luxury events.
            </p>
          </div>
        </div>

        <div className="grid gap-12 md:gap-16">
          {journalPosts.map((post, index) => (
            <article
              key={post.id}
              className="group grid md:grid-cols-2 gap-8 items-center animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div
                className={`relative aspect-[4/3] overflow-hidden bg-secondary ${index % 2 === 1 ? "md:order-2" : ""}`}
              >
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div
                className={`flex flex-col justify-center ${index % 2 === 1 ? "md:order-1 md:text-right items-end" : ""}`}
              >
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="uppercase tracking-widest">{post.category}</span>
                  <span className="w-px h-4 bg-border"></span>
                  <span>{post.date}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif mb-4 group-hover:text-primary transition-colors">
                  <Link href="#">{post.title}</Link>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">{post.excerpt}</p>
                <Link
                  href="#"
                  className="inline-flex items-center text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors group/link"
                >
                  Read Article
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

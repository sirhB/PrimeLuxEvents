"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function JournalPage() {
  const [content, setContent] = useState<any>({})

  useEffect(() => {
    import("@/lib/content-client").then((mod) => {
      mod.getSiteContent().then(setContent)
    })
  }, [])

  const posts = content['journal.posts'] || []

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-6xl font-serif mb-4">{content['journal.hero.title']}</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              {content['journal.hero.description']}
            </p>
          </div>
        </motion.div>

        <div className="grid gap-12 md:gap-16">
          {posts.map((post: any, index: number) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group grid md:grid-cols-2 gap-8 items-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className={`relative aspect-[4/3] overflow-hidden bg-secondary rounded-sm ${index % 2 === 1 ? "md:order-2" : ""}`}
              >
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </motion.div>
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
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  )
}

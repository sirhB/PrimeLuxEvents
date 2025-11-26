"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getSiteContent } from "@/lib/content"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function JournalPage() {
  const [content, setContent] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadContent() {
      const data = await getSiteContent()
      setContent(data)
      setLoading(false)
    }
    loadContent()
  }, [])

  if (loading) return null

  const posts = content['journal.posts'] || []

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  }

  return (
    <div className="py-20 md:py-32 bg-background min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8"
        >
          <div>
            <h1 className="text-5xl md:text-7xl font-serif mb-6 text-foreground">{content['journal.hero.title']}</h1>
            <p className="text-xl text-muted-foreground max-w-xl font-light leading-relaxed">
              {content['journal.hero.description']}
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-20 md:gap-24"
        >
          {posts.map((post: any, index: number) => (
            <motion.article
              key={post.id}
              variants={itemVariants}
              className="group grid md:grid-cols-2 gap-10 md:gap-16 items-center"
            >
              <div
                className={`relative aspect-[4/3] overflow-hidden bg-secondary rounded-sm shadow-lg ${index % 2 === 1 ? "md:order-2" : ""}`}
              >
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
              </div>
              <div
                className={`flex flex-col justify-center ${index % 2 === 1 ? "md:order-1 md:text-right items-end" : ""}`}
              >
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="uppercase tracking-widest text-gold">{post.category}</span>
                  <span className="w-px h-4 bg-border"></span>
                  <span>{post.date}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-serif mb-6 group-hover:text-gold transition-colors duration-300">
                  <Link href="#">{post.title}</Link>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8 max-w-md text-lg font-light">{post.excerpt}</p>
                <Link
                  href="#"
                  className="inline-flex items-center text-sm font-medium uppercase tracking-widest hover:text-gold transition-colors group/link"
                >
                  Read Article
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

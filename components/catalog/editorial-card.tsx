'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EditorialCardProps {
  href: string
  title: string
  meta: string
  imageUrl: string | null
  featured?: boolean
  eyebrow?: string
}

export function EditorialCard({ href, title, meta, imageUrl, featured = false, eyebrow }: EditorialCardProps) {
  const mediaRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const onMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduce || !mediaRef.current) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    mediaRef.current.style.transform = `translate3d(${x * -14}px, ${y * -18}px, 0) scale(1.08)`
  }

  const onLeave = () => {
    if (!mediaRef.current) return
    mediaRef.current.style.transform = 'translate3d(0, 0, 0) scale(1)'
  }

  return (
    <Link
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-sm border border-[var(--theme-dark)]/10 bg-[var(--theme-canvas)]',
        featured ? 'col-span-2 min-h-[22rem] lg:col-span-2' : 'col-span-1 min-h-[18rem]',
      )}
    >
      <div className="relative min-h-48 flex-1 overflow-hidden bg-[var(--theme-surface)]">
        {imageUrl ? (
          <div ref={mediaRef} className="absolute inset-[-8%] transition-transform duration-500 ease-out">
            <Image src={imageUrl} alt="" fill sizes={featured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 50vw, 25vw'} className="object-cover" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-muted)]">
            Image coming soon
          </div>
        )}
        {featured && (
          <span className="absolute left-4 top-4 bg-[var(--theme-accent)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--theme-on-accent)]">
            Featured
          </span>
        )}
        {featured && (
          <span className="absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--theme-accent)] text-[var(--theme-on-accent)]">
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
      <div className="px-4 py-5">
        {eyebrow && (
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--theme-accent-text)]">{eyebrow}</p>
        )}
        <h3 className="font-serif text-2xl font-light uppercase tracking-wide text-[var(--theme-dark)]">
          <span className="relative inline">
            {title}
            <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--theme-accent)] transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100" />
          </span>
        </h3>
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--theme-accent-text)]">{meta}</p>
      </div>
    </Link>
  )
}

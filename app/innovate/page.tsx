'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { innovateNavItems } from '@/lib/innovate/nav'
import { loadDrafts } from '@/lib/innovate/drafts'
import { formatCentsWithCommas } from '@/lib/format-money'
import { quoteTotalCents, type InnovateDraft } from '@/lib/innovate/types'

export default function InnovateHubPage() {
  const [drafts, setDrafts] = useState<InnovateDraft[]>([])

  useEffect(() => {
    setDrafts(loadDrafts())
  }, [])

  const tools = innovateNavItems.filter((item) => item.href !== '/innovate')

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 10% 0%, rgba(184,149,107,0.22), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 20%, rgba(138,154,139,0.18), transparent 50%)',
        }}
      />

      <section className="relative mx-auto max-w-6xl px-6 pb-10 pt-12 md:px-10 md:pt-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--champagne)]">
          Staff workspace
        </p>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-[var(--ink)] md:text-5xl">
          Innovate
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--ink)]/65 md:text-lg">
          Configure high-margin backdrops, atmospheric lighting, modular bars, and VIP
          check-in—then copy a live fabrication quote for the client conversation.
        </p>
      </section>

      <section className="relative mx-auto grid max-w-6xl gap-px bg-[var(--ink)]/10 px-6 md:grid-cols-2 md:px-10">
        {tools.map((tool, index) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex flex-col justify-between bg-[var(--linen)] p-8 transition-colors hover:bg-white/60"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div>
              <tool.icon className="h-5 w-5 text-[var(--champagne)] transition-transform duration-300 group-hover:scale-110" />
              <h2 className="mt-5 font-serif text-2xl text-[var(--ink)]">{tool.title}</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--ink)]/55">
                {tool.description}
              </p>
            </div>
            <span className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink)]/70 transition-transform duration-300 group-hover:translate-x-1">
              Open studio
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-14 md:px-10">
        <h2 className="font-serif text-2xl text-[var(--ink)]">Recent drafts</h2>
        <p className="mt-1 text-sm text-[var(--ink)]/50">
          Saved locally in this browser for quick client follow-ups.
        </p>
        {drafts.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--ink)]/45">No drafts yet. Build a quote in any studio.</p>
        ) : (
          <ul className="mt-6 divide-y divide-[var(--ink)]/10 border-y border-[var(--ink)]/10">
            {drafts.slice(0, 8).map((draft) => (
              <li key={draft.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--ink)]">{draft.title}</p>
                  <p className="text-xs uppercase tracking-wider text-[var(--ink)]/40">
                    {draft.studio} · {new Date(draft.updatedAt).toLocaleString()}
                  </p>
                </div>
                <p className="shrink-0 tabular-nums text-[var(--ink)]/80">
                  {formatCentsWithCommas(quoteTotalCents(draft))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

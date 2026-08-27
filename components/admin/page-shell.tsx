'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

type Breadcrumb = { label: string; href?: string }

export function AdminPage({
  children,
  className,
  dense,
}: {
  children: ReactNode
  className?: string
  dense?: boolean
}) {
  return (
    <div className={cn('flex w-full max-w-[1600px] flex-col', dense ? 'gap-4' : 'gap-6', className)}>
      {children}
    </div>
  )
}

export function AdminPageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  eyebrow,
}: {
  title: string
  description?: string
  actions?: ReactNode
  breadcrumbs?: Breadcrumb[]
  eyebrow?: string
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--dashboard-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[11px] text-[var(--dashboard-text-muted)]">
            {breadcrumbs.map((crumb, i) => (
              <span key={`${crumb.label}-${i}`} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3 opacity-50" aria-hidden />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[var(--dashboard-text)] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--dashboard-text)]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--dashboard-accent-gold)]">
            {eyebrow}
          </p>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--dashboard-text)] sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--dashboard-text-muted)]">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </header>
  )
}

export function AdminPanel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <section
      className={cn(
        'admin-panel rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] bg-[var(--dashboard-card)]',
        padded && 'p-4 sm:p-5',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function AdminPanelHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--dashboard-text)]">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-[var(--dashboard-text-muted)]">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function AdminStatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid gap-3 grid-cols-2 xl:grid-cols-4', className)}>
      {children}
    </div>
  )
}

export function AdminStat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'accent'
}) {
  const toneClass = {
    default: 'text-[var(--dashboard-text)]',
    success: 'text-[var(--dashboard-accent-green)]',
    warning: 'text-[var(--dashboard-accent-orange)]',
    danger: 'text-[var(--dashboard-accent-red)]',
    accent: 'text-[var(--dashboard-accent-gold)]',
  }[tone]

  return (
    <div className="admin-panel rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">
        {label}
      </p>
      <p className={cn('mt-2 text-2xl font-semibold tabular-nums tracking-tight', toneClass)}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-[var(--dashboard-text-muted)]">{hint}</p>}
    </div>
  )
}

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--dashboard-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--dashboard-card)]/40 px-6 py-14 text-center">
      <h3 className="text-base font-semibold text-[var(--dashboard-text)]">{title}</h3>
      {description && (
        <p className="max-w-md text-sm text-[var(--dashboard-text-muted)]">{description}</p>
      )}
      {action}
    </div>
  )
}

import { cn } from '@/lib/utils'

/** Three-point line crown with ball tips and a double curved band. No sparkle, no letters. */
export function CrownMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 68"
      fill="none"
      aria-hidden="true"
      className={cn('h-8 w-auto text-[var(--brand-gold,var(--theme-accent))]', className)}
    >
      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30.2 33.2 C38 46 50 44 56 34 C60 26 63 14 67.2 9.4" />
        <path d="M72.8 9.4 C77 14 80 26 84 34 C90 44 102 46 109.8 33.2" />
        <path d="M38 50 Q70 43.5 102 50" />
        <path d="M42 55.5 Q70 49 98 55.5" />
      </g>
      <circle cx="26" cy="30" r="3.15" fill="currentColor" />
      <circle cx="70" cy="6.4" r="3.15" fill="currentColor" />
      <circle cx="114" cy="30" r="3.15" fill="currentColor" />
    </svg>
  )
}

/**
 * Crowned PL monogram for the public header. Crown only, no sparkle.
 * Color follows the surrounding brand-lockup gold token.
 */
export function BrandMonogram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 88"
      fill="none"
      aria-hidden="true"
      className={cn('h-11 w-auto text-[var(--brand-gold,var(--theme-accent))]', className)}
    >
      <g transform="translate(0 1) scale(0.514)" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30.2 33.2 C38 46 50 44 56 34 C60 26 63 14 67.2 9.4" />
        <path d="M72.8 9.4 C77 14 80 26 84 34 C90 44 102 46 109.8 33.2" />
        <path d="M38 50 Q70 43.5 102 50" />
        <path d="M42 55.5 Q70 49 98 55.5" />
      </g>
      <g transform="translate(0 1) scale(0.514)" fill="currentColor">
        <circle cx="26" cy="30" r="3.15" />
        <circle cx="70" cy="6.4" r="3.15" />
        <circle cx="114" cy="30" r="3.15" />
      </g>
      <text
        x="18"
        y="82"
        fill="currentColor"
        fontSize="34"
        className="font-serif"
      >
        P
      </text>
      <text
        x="36"
        y="82"
        fill="currentColor"
        fontSize="34"
        className="font-serif"
      >
        L
      </text>
    </svg>
  )
}

/**
 * Full lockup: crown, “Prime Lux”, and tracked EVENTS between rules.
 * On light surfaces Prime is the palette dark and the crown, Lux, and rules use the accent.
 * On dark surfaces the whole mark is the accent, matching the navy lockup.
 */
export function BrandLockup({
  tone = 'on-light',
  className,
}: {
  tone?: 'on-light' | 'on-dark'
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'brand-lockup inline-flex flex-col items-center leading-none',
        tone === 'on-dark' && 'brand-lockup-on-dark',
        className,
      )}
    >
      <CrownMark className="h-[0.85em] w-auto" />
      <span className="mt-[0.12em] font-serif text-[1em] tracking-[-0.03em]">
        <span className="text-[var(--brand-ink)]">Prime</span>
        <span className="text-[var(--brand-gold)]"> Lux</span>
      </span>
      <span className="mt-[0.28em] flex w-[92%] items-center gap-[0.4em] text-[var(--brand-gold)]">
        <span className="h-px flex-1 bg-current" />
        <span className="font-serif text-[0.22em] uppercase tracking-[0.46em] pl-[0.46em]">Events</span>
        <span className="h-px flex-1 bg-current" />
      </span>
    </span>
  )
}

/**
 * Env-gated Sentry stub.
 *
 * No @sentry/* packages are installed. When NEXT_PUBLIC_SENTRY_DSN or
 * SENTRY_DSN is set, helpers become active no-ops that log in non-production.
 * Install @sentry/nextjs and replace the bodies of these functions to wire
 * real reporting without changing call sites.
 *
 * Env vars (document in .env.local.example):
 * - NEXT_PUBLIC_SENTRY_DSN — browser + edge DSN (public)
 * - SENTRY_DSN — server-only DSN (optional; falls back to public DSN)
 * - SENTRY_ENVIRONMENT — optional environment tag (defaults to NODE_ENV)
 */

type CaptureContext = Record<string, unknown>

function getDsn(): string | undefined {
  const dsn =
    process.env.SENTRY_DSN?.trim() ||
    process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()
  return dsn || undefined
}

export function isSentryEnabled(): boolean {
  return Boolean(getDsn())
}

let initialized = false

/** Call once from instrumentation (or app boot). No-ops without a DSN. */
export function initSentry(): void {
  if (initialized) return
  initialized = true

  if (!getDsn()) return

  if (process.env.NODE_ENV !== 'production') {
    console.info(
      '[sentry] DSN present but @sentry packages are not installed; using no-op stub.',
    )
  }
}

export function captureException(
  error: unknown,
  context?: CaptureContext,
): void {
  if (!getDsn()) return

  if (process.env.NODE_ENV !== 'production') {
    console.error('[sentry stub] captureException', error, context)
  }
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: CaptureContext,
): void {
  if (!getDsn()) return

  if (process.env.NODE_ENV !== 'production') {
    console[level === 'error' ? 'error' : 'warn'](
      `[sentry stub] captureMessage (${level})`,
      message,
      context,
    )
  }
}

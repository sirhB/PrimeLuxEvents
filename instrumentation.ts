/**
 * Next.js instrumentation hook — runs once on server/edge boot.
 * Wires env-gated Sentry init (stub until @sentry/nextjs is installed).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    const { initSentry } = await import('./lib/sentry')
    initSentry()
  }
}

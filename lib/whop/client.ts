/**
 * Minimal Whop REST client (https://docs.whop.com, API v1).
 * Secrets come only from env: WHOP_API_KEY, WHOP_COMPANY_ID. Optional WHOP_API_BASE for sandbox.
 */
const DEFAULT_BASE = 'https://api.whop.com/api/v1'

export class WhopApiError extends Error {
  constructor(message: string, public status: number, public body: unknown) {
    super(message)
  }
}

export function whopConfigured(): boolean {
  return Boolean(process.env.WHOP_API_KEY && process.env.WHOP_COMPANY_ID)
}

export function whopCompanyId(): string {
  const id = process.env.WHOP_COMPANY_ID
  if (!id) throw new Error('WHOP_COMPANY_ID is not set')
  return id
}

async function whop<T>(
  method: 'GET' | 'POST',
  path: string,
  opts: { body?: unknown; query?: Record<string, string>; idempotencyKey?: string } = {},
): Promise<T> {
  const key = process.env.WHOP_API_KEY
  if (!key) throw new Error('WHOP_API_KEY is not set')
  const base = process.env.WHOP_API_BASE || DEFAULT_BASE
  const url = new URL(base + path)
  for (const [k, v] of Object.entries(opts.query ?? {})) url.searchParams.set(k, v)
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
  if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey
  const res = await fetch(url, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  })
  const text = await res.text()
  let json: unknown = null
  try { json = text ? JSON.parse(text) : null } catch { json = text }
  if (!res.ok) {
    const msg = (json as { error?: { message?: string } })?.error?.message ?? `Whop ${method} ${path} failed`
    throw new WhopApiError(msg, res.status, json)
  }
  return json as T
}

export type WhopAccount = { id: string; title?: string; email?: string }
export type WhopVerification = { id: string; status?: string; session_url?: string }
export type WhopCheckout = { id: string; purchase_url: string; plan?: { id: string } }
export type WhopTransfer = { id: string; status: 'processing' | 'succeeded' | 'failed' | string; amount: number }

/** Connected account (sub-account) for a planner. */
export function createConnectedAccount(input: { email: string; title: string; plannerUserId: string }) {
  return whop<WhopAccount>('POST', '/accounts', {
    body: {
      email: input.email,
      title: input.title,
      metadata: { planner_user_id: input.plannerUserId, source: 'prime-lux' },
    },
    idempotencyKey: `acct-${input.plannerUserId}`,
  })
}

/** Hosted KYC session for a connected account. Returns session_url. */
export function createVerification(accountId: string) {
  return whop<WhopVerification>('POST', '/verifications', { query: { account_id: accountId } })
}

/**
 * One-time checkout link. Funds land in the Prime Lux company balance;
 * metadata is copied onto the resulting payment so the webhook can attribute it.
 */
export function createCheckoutLink(input: {
  amountCents: number
  currency: string
  title: string
  redirectUrl?: string
  metadata: Record<string, string>
  idempotencyKey: string
}) {
  return whop<WhopCheckout>('POST', '/checkout_configurations', {
    body: {
      plan: {
        company_id: whopCompanyId(),
        initial_price: input.amountCents / 100,
        currency: input.currency,
        plan_type: 'one_time',
        title: input.title,
      },
      metadata: input.metadata,
      redirect_url: input.redirectUrl,
    },
    idempotencyKey: input.idempotencyKey,
  })
}

/** Balance transfer from Prime Lux to the planner's connected account. */
export function createTransfer(input: {
  destinationAccountId: string
  amountCents: number
  currency: string
  idempotenceKey: string
  metadata: Record<string, string>
}) {
  return whop<WhopTransfer>('POST', '/transfers', {
    body: {
      origin_id: whopCompanyId(),
      destination_id: input.destinationAccountId,
      amount: input.amountCents / 100,
      currency: input.currency,
      idempotence_key: input.idempotenceKey,
      metadata: input.metadata,
    },
  })
}

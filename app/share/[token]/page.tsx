import { getSharedCartByToken } from '@/app/actions/partners'
import { formatCentsWithCommas } from '@/lib/format-money'
import { resolvePriceCents } from '@/lib/catalog/adapters'
import type { Metadata } from 'next'

function partnerPaymentRows(partner: any) {
  if (!partner) return []
  const rows: { label: string; value: string }[] = []
  if (partner.payment_zelle) rows.push({ label: 'Zelle', value: partner.payment_zelle })
  if (partner.payment_venmo) rows.push({ label: 'Venmo', value: partner.payment_venmo })
  if (partner.payment_apple_cash) rows.push({ label: 'Apple Cash', value: partner.payment_apple_cash })
  if (partner.payment_cash_app) rows.push({ label: 'Cash App', value: partner.payment_cash_app })
  if (partner.payment_other_value) {
    rows.push({
      label: partner.payment_other_label?.trim() || 'Other',
      value: partner.payment_other_value,
    })
  }
  return rows
}

function brandName(partner: any) {
  return partner?.brand_display_name?.trim() || partner?.company_name || 'Your planner'
}

function accent(partner: any) {
  const c = partner?.brand_accent_color?.trim()
  if (c && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(c)) return c
  return '#1c1917'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const result = await getSharedCartByToken(token)
  if (result.error || !result.partner) {
    return { title: 'Invoice' }
  }
  const name = brandName(result.partner)
  return {
    title: `${name} · Invoice`,
    description: `Selection invoice from ${name}`,
    robots: { index: false, follow: false },
  }
}

export default async function SharedCartPublicPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const result = await getSharedCartByToken(token)

  if (result.error || !result.cart) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Invoice unavailable</h1>
        <p className="mt-3 text-sm text-neutral-500">{result.error}</p>
      </div>
    )
  }

  const { cart, partner, products } = result
  const productMap = new Map((products || []).map((p: any) => [p.id, p]))
  const paymentRows = partnerPaymentRows(partner)
  const name = brandName(partner)
  const color = accent(partner)
  const invoiceRef = `INV-${String(cart.id).slice(0, 8).toUpperCase()}`
  const issued =
    cart.shared_at
      ? new Date(cart.shared_at).toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null

  const addressLines = [
    partner?.business_address,
    [partner?.business_city, partner?.business_region, partner?.business_postal]
      .filter(Boolean)
      .join(', '),
  ].filter(Boolean)

  return (
    <div
      className="min-h-screen bg-neutral-100 print:bg-white"
      style={{ ['--brand' as string]: color }}
    >
      <div className="mx-auto max-w-3xl px-4 py-8 print:px-0 print:py-0 md:py-12">
        <article className="overflow-hidden rounded-sm bg-white shadow-sm print:shadow-none">
          {/* Header — partner branded */}
          <header
            className="border-b px-6 py-8 md:px-10"
            style={{ borderColor: `${color}22` }}
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                {partner?.brand_logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={partner.brand_logo_url}
                    alt={name}
                    className="h-12 max-w-[200px] object-contain"
                  />
                ) : (
                  <p
                    className="text-2xl font-semibold tracking-tight"
                    style={{ color }}
                  >
                    {name}
                  </p>
                )}
                {partner?.brand_tagline && (
                  <p className="text-sm text-neutral-500">{partner.brand_tagline}</p>
                )}
                <div className="space-y-0.5 text-xs text-neutral-500">
                  {addressLines.map((line) => (
                    <p key={String(line)}>{line}</p>
                  ))}
                  {partner?.business_email && <p>{partner.business_email}</p>}
                  {partner?.phone && <p>{partner.phone}</p>}
                  {partner?.website && <p>{partner.website.replace(/^https?:\/\//, '')}</p>}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.25em]"
                  style={{ color }}
                >
                  Invoice
                </p>
                <p className="mt-1 font-mono text-sm text-neutral-700">{invoiceRef}</p>
                {issued && (
                  <p className="mt-2 text-xs text-neutral-500">Issued {issued}</p>
                )}
              </div>
            </div>
          </header>

          <div className="space-y-10 px-6 py-8 md:px-10">
            {/* Bill to */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Bill to
                </p>
                <p className="mt-2 text-base font-medium text-neutral-900">{cart.client_name}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Event
                </p>
                <div className="mt-2 space-y-1 text-sm text-neutral-700">
                  {cart.event_date && (
                    <p>
                      {new Date(cart.event_date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  {cart.event_type && <p>{cart.event_type}</p>}
                  {cart.venue_address && <p>{cart.venue_address}</p>}
                  {!cart.event_date && !cart.event_type && !cart.venue_address && (
                    <p className="text-neutral-400">Details to be confirmed</p>
                  )}
                </div>
              </div>
            </div>

            {cart.notes && (
              <p className="border-l-2 pl-4 text-sm italic text-neutral-600" style={{ borderColor: color }}>
                {cart.notes}
              </p>
            )}

            {/* Line items */}
            <div>
              <div
                className="grid grid-cols-[1fr_auto] gap-4 border-b pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400"
                style={{ borderColor: `${color}33` }}
              >
                <span>Description</span>
                <span>Amount</span>
              </div>
              <ul>
                {(cart.items || []).map((item: any, idx: number) => {
                  if (item.packageId && item.packageData) {
                    const price = resolvePriceCents({ price: item.packageData.price })
                    return (
                      <li
                        key={idx}
                        className="grid grid-cols-[1fr_auto] gap-4 border-b border-neutral-100 py-4"
                      >
                        <div>
                          <p className="font-medium text-neutral-900">{item.packageData.name}</p>
                          <p className="text-xs text-neutral-500">Package · Qty {item.quantity}</p>
                        </div>
                        <p className="text-sm tabular-nums">
                          {formatCentsWithCommas(price * item.quantity)}
                        </p>
                      </li>
                    )
                  }
                  const product = item.productId ? productMap.get(item.productId) : null
                  const unit = product ? resolvePriceCents(product) : 0
                  const modifiersPrice = Object.values(item.modifiers || {}).reduce(
                    (acc: number, curr: any) => acc + (curr.priceAdjustment || 0),
                    0,
                  )
                  return (
                    <li
                      key={idx}
                      className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-neutral-100 py-4"
                    >
                      <div className="flex items-center gap-3">
                        {product?.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt=""
                            className="hidden h-12 w-10 rounded object-cover sm:block"
                          />
                        )}
                        <div>
                          <p className="font-medium text-neutral-900">
                            {product?.name || 'Rental item'}
                          </p>
                          <p className="text-xs text-neutral-500">Qty {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm tabular-nums">
                        {formatCentsWithCommas((unit + modifiersPrice) * item.quantity)}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Totals */}
            <div className="ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCentsWithCommas(cart.retail_subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Setup</span>
                <span className="tabular-nums">{formatCentsWithCommas(cart.retail_setup_fee)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Tax</span>
                <span className="tabular-nums">{formatCentsWithCommas(cart.retail_tax_amount)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery</span>
                <span className="tabular-nums">
                  {formatCentsWithCommas(cart.retail_delivery_fee)}
                </span>
              </div>
              <div
                className="flex justify-between border-t pt-3 text-base font-semibold"
                style={{ borderColor: `${color}44`, color }}
              >
                <span>Amount due</span>
                <span className="tabular-nums">{formatCentsWithCommas(cart.retail_total)}</span>
              </div>
              <p className="text-right text-[10px] uppercase tracking-wider text-neutral-400">
                Payable to {name}
              </p>
            </div>

            {/* Payment methods */}
            <section
              className="rounded-sm border px-5 py-5"
              style={{ borderColor: `${color}33`, backgroundColor: `${color}08` }}
            >
              <h2 className="text-sm font-semibold" style={{ color }}>
                How to pay
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Please send {formatCentsWithCommas(cart.retail_total)} to {name} using one of the
                methods below. This invoice does not accept card payments online.
              </p>
              {paymentRows.length === 0 ? (
                <p className="mt-4 text-sm text-neutral-500">
                  Contact {name}
                  {partner?.phone ? ` at ${partner.phone}` : ''}
                  {partner?.business_email ? ` or ${partner.business_email}` : ''} for payment
                  instructions.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-neutral-200/80">
                  {paymentRows.map((row) => (
                    <li
                      key={row.label}
                      className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span
                        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                        style={{ color }}
                      >
                        {row.label}
                      </span>
                      <span className="break-all text-sm font-medium text-neutral-900">
                        {row.value}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {partner?.payment_instructions && (
                <p className="mt-4 border-t border-neutral-200/80 pt-4 text-sm text-neutral-600">
                  {partner.payment_instructions}
                </p>
              )}
            </section>

            <footer className="space-y-2 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-500">
              {partner?.invoice_footer_note && <p>{partner.invoice_footer_note}</p>}
              <p>
                Questions? Reach {name}
                {partner?.business_email ? ` at ${partner.business_email}` : ''}
                {partner?.phone
                  ? `${partner?.business_email ? ' or' : ' at'} ${partner.phone}`
                  : ''}
                .
              </p>
            </footer>
          </div>
        </article>
      </div>
    </div>
  )
}

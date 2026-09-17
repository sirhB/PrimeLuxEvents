'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Truck,
  ArrowUpRight,
  Download,
  Package,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCents } from '@/lib/format-money'
import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import type { OpsIntelligenceMetrics } from '@/lib/admin/ops-intelligence'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const COLORS = ['#c2a882', '#3d9a78', '#5b8def', '#d4924a', '#8a929c']

const FUNNEL_COLORS: Record<string, string> = {
  pending: '#d4924a',
  confirmed: '#5b8def',
  delivered: '#3d9a78',
  completed: '#c2a882',
  cancelled: '#d4655a',
}

type Props = {
  metrics: OpsIntelligenceMetrics
}

export function OpsIntelligenceDashboard({ metrics }: Props) {
  const router = useRouter()
  const {
    rangeDays,
    gmvCents,
    orderCount,
    avgOrderValueCents,
    cancelledCount,
    fulfillmentMix,
    statusFunnel,
    dailyGmv,
  } = metrics

  const chartDaily = dailyGmv.map((d) => ({
    ...d,
    gmv: d.gmvCents / 100,
  }))

  const maxFunnel = Math.max(1, ...statusFunnel.filter((s) => s.status !== 'cancelled').map((s) => s.count))

  const exportCsv = () => {
    const rows = [
      ['Section', 'Key', 'Count', 'GMV (cents)'],
      ['summary', 'gmv', String(orderCount), String(gmvCents)],
      ['summary', 'cancelled', String(cancelledCount), ''],
      ...fulfillmentMix.map((f) => ['fulfillment', f.method, String(f.count), String(f.gmvCents)]),
      ...statusFunnel.map((s) => ['status', s.status, String(s.count), String(s.gmvCents)]),
      ...dailyGmv.map((d) => ['daily', d.date, String(d.orderCount), String(d.gmvCents)]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `primelux-ops-intelligence-${rangeDays}d.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleRange = () => {
    const next = rangeDays === 30 ? 90 : 30
    router.push(`/admin/analytics?days=${next}`)
  }

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Ops Intelligence"
        title="Operations analytics"
        description="GMV, fulfillment mix, and status funnel from live orders."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-md" onClick={toggleRange}>
              Last {rangeDays} days
            </Button>
            <Button
              size="sm"
              className="h-10 rounded-md bg-[var(--dashboard-accent-gold)] px-4 text-[#0d1014] hover:bg-[var(--dashboard-accent-gold)]/90"
              onClick={exportCsv}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'GMV',
            value: formatCents(gmvCents),
            icon: DollarSign,
            hint: `Excludes cancelled · ${rangeDays}d`,
          },
          {
            label: 'Orders',
            value: orderCount,
            icon: ShoppingBag,
            hint: cancelledCount ? `${cancelledCount} cancelled` : 'Active pipeline',
          },
          {
            label: 'Avg order',
            value: formatCents(avgOrderValueCents),
            icon: TrendingUp,
            hint: 'Per non-cancelled order',
          },
          {
            label: 'Fulfillment modes',
            value: fulfillmentMix.length,
            icon: Truck,
            hint: fulfillmentMix.map((f) => `${f.label} ${f.pct}%`).join(' · ') || 'No data',
          },
        ].map((metric) => (
          <Card
            key={metric.label}
            className="overflow-hidden rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] shadow-none"
          >
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)]">
                  <metric.icon className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--dashboard-accent-green)]">
                  <ArrowUpRight className="h-3 w-3" />
                  live
                </div>
              </div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">
                {metric.label}
              </p>
              <p className="text-2xl font-semibold tabular-nums text-[var(--dashboard-text)]">
                {metric.value}
              </p>
              <p className="mt-1 truncate text-[11px] text-[var(--dashboard-text-muted)]">{metric.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] shadow-none lg:col-span-2">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-sm font-semibold">Daily GMV</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            <div className="h-[320px] w-full">
              {chartDaily.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[var(--dashboard-text-muted)]">
                  No orders in this range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDaily}>
                    <defs>
                      <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c2a882" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#c2a882" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="formattedDate"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#888' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#888' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: '#181d24',
                        color: '#eef0f2',
                      }}
                      formatter={(value: number) => [`$${Number(value).toFixed(2)}`, 'GMV']}
                    />
                    <Area
                      type="monotone"
                      dataKey="gmv"
                      stroke="#c2a882"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorGmv)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] shadow-none">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-sm font-semibold">Fulfillment mix</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            <div className="h-[320px] w-full">
              {fulfillmentMix.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[var(--dashboard-text-muted)]">
                  No fulfillment data.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fulfillmentMix}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="label"
                    >
                      {fulfillmentMix.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: '#181d24',
                        color: '#eef0f2',
                      }}
                      formatter={(value: number, _name, props) => {
                        const pct = props?.payload?.pct ?? 0
                        return [`${value} orders (${pct}%)`, props?.payload?.label]
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] shadow-none">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-sm font-semibold">Status funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-4">
            {statusFunnel.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--dashboard-text-muted)]">No status data.</p>
            ) : (
              statusFunnel.map((step) => {
                const widthPct =
                  step.status === 'cancelled'
                    ? Math.min(100, (step.count / maxFunnel) * 100)
                    : (step.count / maxFunnel) * 100
                const color = FUNNEL_COLORS[step.status] || '#8a929c'
                return (
                  <div key={step.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[var(--dashboard-text)]">{step.label}</span>
                      <span className="tabular-nums text-[var(--dashboard-text-muted)]">
                        {step.count}
                        <span className="ml-2 text-[10px] uppercase tracking-wider">
                          {formatCents(step.gmvCents)}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-sm bg-black/30">
                      <div
                        className="h-full rounded-sm transition-all"
                        style={{
                          width: `${Math.max(step.count > 0 ? 4 : 0, widthPct)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] shadow-none">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-sm font-semibold">Fulfillment GMV</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            <div className="h-[280px] w-full">
              {fulfillmentMix.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[var(--dashboard-text-muted)]">
                  No data.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={fulfillmentMix.map((f) => ({
                      ...f,
                      gmv: f.gmvCents / 100,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#8a929c' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#888' }}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: '#181d24',
                        color: '#eef0f2',
                      }}
                      formatter={(value: number) => [`$${Number(value).toFixed(2)}`, 'GMV']}
                    />
                    <Bar dataKey="gmv" fill="#c2a882" radius={[4, 4, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-md text-[var(--dashboard-text-muted)]">
                <Link href="/admin/logistics">
                  <Truck className="mr-2 h-3.5 w-3.5" />
                  Logistics hub
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-md text-[var(--dashboard-text-muted)]">
                <Link href="/admin/delivery">
                  <Package className="mr-2 h-3.5 w-3.5" />
                  Delivery planner
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  )
}

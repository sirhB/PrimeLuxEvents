'use client'

import React, { useEffect, useState } from 'react'
import {
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCentsWithCommas } from '@/lib/format-money'
import { cn } from '@/lib/utils'
import { AdminStatGrid } from '@/components/admin/page-shell'

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  changeLabel: string
  icon: React.ComponentType<{ className?: string }>
  tone?: 'accent' | 'success' | 'default'
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, tone = 'default' }: MetricCardProps) {
  const isPositive = change >= 0
  const valueTone = {
    accent: 'text-[var(--dashboard-accent-gold)]',
    success: 'text-[var(--dashboard-accent-green)]',
    default: 'text-[var(--dashboard-text)]',
  }[tone]

  return (
    <div className="admin-panel rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)] text-[var(--dashboard-accent-gold)]">
          <Icon className="h-4 w-4" />
        </div>
        <div
          className={cn(
            'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
            isPositive
              ? 'bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)]'
              : 'bg-[var(--dashboard-accent-red)]/10 text-[var(--dashboard-accent-red)]',
          )}
        >
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">
        {title}
      </p>
      <p className={cn('mt-1.5 text-2xl font-semibold tabular-nums tracking-tight', valueTone)}>{value}</p>
      <p className="mt-1 text-xs text-[var(--dashboard-text-muted)]">{changeLabel}</p>
    </div>
  )
}

export function MetricsOverview() {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    events: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    eventsChange: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        const [
          currentRevenue,
          lastMonthRevenue,
          currentOrders,
          lastMonthOrders,
          currentCustomerRows,
          lastCustomerRows,
          upcomingEvents,
          lastUpcoming,
        ] = await Promise.all([
          supabase.from('orders').select('total_amount').gte('created_at', firstDayOfMonth.toISOString()),
          supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', lastMonth.toISOString())
            .lte('created_at', lastMonthEnd.toISOString()),
          supabase.from('orders').select('id').gte('created_at', firstDayOfMonth.toISOString()),
          supabase
            .from('orders')
            .select('id')
            .gte('created_at', lastMonth.toISOString())
            .lte('created_at', lastMonthEnd.toISOString()),
          supabase.from('orders').select('customer_email').gte('created_at', firstDayOfMonth.toISOString()),
          supabase
            .from('orders')
            .select('customer_email')
            .gte('created_at', lastMonth.toISOString())
            .lte('created_at', lastMonthEnd.toISOString()),
          supabase
            .from('orders')
            .select('id, delivery_date')
            .not('delivery_date', 'is', null)
            .gte('delivery_date', now.toISOString().slice(0, 10))
            .lte('delivery_date', thirtyDaysFromNow.toISOString().slice(0, 10))
            .neq('status', 'cancelled'),
          supabase
            .from('orders')
            .select('id')
            .not('delivery_date', 'is', null)
            .gte('delivery_date', lastMonth.toISOString().slice(0, 10))
            .lte('delivery_date', lastMonthEnd.toISOString().slice(0, 10))
            .neq('status', 'cancelled'),
        ])

        const currentTotal = currentRevenue.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0
        const lastTotal = lastMonthRevenue.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0
        const revenueChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0

        const ordersChange = lastMonthOrders.data?.length
          ? (((currentOrders.data?.length || 0) - lastMonthOrders.data.length) / lastMonthOrders.data.length) * 100
          : 0

        const currentCustomers = new Set(
          (currentCustomerRows.data || []).map((r) => r.customer_email).filter(Boolean),
        ).size
        const lastCustomers = new Set(
          (lastCustomerRows.data || []).map((r) => r.customer_email).filter(Boolean),
        ).size
        const customersChange =
          lastCustomers > 0
            ? ((currentCustomers - lastCustomers) / lastCustomers) * 100
            : currentCustomers > 0
              ? 100
              : 0

        const eventsChange =
          (lastUpcoming.data?.length || 0) > 0
            ? (((upcomingEvents.data?.length || 0) - (lastUpcoming.data?.length || 0)) /
                (lastUpcoming.data?.length || 1)) *
              100
            : (upcomingEvents.data?.length || 0) > 0
              ? 100
              : 0

        setMetrics({
          revenue: currentTotal,
          orders: currentOrders.data?.length || 0,
          customers: currentCustomers,
          events: upcomingEvents.data?.length || 0,
          revenueChange: Math.round(revenueChange),
          ordersChange: Math.round(ordersChange),
          customersChange: Math.round(customersChange),
          eventsChange: Math.round(eventsChange),
        })
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchMetrics()
  }, [supabase])

  if (loading) {
    return (
      <AdminStatGrid>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[120px] animate-pulse rounded-[var(--dashboard-radius)] bg-[var(--dashboard-card)]" />
        ))}
      </AdminStatGrid>
    )
  }

  return (
    <AdminStatGrid>
      <MetricCard
        title="Revenue"
        value={formatCentsWithCommas(metrics.revenue)}
        change={metrics.revenueChange}
        changeLabel="vs last month"
        icon={DollarSign}
        tone="accent"
      />
      <MetricCard
        title="Orders"
        value={metrics.orders}
        change={metrics.ordersChange}
        changeLabel="vs last month"
        icon={ShoppingBag}
        tone="success"
      />
      <MetricCard
        title="Customers"
        value={metrics.customers}
        change={metrics.customersChange}
        changeLabel="active this month"
        icon={Users}
      />
      <MetricCard
        title="Upcoming events"
        value={metrics.events}
        change={metrics.eventsChange}
        changeLabel="next 30 days"
        icon={Calendar}
      />
    </AdminStatGrid>
  )
}

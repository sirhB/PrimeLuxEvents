'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  MessageSquare,
  Package,
  Plus,
  QrCode,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PullToRefresh } from '@/components/admin/pull-to-refresh'
import {
  AdminEmptyState,
} from '@/components/admin/page-shell'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  PREP_READINESS_LABELS,
  type PrepReadiness,
  type WeekPrepSummary,
} from '@/lib/warehouse/week-prep'
import { getUpcomingWeekendWindow, toDateString } from '@/lib/warehouse/weekend'

export type AttentionItem = {
  id: string
  label: string
  href: string
  count: number
  tone?: 'default' | 'warning' | 'danger'
}

export type TodayTask = {
  id: string
  title: string
  category: string | null
  status: string
  href: string
  customerName?: string | null
}

const READINESS_KEYS: PrepReadiness[] = [
  'not_started',
  'in_progress',
  'ready',
  'loaded',
  'delivered',
]


function timeGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardContent() {
  const router = useRouter()
  const supabase = createClient()
  const [attention, setAttention] = useState<AttentionItem[]>([])
  const [weekendSummary, setWeekendSummary] = useState<WeekPrepSummary | null>(null)
  const [weekendLabel, setWeekendLabel] = useState('')
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([])
  const [firstName, setFirstName] = useState('there')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const raw =
        (user?.user_metadata?.full_name as string | undefined) ||
        user?.email?.split('@')[0]
      if (raw) setFirstName(raw.split(' ')[0])
    } catch {
      // Greeting falls back when the session lookup fails.
    }
    const today = toDateString(new Date())
    const weekend = getUpcomingWeekendWindow()
    setWeekendLabel(weekend.label)

    const [
      pendingOrders,
      newLeads,
      unreadMessages,
      openWarehouse,
      weekendOrders,
      weekendTasks,
      dueToday,
    ] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase
        .from('consultations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new_request'),
      supabase
        .from('admin_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('type', 'new_message'),
      supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('task_type', 'warehouse')
        .in('status', ['pending', 'in_progress'])
        .lte('due_date', today),
      supabase
        .from('orders')
        .select('id, status')
        .gte('delivery_date', weekend.start)
        .lte('delivery_date', weekend.end)
        .neq('status', 'cancelled'),
      supabase
        .from('tasks')
        .select('id, status, warehouse_category, order_id, task_type')
        .in('task_type', ['warehouse', 'delivery'])
        .or(
          `and(due_date.gte.${weekend.start},due_date.lte.${weekend.end}),and(task_type.eq.delivery,order_id.not.is.null)`,
        ),
      supabase
        .from('tasks')
        .select(
          `
          id,
          title,
          status,
          warehouse_category,
          task_type,
          order_id,
          orders ( customer_name )
        `,
        )
        .eq('due_date', today)
        .in('status', ['pending', 'in_progress'])
        .order('scheduled_start', { ascending: true, nullsFirst: false })
        .limit(8),
    ])

    setAttention(
      [
        {
          id: 'orders',
          label: 'Orders awaiting confirmation',
          href: '/admin/orders?status=pending',
          count: pendingOrders.count || 0,
          tone: 'warning' as const,
        },
        {
          id: 'leads',
          label: 'New leads',
          href: '/admin/consultations',
          count: newLeads.count || 0,
          tone: 'warning' as const,
        },
        {
          id: 'messages',
          label: 'Unread messages',
          href: '/admin/messages',
          count: unreadMessages.count || 0,
        },
        {
          id: 'warehouse',
          label: 'Overdue / due warehouse tasks',
          href: `/admin/warehouse/schedule?date=${today}`,
          count: openWarehouse.count || 0,
          tone: 'danger' as const,
        },
      ].filter((item) => item.count > 0),
    )

    const summary: WeekPrepSummary = {
      not_started: 0,
      in_progress: 0,
      ready: 0,
      loaded: 0,
      delivered: 0,
      total: (weekendOrders.data || []).length,
    }
    const tasks = weekendTasks.data || []
    for (const order of weekendOrders.data || []) {
      if (order.status === 'delivered' || order.status === 'completed') {
        summary.delivered += 1
        continue
      }
      const orderTasks = tasks.filter((task) => task.order_id === order.id)
      const pick = orderTasks.find((task) => task.warehouse_category === 'pick')
      const pack = orderTasks.find((task) => task.warehouse_category === 'pack')
      const loadTask = orderTasks.find((task) => task.warehouse_category === 'vehicle_load')
      const delivery = orderTasks.find((task) => task.task_type === 'delivery')
      if (delivery?.status === 'completed' || loadTask?.status === 'completed') {
        summary.loaded += 1
      } else if (pick?.status === 'completed' && pack?.status === 'completed') {
        summary.ready += 1
      } else if (
        pick?.status === 'in_progress' ||
        pick?.status === 'completed' ||
        pack?.status === 'in_progress' ||
        pack?.status === 'completed'
      ) {
        summary.in_progress += 1
      } else {
        summary.not_started += 1
      }
    }
    setWeekendSummary(summary)

    setTodayTasks(
      (dueToday.data || []).map((task) => {
        const orders = task.orders as
          | { customer_name?: string }
          | Array<{ customer_name?: string }>
          | null
        const customerName = Array.isArray(orders) ? orders[0]?.customer_name : orders?.customer_name
        return {
          id: task.id,
          title: task.title,
          category: task.warehouse_category,
          status: task.status,
          customerName,
          href:
            task.task_type === 'delivery'
              ? '/admin/delivery'
              : `/admin/warehouse/schedule?date=${today}`,
        }
      }),
    )
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    void load()
  }, [load])

  const handleRefresh = async () => {
    await load()
    router.refresh()
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <DashboardView
        firstName={firstName}
        attention={attention}
        weekendSummary={weekendSummary}
        weekendLabel={weekendLabel}
        todayTasks={todayTasks}
        loading={loading}
      />
    </PullToRefresh>
  )
}

const SHORTCUTS = [
  { href: '/admin/week-prep', label: 'Week Prep', icon: ClipboardCheck },
  { href: '/admin/scan', label: 'Scanner', icon: QrCode },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/delivery', label: 'Delivery', icon: Truck },
  { href: '/admin/tasks', label: 'Staff tasks', icon: Package },
]

const READINESS_FILL = [
  'bg-[var(--dashboard-border)]',
  'bg-[var(--theme-accent)]',
  'bg-[var(--dashboard-accent-green)]',
  'bg-[var(--theme-dark-hover)]',
  'bg-[var(--theme-dark)]',
]

export type DashboardViewProps = {
  firstName: string
  attention: AttentionItem[]
  weekendSummary: WeekPrepSummary | null
  weekendLabel: string
  todayTasks: TodayTask[]
  loading: boolean
}

/** Presentational dashboard. Also rendered with mock data at /preview/dashboard. */
export function DashboardView({ firstName, attention, weekendSummary, weekendLabel, todayTasks, loading }: DashboardViewProps) {
  const attentionTotal = attention.reduce((sum, item) => sum + item.count, 0)
  const total = weekendSummary?.total ?? 0
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[var(--dashboard-text-muted)]">{today}</p>
          <h1 className="mt-1 font-serif text-[2.4rem] leading-[1.02] tracking-[-0.02em] text-[var(--dashboard-text)] sm:text-5xl">
            {timeGreeting()}, {firstName}
          </h1>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button asChild variant="outline" className="h-11 rounded-none px-5 normal-case tracking-normal">
            <Link href="/admin/week-prep">Week Prep</Link>
          </Button>
          <Button asChild className="h-11 rounded-none px-5 normal-case tracking-normal">
            <Link href="/admin/orders/new">
              <Plus className="h-4 w-4" />
              New order
            </Link>
          </Button>
        </div>
      </header>

      <section aria-labelledby="dash-attention">
        <h2 id="dash-attention" className="flex items-baseline gap-2 border-b border-[var(--dashboard-border)] pb-2 text-sm font-medium">
          Needs attention
          <span className={cn('tabular-nums', attentionTotal ? 'text-[var(--dashboard-accent-orange)]' : 'text-[var(--dashboard-accent-green)]')}>
            {loading ? '…' : attentionTotal || 'All clear'}
          </span>
        </h2>
        {attention.length === 0 && !loading ? (
          <p className="py-3 text-sm text-[var(--dashboard-text-muted)]">Nothing is waiting on you.</p>
        ) : (
          <ul className="divide-y divide-[var(--dashboard-border)]">
            {attention.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="group flex min-h-12 items-center justify-between gap-3 py-3 transition-colors hover:text-[var(--theme-dark-hover)]">
                  <span className="flex items-center gap-3 text-[0.95rem]">
                    <AlertTriangle aria-hidden className={cn('h-4 w-4 shrink-0', item.tone === 'danger' ? 'text-[var(--dashboard-accent-red)]' : 'text-[var(--dashboard-accent-orange)]')} />
                    {item.label}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-lg font-semibold tabular-nums">{item.count}</span>
                    <ArrowRight aria-hidden className="h-4 w-4 text-[var(--dashboard-text-muted)] transition-transform duration-150 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="flex min-w-0 flex-col gap-10">
          <section aria-labelledby="dash-weekend">
            <div className="flex items-end justify-between gap-3 border-b border-[var(--dashboard-border)] pb-2">
              <h2 id="dash-weekend" className="font-serif text-[1.65rem] leading-tight">
                This weekend <span className="font-sans text-sm tabular-nums text-[var(--dashboard-text-muted)]">{loading ? '…' : `${total} orders`}</span>
              </h2>
              <span className="text-xs text-[var(--dashboard-text-muted)]">{weekendLabel || 'Fri–Sun'}</span>
            </div>
            <div className="mt-4 flex h-2 w-full overflow-hidden bg-[var(--dashboard-card-hover)]" role="img" aria-label="Weekend prep readiness">
              {total > 0 && READINESS_KEYS.map((key, index) => {
                const value = weekendSummary?.[key] ?? 0
                return value ? <span key={key} className={READINESS_FILL[index]} style={{ width: `${(value / total) * 100}%` }} /> : null
              })}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-5">
              {READINESS_KEYS.map((key, index) => (
                <div key={key}>
                  <dt className="flex items-center gap-2 text-xs text-[var(--dashboard-text-muted)]">
                    <span aria-hidden className={cn('h-2 w-2', READINESS_FILL[index])} />
                    {PREP_READINESS_LABELS[key]}
                  </dt>
                  <dd className="mt-0.5 text-xl font-medium tabular-nums">{loading ? '…' : weekendSummary?.[key] ?? 0}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="dash-today">
            <div className="flex items-end justify-between gap-3 border-b border-[var(--dashboard-border)] pb-2">
              <h2 id="dash-today" className="font-serif text-[1.65rem] leading-tight">
                Today&apos;s work <span className="font-sans text-sm tabular-nums text-[var(--dashboard-text-muted)]">{loading ? '…' : todayTasks.length}</span>
              </h2>
              <Link href={`/admin/warehouse/schedule?date=${toDateString(new Date())}`} className="inline-flex min-h-9 items-center gap-1.5 text-xs underline-offset-4 hover:underline">
                <CalendarDays aria-hidden className="h-3.5 w-3.5" /> Schedule
              </Link>
            </div>
            {todayTasks.length === 0 && !loading ? (
              <AdminEmptyState title="No tasks due today" description="When pick, pack, or load work is scheduled for today, it will show up here." />
            ) : (
              <ul className="divide-y divide-[var(--dashboard-border)]">
                {todayTasks.map((task) => (
                  <li key={task.id}>
                    <Link href={task.href} className="flex min-h-12 items-center justify-between gap-3 py-3 transition-colors hover:bg-[var(--dashboard-card-hover)]">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{task.title}</p>
                        <p className="text-xs capitalize text-[var(--dashboard-text-muted)]">
                          {task.category || 'task'}{task.customerName ? ` · ${task.customerName}` : ''}
                        </p>
                      </div>
                      <span className="shrink-0 border border-[var(--dashboard-border)] px-2 py-0.5 text-[11px] font-medium capitalize">
                        {task.status.replace('_', ' ')}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside aria-labelledby="dash-shortcuts">
          <h2 id="dash-shortcuts" className="border-b border-[var(--dashboard-border)] pb-2 text-sm font-medium">Shortcuts</h2>
          <ul className="grid grid-cols-2 lg:grid-cols-1">
            {SHORTCUTS.map((action) => {
              const Icon = action.icon
              return (
                <li key={action.href}>
                  <Link href={action.href} className="flex min-h-11 items-center gap-3 py-2 text-sm transition-colors hover:text-[var(--theme-dark-hover)]">
                    <Icon aria-hidden className="h-4 w-4 text-[var(--dashboard-text-muted)]" />
                    {action.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </aside>
      </div>
    </div>
  )
}

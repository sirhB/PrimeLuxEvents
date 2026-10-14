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
  AdminPanel,
  AdminPanelHeader,
} from '@/components/admin/page-shell'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  PREP_READINESS_LABELS,
  type PrepReadiness,
  type WeekPrepSummary,
} from '@/lib/warehouse/week-prep'
import { getUpcomingWeekendWindow, toDateString } from '@/lib/warehouse/weekend'

type AttentionItem = {
  id: string
  label: string
  href: string
  count: number
  tone?: 'default' | 'warning' | 'danger'
}

type TodayTask = {
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

const READINESS_TINT = [
  'bg-[var(--lux-blush)]',
  'bg-[var(--lux-cream)]',
  'bg-[var(--lux-sage-mist)]',
  'bg-[var(--lux-mist)]',
  'bg-[var(--lux-lilac)]',
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

  const attentionTotal = attention.reduce((sum, item) => sum + item.count, 0)
  const stats = [
    {
      label: 'Needs attention',
      value: loading ? '…' : attentionTotal,
      hint: attentionTotal ? 'Open queues' : 'All clear',
      hintClass: attentionTotal ? 'text-[var(--dashboard-accent-orange)]' : 'text-[var(--dashboard-accent-green)]',
    },
    {
      label: 'Weekend orders',
      value: loading ? '…' : weekendSummary?.total ?? 0,
      hint: weekendLabel || 'Fri–Sun',
      hintClass: 'text-[var(--dashboard-text-muted)]',
    },
    {
      label: 'Ready to load',
      value: loading ? '…' : weekendSummary?.ready ?? 0,
      hint: 'This weekend',
      hintClass: 'text-[var(--dashboard-accent-green)]',
    },
    {
      label: 'Due today',
      value: loading ? '…' : todayTasks.length,
      hint: 'Tasks on the floor',
      hintClass: 'text-[var(--dashboard-text-muted)]',
    },
  ]

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--dashboard-text)] sm:text-4xl">
              {timeGreeting()}, {firstName}
            </h1>
            <p className="mt-1 text-sm text-[var(--dashboard-text-muted)]">
              Let&apos;s see what the floor needs today.
            </p>
          </div>
          <Button asChild className="h-11 rounded-full px-5">
            <Link href="/admin/orders/new">
              <Plus className="h-4 w-4" />
              New order
            </Link>
          </Button>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex min-w-0 flex-col gap-6">
            <section className="grid grid-cols-2 overflow-hidden rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] bg-white shadow-[var(--dashboard-shadow)] lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={cn(
                    'px-5 py-5',
                    index > 0 && 'lg:border-l lg:border-[var(--dashboard-border)]',
                    index >= 2 && 'border-t border-[var(--dashboard-border)] lg:border-t-0',
                    index % 2 === 1 && 'border-l border-[var(--dashboard-border)] lg:border-l',
                  )}
                >
                  <p className="text-sm text-[var(--dashboard-text-muted)]">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[var(--dashboard-text)]">
                    {stat.value}
                  </p>
                  <p className={cn('mt-1 text-xs font-medium', stat.hintClass)}>{stat.hint}</p>
                </div>
              ))}
            </section>

            <AdminPanel>
              <AdminPanelHeader
                title="This weekend"
                description={weekendLabel || 'Upcoming Fri–Sun deliveries'}
                actions={
                  <Button asChild size="sm" className="rounded-full">
                    <Link href="/admin/week-prep">
                      Week Prep
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                }
              />
              <div className="grid gap-3 sm:grid-cols-5">
                {READINESS_KEYS.map((key, index) => (
                  <div key={key} className={cn('rounded-2xl px-3 py-4', READINESS_TINT[index])}>
                    <p className="text-xs font-medium text-[var(--dashboard-text-muted)]">
                      {PREP_READINESS_LABELS[key]}
                    </p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-[var(--dashboard-text)]">
                      {loading ? '…' : weekendSummary?.[key] ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel>
              <AdminPanelHeader
                title="Today's work"
                description="Warehouse and delivery tasks due today."
                actions={
                  <Button asChild size="sm" variant="outline" className="rounded-full bg-white">
                    <Link href={`/admin/warehouse/schedule?date=${toDateString(new Date())}`}>
                      <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                      Schedule
                    </Link>
                  </Button>
                }
              />
              {todayTasks.length === 0 && !loading ? (
                <AdminEmptyState
                  title="No tasks due today"
                  description="When pick, pack, or load work is scheduled for today, it will show up here."
                />
              ) : (
                <ul className="divide-y divide-[var(--dashboard-border)]">
                  {todayTasks.map((task) => (
                    <li key={task.id}>
                      <Link
                        href={task.href}
                        className="flex items-center justify-between gap-3 rounded-xl px-1 py-3 transition-colors hover:bg-[var(--dashboard-card-hover)]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--dashboard-text)]">
                            {task.title}
                          </p>
                          <p className="text-xs text-[var(--dashboard-text-muted)]">
                            {task.category || 'task'}
                            {task.customerName ? ` · ${task.customerName}` : ''}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[var(--lux-cream)] px-2.5 py-1 text-[11px] font-semibold capitalize text-[var(--lux-gold)]">
                          {task.status.replace('_', ' ')}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </AdminPanel>
          </div>

          <aside className="flex flex-col gap-4">
            <MonthRail />
            <AdminPanel>
              <AdminPanelHeader title="Needs attention" description="Queues blocking today's flow." />
              {attention.length === 0 && !loading ? (
                <AdminEmptyState title="You're clear" description="Nothing is waiting on you." />
              ) : (
                <ul className="space-y-2">
                  {attention.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--lux-ivory)] px-3 py-2.5 transition-colors hover:bg-[var(--dashboard-card-hover)]"
                      >
                        <span className="flex items-center gap-2 text-sm text-[var(--dashboard-text)]">
                          <AlertTriangle
                            className={cn(
                              'h-4 w-4',
                              item.tone === 'danger'
                                ? 'text-[var(--dashboard-accent-red)]'
                                : 'text-[var(--dashboard-accent-orange)]',
                            )}
                          />
                          {item.label}
                        </span>
                        <span className="text-sm font-bold tabular-nums">{item.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </AdminPanel>
            <AdminPanel>
              <AdminPanelHeader title="Shortcuts" />
              <div className="grid gap-2">
                {[
                  { href: '/admin/week-prep', label: 'Week Prep', icon: ClipboardCheck },
                  { href: '/admin/scan', label: 'Scanner', icon: QrCode },
                  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
                  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
                  { href: '/admin/delivery', label: 'Delivery', icon: Truck },
                  { href: '/admin/tasks', label: 'Staff tasks', icon: Package },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center gap-3 rounded-2xl px-2 py-2 text-sm font-medium text-[var(--dashboard-text)] transition-colors hover:bg-[var(--lux-ivory)]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--lux-mist)] text-[var(--lux-navy)]">
                        <Icon className="h-4 w-4" />
                      </span>
                      {action.label}
                    </Link>
                  )
                })}
              </div>
            </AdminPanel>
          </aside>
        </div>
      </div>
    </PullToRefresh>
  )
}

function MonthRail() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const startPad = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(startPad).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const label = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <section className="rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] bg-white p-5 shadow-[var(--dashboard-shadow)]">
      <h2 className="text-sm font-semibold text-[var(--dashboard-text)]">{label}</h2>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--dashboard-text-muted)]">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
        {cells.map((day, index) => {
          const isToday = day === now.getDate()
          return (
            <span
              key={index}
              className={cn(
                'flex h-8 items-center justify-center rounded-full text-[var(--dashboard-text)]',
                isToday && 'bg-[var(--lux-navy)] font-semibold text-[#ffffff]',
                !day && 'pointer-events-none opacity-0',
              )}
            >
              {day ?? ''}
            </span>
          )
        })}
      </div>
    </section>
  )
}

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
  AdminStat,
  AdminStatGrid,
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

export function DashboardContent() {
  const router = useRouter()
  const supabase = createClient()
  const [attention, setAttention] = useState<AttentionItem[]>([])
  const [weekendSummary, setWeekendSummary] = useState<WeekPrepSummary | null>(null)
  const [weekendLabel, setWeekendLabel] = useState('')
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
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
      <div className="flex flex-col gap-5">
        <AdminStatGrid>
          <AdminStat
            label="Needs attention"
            value={loading ? '…' : attention.reduce((sum, item) => sum + item.count, 0)}
            tone="warning"
          />
          <AdminStat
            label="Weekend orders"
            value={loading ? '…' : weekendSummary?.total ?? 0}
            hint={weekendLabel}
            tone="accent"
          />
          <AdminStat
            label="Ready this weekend"
            value={loading ? '…' : weekendSummary?.ready ?? 0}
            tone="success"
          />
          <AdminStat label="Due today" value={loading ? '…' : todayTasks.length} />
        </AdminStatGrid>

        <div className="grid gap-5 xl:grid-cols-3">
          <AdminPanel className="xl:col-span-1">
            <AdminPanelHeader title="Needs attention" description="Queues that block today’s flow." />
            {attention.length === 0 && !loading ? (
              <AdminEmptyState
                title="You're clear"
                description="No pending confirmations, leads, or overdue warehouse work."
              />
            ) : (
              <ul className="space-y-2">
                {attention.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)]/40 px-3 py-2.5 transition-colors hover:bg-[var(--dashboard-card-hover)]"
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
                      <span className="text-sm font-semibold tabular-nums text-[var(--dashboard-accent-gold)]">
                        {item.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel className="xl:col-span-2">
            <AdminPanelHeader
              title="This weekend"
              description={weekendLabel || 'Upcoming Fri–Sun deliveries'}
              actions={
                <Button asChild size="sm" className="bg-[var(--dashboard-accent-gold)] text-[#121110]">
                  <Link href="/admin/week-prep">
                    Open Week Prep
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              }
            />
            <div className="grid gap-3 sm:grid-cols-5">
              {READINESS_KEYS.map((key) => (
                <div
                  key={key}
                  className="rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-background)]/40 px-3 py-3"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">
                    {PREP_READINESS_LABELS[key]}
                  </p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--dashboard-text)]">
                    {loading ? '…' : weekendSummary?.[key] ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <AdminPanel className="xl:col-span-2">
            <AdminPanelHeader
              title="Today’s work"
              description="Warehouse and delivery tasks due today."
              actions={
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-[var(--dashboard-border)] bg-transparent"
                >
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
                      className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-[var(--dashboard-accent-gold)]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--dashboard-text)]">
                          {task.title}
                        </p>
                        <p className="text-xs text-[var(--dashboard-text-muted)]">
                          {task.category || 'task'}
                          {task.customerName ? ` · ${task.customerName}` : ''}
                          {` · ${task.status.replace('_', ' ')}`}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--dashboard-text-muted)]" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader title="Quick actions" description="Common next steps." />
            <div className="grid gap-2">
              {[
                { href: '/admin/orders/new', label: 'New order', icon: Plus },
                { href: '/admin/week-prep', label: 'Week Prep', icon: ClipboardCheck },
                { href: '/admin/scan', label: 'Open scanner', icon: QrCode },
                { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
                { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
                { href: '/admin/delivery', label: 'Delivery planner', icon: Truck },
                { href: '/admin/warehouse/schedule', label: 'Warehouse schedule', icon: Package },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-md border border-[var(--dashboard-border)] px-3 py-2.5 text-sm text-[var(--dashboard-text)] transition-colors hover:bg-[var(--dashboard-card-hover)]"
                  >
                    <Icon className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                    {action.label}
                  </Link>
                )
              })}
            </div>
          </AdminPanel>
        </div>
      </div>
    </PullToRefresh>
  )
}

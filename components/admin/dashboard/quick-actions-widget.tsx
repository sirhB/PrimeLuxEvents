'use client'

import Link from 'next/link'
import {
  Plus,
  Package,
  Users,
  Calendar,
  MessageSquare,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptics } from '@/lib/utils/haptics'
import { AdminPanel, AdminPanelHeader } from '@/components/admin/page-shell'

const quickActions = [
  { label: 'New order', description: 'Create a booking', href: '/admin/orders/new', icon: Plus },
  { label: 'Add product', description: 'Grow the catalog', href: '/admin/products/new', icon: Package },
  { label: 'Calendar', description: 'Plan upcoming events', href: '/admin/calendar', icon: Calendar },
  { label: 'Staff', description: 'Manage team access', href: '/admin/team', icon: Users },
  { label: 'Messages', description: 'Open the inbox', href: '/admin/messages', icon: MessageSquare },
  { label: 'Logistics', description: 'Run deliveries', href: '/admin/logistics', icon: Truck },
]

export function QuickActionsWidget() {
  return (
    <AdminPanel>
      <AdminPanelHeader title="Quick actions" description="Jump into the work that comes up most often." />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              href={action.href}
              onClick={() => haptics.impact()}
              className={cn(
                'group flex items-start gap-3 rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)]/40 p-3 transition-colors',
                'hover:border-[var(--dashboard-accent-gold)]/35 hover:bg-[var(--dashboard-card-hover)]',
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] text-[var(--dashboard-accent-gold)]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--dashboard-text)]">{action.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--dashboard-text-muted)]">{action.description}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </AdminPanel>
  )
}

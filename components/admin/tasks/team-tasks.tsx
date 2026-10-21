'use client'

import { useState } from 'react'
import { contactName, isoOffset, type DeskWorkspace, type StaffTask } from '@/lib/venues/desk'
import { useDesk } from '@/components/admin/venue/use-desk'
import { cn } from '@/lib/utils'
import { PanelTabs } from '@/components/admin/panel-tabs'

const COLUMNS: StaffTask['status'][] = ['pending', 'in_progress', 'completed']

export function TeamTasks({ initial, live = false }: { initial: DeskWorkspace; live?: boolean }) {
  const api = useDesk(initial, live)
  const [tab, setTab] = useState<'board' | 'workload' | 'calendar'>('board')
  const today = isoOffset(0)

  const label: Record<StaffTask['status'], string> = { pending: 'To do', in_progress: 'In progress', completed: 'Done', cancelled: 'Cancelled' } as Record<StaffTask['status'], string>
  const openCount = api.desk.tasks.filter((task) => task.status !== 'completed' && task.status !== 'cancelled').length
  const lateCount = api.desk.tasks.filter((task) => task.due_on && task.due_on < today && task.status !== 'completed' && task.status !== 'cancelled').length

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--dashboard-text-muted)]">
        <span className="font-medium tabular-nums text-[var(--dashboard-text)]">{openCount}</span> open
        {lateCount > 0 && <> · <span className="font-medium tabular-nums text-[var(--dashboard-accent-red)]">{lateCount}</span> late</>}
      </p>
      <PanelTabs label="Team tasks" tabs={['board', 'workload', 'calendar'] as const} value={tab} onChange={setTab} />
      {tab === 'board' && (
        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {COLUMNS.map((status) => {
            const items = api.desk.tasks.filter((task) => task.status === status)
            return (
              <section key={status} aria-label={label[status]} className="w-[82vw] max-w-[20rem] shrink-0 snap-start md:w-auto md:max-w-none">
                <h2 className="border-b-2 border-[var(--theme-dark)] pb-2 text-sm font-medium">
                  {label[status]} <span className="font-normal tabular-nums text-[var(--dashboard-text-muted)]">{items.length}</span>
                </h2>
                <ul className="space-y-2 pt-2">
                  {items.length === 0 && <li className="py-4 text-xs text-[var(--dashboard-text-muted)]">Nothing here.</li>}
                  {items.map((task) => {
                    const late = task.due_on && task.due_on < today && status !== 'completed'
                    return (
                      <li key={task.id} className="border border-[var(--dashboard-border)] bg-white p-3 text-sm">
                        <p className="font-medium">{task.title}</p>
                        <p className="mt-0.5 text-xs text-[var(--dashboard-text-muted)]">
                          {task.assignee_name} · <span className={cn('tabular-nums', late && 'font-medium text-[var(--dashboard-accent-red)]')}>{task.due_on || 'No date'}</span>
                          {task.audience === 'client' ? ' · client-facing' : ''}
                        </p>
                        {status !== 'completed' && (
                          <button type="button" className="hub-chip mt-3 !min-h-9" onClick={() => api.markTask(task.id, status === 'pending' ? 'in_progress' : 'completed')}>
                            {status === 'pending' ? 'Start' : 'Mark done'}
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      )}
      {tab === 'workload' && (
        <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)]">
          {[...new Set(api.desk.tasks.map((task) => task.assignee_name))].map((name) => {
            const open = api.desk.tasks.filter((task) => task.assignee_name === name && task.status !== 'completed' && task.status !== 'cancelled')
            return (
              <li key={name} className="grid gap-2 py-4 md:grid-cols-[12rem_minmax(0,1fr)]">
                <p><span className="font-medium">{name}</span> <span className="text-sm tabular-nums text-[var(--dashboard-text-muted)]">· {open.length} open</span></p>
                <p className="text-sm text-[var(--dashboard-text-muted)]">{open.map((task) => task.title).join(' · ') || 'Clear'}</p>
              </li>
            )
          })}
        </ul>
      )}
      {tab === 'calendar' && (
        <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)]">
          {api.desk.tasks.filter((task) => task.due_on).sort((a, b) => (a.due_on || '').localeCompare(b.due_on || '')).map((task) => {
            const lead = api.desk.leads.find((item) => item.id === task.lead_id)
            const late = task.due_on && task.due_on < today && task.status !== 'completed'
            return (
              <li key={task.id} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-0.5 py-3 text-sm md:grid-cols-[7rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <span className={cn('tabular-nums', late && 'font-medium text-[var(--dashboard-accent-red)]')}>{task.due_on}</span>
                <span className="font-medium">{task.title}</span>
                <span className="col-start-2 text-[var(--dashboard-text-muted)] md:col-start-auto">{task.assignee_name}</span>
                <span className="col-start-2 text-[var(--dashboard-text-muted)] md:col-start-auto">{lead ? contactName(api.desk, lead.contact_id) : 'General'}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

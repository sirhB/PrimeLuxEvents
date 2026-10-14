'use client'

import { useState } from 'react'
import { contactName, isoOffset, type DeskWorkspace, type StaffTask } from '@/lib/venues/desk'
import { useDesk } from '@/components/admin/venue/use-desk'
import { cn } from '@/lib/utils'

const COLUMNS: StaffTask['status'][] = ['pending', 'in_progress', 'completed']

export function TeamTasks({ initial, live = false }: { initial: DeskWorkspace; live?: boolean }) {
  const api = useDesk(initial, live)
  const [tab, setTab] = useState<'board' | 'workload' | 'calendar'>('board')
  const today = isoOffset(0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(['board', 'workload', 'calendar'] as const).map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={cn('min-h-10 border px-3 text-[11px] uppercase tracking-[0.16em]', tab === item && 'bg-[var(--theme-dark)] text-[var(--theme-on-dark)]')}>{item}</button>
        ))}
      </div>
      {tab === 'board' && (
        <div className="grid gap-3 md:grid-cols-3">
          {COLUMNS.map((status) => (
            <section key={status} className="border border-[var(--dashboard-border)] bg-white p-3">
              <h2 className="text-[11px] uppercase tracking-[0.16em]">{status.replace('_', ' ')}</h2>
              <ul className="mt-3 space-y-2">
                {api.desk.tasks.filter((task) => task.status === status).map((task) => (
                  <li key={task.id} className="border border-[var(--dashboard-border)] p-3 text-sm">
                    <p className="font-medium">{task.title}{task.audience === 'client' ? ' · client' : ''}</p>
                    <p className="text-[var(--dashboard-text-muted)]">{task.assignee_name} · {task.due_on || 'No date'}</p>
                    {status !== 'completed' && <button type="button" className="mt-2 text-[11px] uppercase tracking-[0.14em] underline" onClick={() => api.markTask(task.id, status === 'pending' ? 'in_progress' : 'completed')}>{status === 'pending' ? 'Start' : 'Done'}</button>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      {tab === 'workload' && (
        <div className="grid gap-3 md:grid-cols-3">
          {[...new Set(api.desk.tasks.map((task) => task.assignee_name))].map((name) => {
            const open = api.desk.tasks.filter((task) => task.assignee_name === name && task.status !== 'completed' && task.status !== 'cancelled')
            return (
              <article key={name} className="border border-[var(--dashboard-border)] bg-white p-4">
                <h2 className="font-serif text-3xl">{name}</h2>
                <p className="mt-1 text-sm text-[var(--dashboard-text-muted)]">{open.length} open</p>
                <ul className="mt-3 space-y-1 text-sm">
                  {open.map((task) => <li key={task.id}>{task.title}</li>)}
                </ul>
              </article>
            )
          })}
        </div>
      )}
      {tab === 'calendar' && (
        <ul className="border border-[var(--dashboard-border)] bg-white">
          {api.desk.tasks.filter((task) => task.due_on).sort((a, b) => (a.due_on || '').localeCompare(b.due_on || '')).map((task) => {
            const lead = api.desk.leads.find((item) => item.id === task.lead_id)
            const late = task.due_on && task.due_on < today && task.status !== 'completed'
            return (
              <li key={task.id} className="grid gap-1 border-b border-[var(--dashboard-border)] px-4 py-3 text-sm md:grid-cols-4">
                <span className={late ? 'text-red-700' : ''}>{task.due_on}</span>
                <span>{task.title}</span>
                <span>{task.assignee_name}</span>
                <span className="text-[var(--dashboard-text-muted)]">{lead ? contactName(api.desk, lead.contact_id) : 'General'}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { contactName, isOverdue, isToday, isoOffset, type DeskWorkspace, type Notice } from '@/lib/venues/desk'
import { useDesk } from '@/components/admin/venue/use-desk'

export function MyTasksPanel({ initial, assignee = 'Mara Quinn', live = false }: { initial: DeskWorkspace; assignee?: string; live?: boolean }) {
  const api = useDesk(initial, live)
  const [comment, setComment] = useState('')
  const [active, setActive] = useState('')
  const [dismissed, setDismissed] = useState<string[]>([])
  const today = isoOffset(0)
  const mine = api.desk.tasks.filter((task) => task.assignee_name === assignee && task.status !== 'cancelled')
  const groups = [
    { id: 'overdue', title: 'Overdue', tasks: mine.filter((task) => isOverdue(task, today)) },
    { id: 'today', title: 'Today', tasks: mine.filter((task) => isToday(task, today)) },
    { id: 'upcoming', title: 'Upcoming', tasks: mine.filter((task) => task.due_on && task.due_on > today && task.status !== 'completed') },
    { id: 'done', title: 'Done', tasks: mine.filter((task) => task.status === 'completed') },
  ]
  const dueNotices: Notice[] = mine.flatMap((task) => {
    if (api.desk.notices.some((notice) => notice.body.includes(task.title))) return []
    if (isOverdue(task, today)) return [{ id: `due-${task.id}`, title: 'Task overdue', body: `${task.title} is overdue.`, href: '/admin/my-tasks', read: false, kind: 'due' as const }]
    if (isToday(task, today)) return [{ id: `due-${task.id}`, title: 'Due today', body: `${task.title} is due today.`, href: '/admin/my-tasks', read: false, kind: 'due' as const }]
    return []
  })
  const unread = [...api.desk.notices, ...dueNotices].filter((notice) => !notice.read && !dismissed.includes(notice.id))

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <section className="border border-[var(--dashboard-border)] bg-white p-4">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-[var(--dashboard-text-muted)]">Notifications</h2>
        <ul className="mt-2 space-y-2">
          {unread.length === 0 && <li className="text-sm text-[var(--dashboard-text-muted)]">You are caught up.</li>}
          {unread.map((notice) => (
            <li key={notice.id} className="flex items-start justify-between gap-3 text-sm">
              <span><span className="uppercase tracking-[0.12em]">{notice.kind}</span> · {notice.body}</span>
              <button type="button" className="text-[11px] uppercase tracking-[0.14em]" onClick={() => { api.readNotice(notice.id); setDismissed((current) => [...current, notice.id]) }}>Read</button>
            </li>
          ))}
        </ul>
      </section>
      {groups.map((group) => (
        <section key={group.id}>
          <h2 className="font-serif text-3xl">{group.title}</h2>
          <ul className="mt-3 space-y-3">
            {group.tasks.length === 0 && <li className="text-sm text-[var(--dashboard-text-muted)]">Nothing here.</li>}
            {group.tasks.map((task) => {
              const lead = api.desk.leads.find((item) => item.id === task.lead_id)
              return (
                <li key={task.id} className="border border-[var(--dashboard-border)] bg-white p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">{task.priority} · {task.due_on}</p>
                  <h3 className="mt-1 font-serif text-2xl">{task.title}</h3>
                  <p className="text-sm text-[var(--dashboard-text-muted)]">{lead ? contactName(api.desk, lead.contact_id) : 'General'} · {lead?.venue_name || 'No room'}</p>
                  <ul className="mt-3 space-y-1">
                    {task.checklist.map((item) => (
                      <li key={item.id}>
                        <label className="flex min-h-9 items-center gap-2 text-sm">
                          <input type="checkbox" checked={item.done} onChange={() => api.toggleCheck(task.id, item.id)} />
                          {item.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                  {task.comments.map((item) => <p key={item.id} className="mt-2 text-sm">{item.author_name}: {item.body}</p>)}
                  {task.status !== 'completed' && (
                    <button type="button" className="lux-cta mt-4 w-full" onClick={() => api.markTask(task.id, 'completed')}>Mark done</button>
                  )}
                  <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (active === task.id) { api.addComment(task.id, comment); setComment('') } }}>
                    <input value={active === task.id ? comment : ''} onFocus={() => setActive(task.id)} onChange={(event) => { setActive(task.id); setComment(event.target.value) }} placeholder="Comment" className="plan-field" />
                  </form>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

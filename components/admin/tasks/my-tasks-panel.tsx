'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
    <div className="mx-auto grid max-w-5xl gap-x-12 md:grid-cols-[minmax(0,1fr)_18rem]">
      <aside className="order-first md:order-last">
        <section aria-labelledby="notices" className="mb-8 border border-[var(--dashboard-border)] bg-white p-4">
          <h2 id="notices" className="text-sm font-medium">Notifications <span className="font-normal tabular-nums text-[var(--dashboard-text-muted)]">{unread.length}</span></h2>
          <ul className="mt-2">
            {unread.length === 0 && <li className="text-sm text-[var(--dashboard-text-muted)]">You are caught up.</li>}
            <AnimatePresence initial={false}>
              {unread.map((notice) => (
                <motion.li
                  key={notice.id}
                  exit={{ opacity: 0, transition: { duration: 0.12, ease: [0.23, 1, 0.32, 1] } }}
                  className="flex items-start justify-between gap-3 border-t border-[var(--dashboard-border)] py-2 text-sm first:border-0"
                >
                  <span><span className="font-medium capitalize">{notice.kind}</span> · {notice.body}</span>
                  <button type="button" className="min-h-9 shrink-0 text-xs underline underline-offset-4" onClick={() => { api.readNotice(notice.id); setDismissed((current) => [...current, notice.id]) }}>Mark read</button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      </aside>
      <div>
        {groups.map((group) => (
          <section key={group.id} className="mb-10" aria-labelledby={`group-${group.id}`}>
            <h2 id={`group-${group.id}`} className="flex items-baseline gap-2 border-b border-[var(--dashboard-border)] pb-2 font-serif text-[1.65rem] leading-tight">
              <span className={group.id === 'overdue' && group.tasks.length ? 'text-[var(--dashboard-accent-red)]' : ''}>{group.title}</span>
              <span className="font-sans text-sm tabular-nums text-[var(--dashboard-text-muted)]">{group.tasks.length}</span>
            </h2>
            <ul className="divide-y divide-[var(--dashboard-border)]">
              {group.tasks.length === 0 && <li className="py-3 text-sm text-[var(--dashboard-text-muted)]">Nothing here.</li>}
              {group.tasks.map((task) => {
                const lead = api.desk.leads.find((item) => item.id === task.lead_id)
                const doneCount = task.checklist.filter((item) => item.done).length
                return (
                  <li key={task.id} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="mt-0.5 text-xs text-[var(--dashboard-text-muted)]">
                          <span className="capitalize">{task.priority}</span> · <span className="tabular-nums">{task.due_on || 'No date'}</span> · {lead ? contactName(api.desk, lead.contact_id) : 'General'}{lead?.venue_name ? ` · ${lead.venue_name}` : ''}
                        </p>
                      </div>
                      {task.status !== 'completed' && (
                        <button type="button" className="hub-chip" onClick={() => api.markTask(task.id, 'completed')}>Mark done</button>
                      )}
                    </div>
                    {task.checklist.length > 0 && (
                      <ul className="mt-2">
                        <li className="text-xs tabular-nums text-[var(--dashboard-text-muted)]">{doneCount} of {task.checklist.length}</li>
                        {task.checklist.map((item) => (
                          <li key={item.id}>
                            <label className="flex min-h-10 items-center gap-3 text-sm">
                              <input type="checkbox" className="h-4 w-4 accent-[var(--theme-dark)]" checked={item.done} onChange={() => api.toggleCheck(task.id, item.id)} />
                              <span className={item.done ? 'text-[var(--dashboard-text-muted)] line-through' : ''}>{item.label}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                    {task.comments.map((item) => <p key={item.id} className="mt-2 text-sm"><span className="font-medium">{item.author_name}</span> {item.body}</p>)}
                    <form className="mt-2" onSubmit={(event) => { event.preventDefault(); if (active === task.id) { api.addComment(task.id, comment); setComment('') } }}>
                      <input aria-label={`Comment on ${task.title}`} value={active === task.id ? comment : ''} onFocus={() => setActive(task.id)} onChange={(event) => { setActive(task.id); setComment(event.target.value) }} placeholder="Add a comment and press Enter" className="plan-field !mt-0 !min-h-10 !text-sm" />
                    </form>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

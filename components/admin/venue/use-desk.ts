'use client'

import { useState } from 'react'
import {
  applyStage,
  findHoldConflicts,
  type Activity,
  type DeskWorkspace,
  type Hold,
  type PipelineStage,
  type ProposalLine,
  type SavedView,
  type StaffTask,
  type TaskTemplate,
} from '@/lib/venues/desk'
import { persistActivity, persistHold, persistStage, persistTaskStatus, persistTemplates } from '@/app/admin/venue/crm-actions'

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

export function useDesk(initial: DeskWorkspace, live = false) {
  const [desk, setDesk] = useState(initial)
  const [message, setMessage] = useState('')
  const fail = (error: unknown) => setMessage(error instanceof Error ? error.message : 'Saved on this screen only.')

  return {
    desk,
    message,
    setMessage,
    setStage(leadId: string, stage: PipelineStage) {
      setDesk((current) => applyStage(current, leadId, stage))
      setMessage('Stage updated. Matching tasks were added.')
      if (live) void persistStage(leadId, stage, desk).catch(fail)
    },
    logActivity(leadId: string, kind: Activity['kind'], body: string) {
      if (!body.trim()) return
      setDesk((current) => ({
        ...current,
        activities: [{ id: uid('act'), lead_id: leadId, kind, body: body.trim(), author_name: 'You', created_at: new Date().toISOString() }, ...current.activities],
      }))
      if (live) void persistActivity(leadId, kind, body).catch(fail)
    },
    setOwner(leadId: string, owner_name: string) {
      setDesk((current) => ({
        ...current,
        leads: current.leads.map((lead) => lead.id === leadId ? { ...lead, owner_name } : lead),
        notices: [{ id: uid('notice'), title: 'Lead assigned', body: `Owner set to ${owner_name}.`, href: '/admin/venue', read: false, kind: 'assignment' }, ...current.notices],
      }))
    },
    scheduleTour(leadId: string, startsAt: string) {
      const lead = desk.leads.find((item) => item.id === leadId)
      if (!lead || !startsAt) return
      setDesk((current) => ({
        ...current,
        tours: [...current.tours, { id: uid('tour'), lead_id: leadId, venue_id: lead.venue_id, venue_name: lead.venue_name || 'Venue', starts_at: startsAt, status: 'scheduled' }],
      }))
      setDesk((current) => applyStage(current, leadId, 'tour'))
      setMessage('Tour is on the calendar.')
    },
    holdDate(leadId: string, starts: string, ends: string) {
      const lead = desk.leads.find((item) => item.id === leadId)
      if (!lead || !starts) return { ok: false as const, conflicts: [] as Hold[] }
      const finish = ends || starts
      const conflicts = findHoldConflicts(desk.holds, lead.venue_id, starts, finish)
      if (conflicts.length) {
        setMessage(`Conflict with ${conflicts.map((item) => item.venue_name).join(', ')} on those dates.`)
        return { ok: false as const, conflicts }
      }
      setDesk((current) => {
        const withHold = {
          ...current,
          holds: [...current.holds, { id: uid('hold'), lead_id: leadId, venue_id: lead.venue_id, venue_name: lead.venue_name || 'Venue', starts_on: starts, ends_on: finish, status: 'hold' }],
        }
        const stage = withHold.leads.find((item) => item.id === leadId)?.stage
        if (stage === 'booked' || stage === 'completed') return withHold
        return applyStage(withHold, leadId, 'booked')
      })
      setMessage('Date held. Booking tasks were added.')
      if (live && lead) void persistHold(leadId, lead.venue_id, starts, finish).catch(fail)
      return { ok: true as const, conflicts: [] as Hold[] }
    },
    saveProposal(leadId: string, lines: ProposalLine[]) {
      setDesk((current) => {
        const existing = current.proposals.find((item) => item.lead_id === leadId)
        const proposal = existing
          ? { ...existing, lines, status: existing.status }
          : { id: uid('prop'), lead_id: leadId, title: 'Proposal', status: 'draft' as const, lines }
        return {
          ...current,
          proposals: existing ? current.proposals.map((item) => item.id === existing.id ? proposal : item) : [...current.proposals, proposal],
          leads: current.leads.map((lead) => lead.id === leadId ? { ...lead, value_cents: lines.reduce((sum, line) => sum + line.quantity * line.unit_cents, 0) } : lead),
        }
      })
    },
    setContract(leadId: string, status: 'draft' | 'sent' | 'signed') {
      setDesk((current) => {
        const existing = current.contracts.find((item) => item.lead_id === leadId)
        const next = { id: existing?.id || uid('con'), lead_id: leadId, proposal_id: existing?.proposal_id || null, status, signed_at: status === 'signed' ? new Date().toISOString() : null }
        return { ...current, contracts: existing ? current.contracts.map((item) => item.lead_id === leadId ? next : item) : [...current.contracts, next] }
      })
    },
    setPayment(leadId: string, status: 'due' | 'paid' | 'waived') {
      setDesk((current) => ({
        ...current,
        payments: current.payments.some((item) => item.lead_id === leadId)
          ? current.payments.map((item) => item.lead_id === leadId && item.kind === 'deposit' ? { ...item, status } : item)
          : [...current.payments, { id: uid('pay'), lead_id: leadId, kind: 'deposit', status, amount_cents: 500_000, due_on: null }],
      }))
    },
    addReminder(leadId: string, due_on: string, body: string) {
      if (!due_on || !body.trim()) return
      setDesk((current) => ({
        ...current,
        reminders: [...current.reminders, { id: uid('rem'), lead_id: leadId, due_on, body: body.trim(), done: false, owner_name: 'You' }],
        notices: [{ id: uid('notice'), title: 'Follow-up set', body: body.trim(), href: '/admin/my-tasks', read: false, kind: 'due' }, ...current.notices],
      }))
    },
    saveView(view: Omit<SavedView, 'id'>) {
      setDesk((current) => ({ ...current, views: [...current.views, { ...view, id: uid('view') }] }))
      setMessage(`Saved view “${view.name}”.`)
    },
    markTask(taskId: string, status: StaffTask['status']) {
      setDesk((current) => ({
        ...current,
        tasks: current.tasks.map((task) => task.id === taskId ? { ...task, status } : task),
      }))
      if (live) void persistTaskStatus(taskId, status).catch(fail)
    },
    toggleCheck(taskId: string, checkId: string) {
      setDesk((current) => ({
        ...current,
        tasks: current.tasks.map((task) => task.id === taskId ? {
          ...task,
          checklist: task.checklist.map((item) => item.id === checkId ? { ...item, done: !item.done } : item),
        } : task),
      }))
    },
    addComment(taskId: string, body: string) {
      if (!body.trim()) return
      setDesk((current) => ({
        ...current,
        tasks: current.tasks.map((task) => task.id === taskId ? {
          ...task,
          comments: [...task.comments, { id: uid('cm'), body: body.trim(), author_name: 'You', created_at: new Date().toISOString() }],
        } : task),
      }))
    },
    saveTemplates(templates: TaskTemplate[], announce = false) {
      setDesk((current) => ({ ...current, templates }))
      if (!announce) return
      setMessage('Templates saved.')
      if (live) void persistTemplates(templates).catch(fail)
    },
    readNotice(id: string) {
      setDesk((current) => ({ ...current, notices: current.notices.map((notice) => notice.id === id ? { ...notice, read: true } : notice) }))
    },
  }
}


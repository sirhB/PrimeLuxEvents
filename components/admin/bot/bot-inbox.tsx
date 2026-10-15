'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { submitBotRequest } from '@/app/admin/bot-control/actions'

export function BotInbox() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pending, setPending] = useState(false)

  return (
    <form
      className="max-w-xl space-y-3 rounded-2xl border border-[var(--dashboard-border)] bg-white p-4 sm:p-6"
      onSubmit={async (event) => {
        event.preventDefault()
        setPending(true)
        const result = await submitBotRequest({ botId: '', title, body, submittedBy: 'Staff' })
        setPending(false)
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        setTitle('')
        setBody('')
        toast.success('Request sent')
      }}
    >
      <h2 className="font-serif text-3xl">Ask a bot</h2>
      <p className="text-sm text-[var(--dashboard-text-muted)]">This does not show keys or the service role.</p>
      <input className="plan-field" aria-label="Request title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
      <textarea className="plan-field min-h-28" aria-label="Request details" value={body} onChange={(event) => setBody(event.target.value)} placeholder="What should it look at?" />
      <button className="lux-cta min-h-11 w-full sm:w-auto" type="submit" disabled={pending}>Send</button>
    </form>
  )
}

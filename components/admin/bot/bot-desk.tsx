'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { toast, Toaster } from 'sonner'
import { BotControl } from '@/components/admin/bot/bot-control'
import { BOT_SCOPES, decideBotAction, type Guardrails } from '@/lib/bots/policy'
import { reduceBotDesk, WEBHOOK_EVENTS, type BotDeskState, type BotRecord, type WebhookEvent } from '@/lib/bots/state'
import { diffLines } from '@/lib/bots/versions'
import { deliveryStatus, MAX_WEBHOOK_ATTEMPTS } from '@/lib/bots/delivery'
import { SiriSetup } from '@/components/admin/bot/siri-setup'
import type { VoiceSnapshot } from '@/lib/bots/voice'

const SECTIONS = [
  ['prompts', 'Prompts'],
  ['roster', 'Roster'],
  ['keys', 'Keys'],
  ['activity', 'Activity'],
  ['approvals', 'Approvals'],
  ['schedule', 'Schedule'],
  ['digest', 'Digest'],
  ['guardrails', 'Guardrails'],
  ['versions', 'Versions'],
  ['inbox', 'Inbox'],
  ['webhooks', 'Webhooks'],
  ['siri', 'Siri'],
] as const

type SectionId = (typeof SECTIONS)[number][0]

const DAY_LABELS = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
]

export function BotDesk({
  projectRef,
  schema,
  digest,
  voice,
  initial,
  hostToast = false,
}: {
  projectRef: string
  schema: string
  digest: string
  voice: VoiceSnapshot
  initial: BotDeskState
  hostToast?: boolean
}) {
  const [section, setSection] = useState<SectionId>('prompts')
  const [state, setState] = useState(initial)
  const [draftName, setDraftName] = useState('')
  const [draftRole, setDraftRole] = useState('Ops and staff tasks')
  const [requestTitle, setRequestTitle] = useState('')
  const [leftVersion, setLeftVersion] = useState('ver-master-1')
  const [rightVersion, setRightVersion] = useState('ver-master-2')

  function apply(action: Parameters<typeof reduceBotDesk>[1], message?: string) {
    setState((current) => reduceBotDesk(current, action))
    if (message) toast.success(message)
  }

  return (
    <div className="space-y-5">
      {hostToast && (
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: { toast: 'bg-white border border-black/10 text-black shadow-lg font-sans', title: 'text-black font-medium' },
            duration: 2500,
          }}
        />
      )}
      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Bot control sections">
        {SECTIONS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            data-section={id}
            aria-pressed={section === id}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-[11px] uppercase tracking-[0.16em] ${
              section === id ? 'border-black bg-black text-white' : 'border-black/15 bg-white'
            }`}
            onClick={() => setSection(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {section === 'prompts' && <BotControl projectRef={projectRef} schema={schema} />}
      {section === 'roster' && (
        <Section title="Roster" lede="Name, role, scopes, and whether the bot is running.">
          <form
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault()
              const name = draftName.trim()
              if (name.length < 2) return
              apply(
                {
                  type: 'save-bot',
                  bot: {
                    id: `bot-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                    name,
                    role: draftRole,
                    scopes: ['leads:read', 'tasks:read'],
                    status: 'active',
                    timezone: 'America/New_York',
                    digestTime: '8:00 AM',
                    runDays: [1, 2, 3, 4, 5],
                    runStart: '08:00',
                    runEnd: '18:00',
                    webhookUrl: '',
                    webhookEvents: ['lead.created'],
                    secretSet: false,
                  },
                },
                'Bot added',
              )
              setDraftName('')
            }}
          >
            <input className="plan-field" aria-label="Bot name" placeholder="Bot name" value={draftName} onChange={(event) => setDraftName(event.target.value)} />
            <input className="plan-field" aria-label="Bot role" value={draftRole} onChange={(event) => setDraftRole(event.target.value)} />
            <button className="lux-cta min-h-11 w-full sm:w-auto" type="submit">Add bot</button>
          </form>
          <div className="mt-4 space-y-3">
            {state.bots.map((bot) => (
              <article key={bot.id} className="rounded-xl border border-black/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-serif text-xl">{bot.name}</h3>
                    <p className="text-sm text-[var(--dashboard-text-muted)]">{bot.role}</p>
                    <p className="mt-2 text-sm">{bot.scopes.join(' · ')}</p>
                  </div>
                  <button
                    type="button"
                    className="lux-cta-ghost min-h-11 w-full sm:w-auto"
                    onClick={() => apply({ type: 'set-status', id: bot.id, status: bot.status === 'active' ? 'paused' : 'active' }, bot.status === 'active' ? 'Paused' : 'Active')}
                  >
                    {bot.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-[0.16em]">{bot.status}</p>
              </article>
            ))}
          </div>
        </Section>
      )}
      {section === 'keys' && (
        <KeysSection state={state} onApply={apply} />
      )}
      {section === 'activity' && (
        <Section title="Activity" lede="Every bot write keeps the value before and after. Undo puts the earlier value back.">
          <div className="space-y-3">
            {state.activity.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-black/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-serif text-xl">{entry.action}</h3>
                    <p className="text-sm text-[var(--dashboard-text-muted)]">{entry.botName} · {entry.createdAt.slice(0, 16).replace('T', ' ')}</p>
                  </div>
                  {entry.reversible && !entry.undoneAt && (
                    <button type="button" className="lux-cta min-h-11 w-full sm:w-auto" onClick={() => apply({ type: 'undo', id: entry.id, at: new Date().toISOString() }, 'Undone')}>
                      Undo
                    </button>
                  )}
                </div>
                <p className="mt-3 text-sm">Before {JSON.stringify(entry.before)}</p>
                <p className="text-sm">After {JSON.stringify(entry.after)}</p>
                {entry.undoneAt && <p className="mt-2 text-[11px] uppercase tracking-[0.16em]">Undone</p>}
              </article>
            ))}
          </div>
        </Section>
      )}
      {section === 'approvals' && (
        <Section title="Approvals" lede="Client messages, deletes, and price changes over the threshold wait here.">
          <div className="space-y-3">
            {state.approvals.map((item) => (
              <article key={item.id} className="rounded-xl border border-black/10 p-4">
                <h3 className="font-serif text-xl">{item.action}</h3>
                <p className="mt-1 text-sm">{item.summary}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em]">{item.status}</p>
                {item.status === 'pending' && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <button type="button" className="lux-cta min-h-11 w-full sm:w-auto" onClick={() => apply({ type: 'decide', id: item.id, status: 'approved' }, 'Approved')}>Approve</button>
                    <button type="button" className="lux-cta-ghost min-h-11 w-full sm:w-auto" onClick={() => apply({ type: 'decide', id: item.id, status: 'rejected' }, 'Rejected')}>Reject</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </Section>
      )}
      {section === 'schedule' && (
        <Section title="Schedule" lede="Run days and hours, plus the digest time and timezone.">
          <div className="space-y-4">
            {state.bots.map((bot) => (
              <ScheduleCard key={bot.id} bot={bot} onSave={(next) => apply({ type: 'save-bot', bot: next }, 'Schedule saved')} />
            ))}
          </div>
        </Section>
      )}
      {section === 'digest' && (
        <Section title="Digest preview" lede="Today’s briefing from the venue desk.">
          <pre className="whitespace-pre-wrap rounded-xl border border-black/10 bg-[var(--dashboard-background)] p-4 font-sans text-sm leading-relaxed">{digest}</pre>
        </Section>
      )}
      {section === 'guardrails' && (
        <GuardrailSection guardrails={state.guardrails} onSave={(guardrails) => apply({ type: 'guardrails', guardrails }, 'Guardrails saved')} />
      )}
      {section === 'versions' && (
        <Section title="Prompt versions" lede="History, a line diff, and rollback. Rollback adds a new version. It does not erase the old one.">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              Earlier
              <select className="plan-field" aria-label="Earlier version" value={leftVersion} onChange={(event) => setLeftVersion(event.target.value)}>
                {state.versions.map((version) => (
                  <option key={version.id} value={version.id}>{version.promptId} v{version.version}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Later
              <select className="plan-field" aria-label="Later version" value={rightVersion} onChange={(event) => setRightVersion(event.target.value)}>
                {state.versions.map((version) => (
                  <option key={version.id} value={version.id}>{version.promptId} v{version.version}</option>
                ))}
              </select>
            </label>
          </div>
          <DiffView left={state.versions.find((version) => version.id === leftVersion)?.body || ''} right={state.versions.find((version) => version.id === rightVersion)?.body || ''} />
          <div className="mt-4 space-y-2">
            {state.versions.map((version) => (
              <div key={version.id} className="flex flex-col gap-2 rounded-xl border border-black/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm">{version.promptId} v{version.version} · {version.note}</p>
                <button type="button" className="lux-cta-ghost min-h-11 w-full sm:w-auto" onClick={() => apply({ type: 'rollback', versionId: version.id, at: new Date().toISOString() }, `Rolled back to v${version.version}`)}>
                  Roll back
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}
      {section === 'inbox' && (
        <Section title="Inbox" lede="Staff can ask a bot to do something. Status stays on the request.">
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              const title = requestTitle.trim()
              if (title.length < 3) return
              apply(
                {
                  type: 'add-request',
                  request: {
                    id: `req-${Date.now()}`,
                    botId: state.bots[0]?.id || '',
                    title,
                    body: '',
                    status: 'open',
                    submittedBy: 'Staff',
                    createdAt: new Date().toISOString(),
                  },
                },
                'Request sent',
              )
              setRequestTitle('')
            }}
          >
            <input className="plan-field" aria-label="Request title" placeholder="What should the bot look at?" value={requestTitle} onChange={(event) => setRequestTitle(event.target.value)} />
            <button className="lux-cta min-h-11 w-full sm:w-auto" type="submit">Send request</button>
          </form>
          <div className="mt-4 space-y-3">
            {state.requests.map((request) => (
              <article key={request.id} className="rounded-xl border border-black/10 p-4">
                <h3 className="font-serif text-xl">{request.title}</h3>
                <p className="mt-1 text-sm text-[var(--dashboard-text-muted)]">{request.submittedBy} · {request.body}</p>
                <label className="mt-3 block text-sm">
                  Status
                  <select
                    className="plan-field"
                    aria-label={`Status for ${request.title}`}
                    value={request.status}
                    onChange={(event) => apply({ type: 'set-request-status', id: request.id, status: event.target.value as typeof request.status })}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                    <option value="declined">Declined</option>
                  </select>
                </label>
              </article>
            ))}
          </div>
        </Section>
      )}
      {section === 'webhooks' && <WebhookSection state={state} onApply={apply} />}
      {section === 'siri' && <SiriSetup snapshot={voice} guardrails={state.guardrails} />}
    </div>
  )
}

function Section({ title, lede, children }: { title: string; lede: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--dashboard-border)] bg-white p-4 sm:p-6">
      <h2 className="font-serif text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--dashboard-text-muted)]">{lede}</p>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function KeysSection({ state, onApply }: { state: BotDeskState; onApply: (action: Parameters<typeof reduceBotDesk>[1], message?: string) => void }) {
  const [botId, setBotId] = useState(state.bots[0]?.id || '')
  const [label, setLabel] = useState('Floor key')
  const bot = state.bots.find((item) => item.id === botId) || state.bots[0]
  const [scopes, setScopes] = useState<string[]>(bot?.scopes.filter((scope) => scope.endsWith(':read')) || [])

  return (
    <Section title="Access keys" lede="Each bot gets its own token. The full value is shown once. What is stored is a hash. Revoke cuts it off.">
      {state.revealedKey && (
        <div className="mb-4 rounded-xl border border-black/10 bg-[var(--dashboard-background)] p-4">
          <p className="text-[11px] uppercase tracking-[0.16em]">Shown once</p>
          <p className="mt-2 break-all font-mono text-sm">{state.revealedKey.rawKey}</p>
          <button type="button" className="lux-cta mt-3 min-h-11 w-full sm:w-auto" onClick={() => onApply({ type: 'dismiss-key' }, 'Key hidden')}>
            I have copied it
          </button>
        </div>
      )}
      <div className="grid gap-3">
        <label className="text-sm">
          Bot
          <select className="plan-field" aria-label="Key bot" value={bot?.id || ''} onChange={(event) => setBotId(event.target.value)}>
            {state.bots.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <input className="plan-field" aria-label="Key label" value={label} onChange={(event) => setLabel(event.target.value)} />
        <div className="flex flex-wrap gap-2">
          {(bot?.scopes || []).map((scope) => (
            <label key={scope} className="flex min-h-11 items-center gap-2 rounded-full border border-black/10 px-3 text-sm">
              <input
                type="checkbox"
                checked={scopes.includes(scope)}
                onChange={(event) => setScopes((current) => event.target.checked ? [...current, scope] : current.filter((item) => item !== scope))}
              />
              {scope}
            </label>
          ))}
        </div>
        <button
          type="button"
          className="lux-cta min-h-11 w-full sm:w-auto"
          onClick={() => {
            if (!bot || !scopes.length) return
            const bytes = crypto.getRandomValues(new Uint8Array(24))
            const body = Array.from(bytes, (item) => item.toString(16).padStart(2, '0')).join('').slice(0, 32)
            const rawKey = `plxbot_${body}`
            onApply({
              type: 'reveal-key',
              rawKey,
              key: {
                id: `key-${Date.now()}`,
                botId: bot.id,
                label: label.trim() || 'Key',
                keyPrefix: rawKey.slice(0, 15),
                scopes: [...scopes],
                revokedAt: null,
                lastUsedAt: null,
                createdAt: new Date().toISOString(),
              },
            }, 'Key created')
          }}
        >
          Create key
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {state.keys.map((key) => {
          const owner = state.bots.find((item) => item.id === key.botId)
          return (
            <article key={key.id} className="rounded-xl border border-black/10 p-4">
              <h3 className="font-serif text-xl">{key.label}</h3>
              <p className="mt-1 text-sm">{owner?.name} · {key.keyPrefix}…</p>
              <p className="mt-1 text-sm text-[var(--dashboard-text-muted)]">{key.scopes.join(' · ')}</p>
              <p className="mt-1 text-sm">Last used {key.lastUsedAt ? key.lastUsedAt.slice(0, 16).replace('T', ' ') : 'never'}</p>
              {key.revokedAt ? (
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em]">Revoked</p>
              ) : (
                <button type="button" className="lux-cta-ghost mt-3 min-h-11 w-full sm:w-auto" onClick={() => onApply({ type: 'revoke-key', id: key.id, at: new Date().toISOString() }, 'Key revoked')}>
                  Revoke
                </button>
              )}
            </article>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-[var(--dashboard-text-muted)]">Scopes are checked again on every request. The service role is not a bot key.</p>
    </Section>
  )
}

function ScheduleCard({ bot, onSave }: { bot: BotRecord; onSave: (bot: BotRecord) => void }) {
  const [draft, setDraft] = useState(bot)
  return (
    <form
      className="rounded-xl border border-black/10 p-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSave(draft)
      }}
    >
      <h3 className="font-serif text-xl">{bot.name}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {DAY_LABELS.map((item) => {
          const on = draft.runDays.includes(item.day)
          return (
            <button
              key={item.day}
              type="button"
              aria-pressed={on}
              className={`min-h-11 rounded-full border px-3 text-sm ${on ? 'border-black bg-black text-white' : 'border-black/15'}`}
              onClick={() => setDraft((current) => ({
                ...current,
                runDays: on ? current.runDays.filter((day) => day !== item.day) : [...current.runDays, item.day],
              }))}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Start<input className="plan-field" aria-label={`${bot.name} start`} value={draft.runStart} onChange={(event) => setDraft({ ...draft, runStart: event.target.value })} /></label>
        <label className="text-sm">End<input className="plan-field" aria-label={`${bot.name} end`} value={draft.runEnd} onChange={(event) => setDraft({ ...draft, runEnd: event.target.value })} /></label>
        <label className="text-sm">Digest time<input className="plan-field" aria-label={`${bot.name} digest time`} value={draft.digestTime} onChange={(event) => setDraft({ ...draft, digestTime: event.target.value })} /></label>
        <label className="text-sm">Timezone<input className="plan-field" aria-label={`${bot.name} timezone`} value={draft.timezone} onChange={(event) => setDraft({ ...draft, timezone: event.target.value })} /></label>
      </div>
      <button className="lux-cta mt-3 min-h-11 w-full sm:w-auto" type="submit">Save schedule</button>
    </form>
  )
}

function GuardrailSection({ guardrails, onSave }: { guardrails: Guardrails; onSave: (guardrails: Guardrails) => void }) {
  const [draft, setDraft] = useState(guardrails)
  const sampleBot = { timeZone: 'America/New_York', runDays: [1, 2, 3, 4, 5], runStart: '08:00', runEnd: '18:00', botStatus: 'active' as const, scopes: [...BOT_SCOPES] }
  const examples = useMemo(() => {
    const price = decideBotAction({ ...sampleBot, action: 'prices.update', guardrails: draft, amountCents: 3_200_000, at: new Date('2026-10-15T19:00:00Z') })
    const message = decideBotAction({ ...sampleBot, action: 'clients.message', guardrails: draft, at: new Date('2026-10-15T19:00:00Z') })
    const weekend = decideBotAction({ ...sampleBot, runDays: [6], action: 'leads.stage', guardrails: draft, at: new Date('2026-10-17T19:00:00Z') })
    return { price, message, weekend }
  }, [draft])
  return (
    <Section title="Guardrails" lede="These are checked on the server before a bot write is saved.">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          onSave(draft)
        }}
      >
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" checked={draft.neverContactClients} onChange={(event) => setDraft({ ...draft, neverContactClients: event.target.checked })} />
          Never contact clients
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" checked={draft.readOnlyWeekends} onChange={(event) => setDraft({ ...draft, readOnlyWeekends: event.target.checked })} />
          Read-only on weekends
        </label>
        <label className="block text-sm">
          Require approval over
          <input
            className="plan-field"
            aria-label="Approval threshold"
            inputMode="decimal"
            value={String(draft.approvalThresholdCents / 100)}
            onChange={(event) => setDraft({ ...draft, approvalThresholdCents: Math.round(Number(event.target.value || 0) * 100) })}
          />
        </label>
        <button className="lux-cta min-h-11 w-full sm:w-auto" type="submit">Save guardrails</button>
      </form>
      <ul className="mt-4 space-y-2 text-sm">
        <li>A $32,000 price change would be {examples.price.effect}.</li>
        <li>A client message would be {examples.message.effect}.</li>
        <li>A Saturday stage change would be {examples.weekend.effect}.</li>
      </ul>
    </Section>
  )
}

function DiffView({ left, right }: { left: string; right: string }) {
  const lines = useMemo(() => diffLines(left, right).slice(0, 40), [left, right])
  return (
    <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-black/10 bg-[var(--dashboard-background)] p-4 font-sans text-sm leading-relaxed">
      {lines.map((line, index) => (
        <div key={`${line.kind}-${index}`}>{line.kind === 'add' ? '+ ' : line.kind === 'del' ? '− ' : '  '}{line.text}</div>
      ))}
    </pre>
  )
}

function WebhookSection({ state, onApply }: { state: BotDeskState; onApply: (action: Parameters<typeof reduceBotDesk>[1], message?: string) => void }) {
  const bot = state.bots[0]
  const [url, setUrl] = useState(bot?.webhookUrl || '')
  const [events, setEvents] = useState<WebhookEvent[]>(bot?.webhookEvents || [])
  return (
    <Section title="Webhooks" lede="New leads, stage changes, and overdue tasks can POST to a URL. The body is HMAC signed. Failures retry, then stop.">
      <label className="block text-sm">
        URL
        <input className="plan-field" aria-label="Webhook URL" value={url} onChange={(event) => setUrl(event.target.value)} />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {WEBHOOK_EVENTS.map((event) => (
          <label key={event} className="flex min-h-11 items-center gap-2 rounded-full border border-black/10 px-3 text-sm">
            <input
              type="checkbox"
              checked={events.includes(event)}
              onChange={(change) => setEvents((current) => change.target.checked ? [...current, event] : current.filter((item) => item !== event))}
            />
            {event}
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="lux-cta-ghost min-h-11 w-full sm:w-auto"
          onClick={() => bot && onApply({ type: 'set-webhook', id: bot.id, webhookUrl: url, webhookEvents: events }, 'Webhook saved')}
        >
          Save webhook
        </button>
        <button
          type="button"
          className="lux-cta min-h-11 w-full sm:w-auto"
          onClick={() => {
            if (!bot) return
            void signPreview(url || 'https://hooks.example/ops').then((signature) => {
              onApply({
                type: 'log-delivery',
                delivery: {
                  id: `del-${Date.now()}`,
                  botId: bot.id,
                  botName: bot.name,
                  event: events[0] || 'lead.created',
                  status: 'delivered',
                  attempts: 1,
                  signature,
                  lastError: null,
                  createdAt: new Date().toISOString(),
                },
              }, 'Test signed')
            })
          }}
        >
          Send test
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {state.deliveries.map((delivery) => (
          <article key={delivery.id} className="rounded-xl border border-black/10 p-4">
            <h3 className="font-serif text-xl">{delivery.event}</h3>
            <p className="mt-1 text-sm">{delivery.botName} · {delivery.status} · attempt {delivery.attempts} of {MAX_WEBHOOK_ATTEMPTS}</p>
            {delivery.lastError && <p className="mt-1 text-sm">{delivery.lastError}</p>}
            {delivery.signature && <p className="mt-1 break-all font-mono text-xs">sha256={delivery.signature}</p>}
            {delivery.status === 'retrying' && (
              <button
                type="button"
                className="lux-cta-ghost mt-3 min-h-11 w-full sm:w-auto"
                onClick={() => {
                  const attempts = delivery.attempts + 1
                  onApply({
                    type: 'log-delivery',
                    delivery: { ...delivery, id: `${delivery.id}-retry`, attempts, status: deliveryStatus(attempts, false), lastError: attempts >= MAX_WEBHOOK_ATTEMPTS ? 'Gave up after 3 attempts' : delivery.lastError },
                  }, 'Retry recorded')
                }}
              >
                Retry
              </button>
            )}
          </article>
        ))}
      </div>
    </Section>
  )
}

async function signPreview(url: string) {
  const secretBytes = crypto.getRandomValues(new Uint8Array(16))
  const secret = Array.from(secretBytes, (item) => item.toString(16).padStart(2, '0')).join('')
  const timestamp = String(Math.floor(Date.now() / 1000))
  const body = JSON.stringify({ url, event: 'lead.created' })
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${body}`))
  return Array.from(new Uint8Array(signed), (item) => item.toString(16).padStart(2, '0')).join('')
}

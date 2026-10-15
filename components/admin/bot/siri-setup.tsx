'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { decideBotAction, DEFAULT_GUARDRAILS, type Guardrails } from '@/lib/bots/policy'
import { answerVoice, parseVoiceIntent, actionForIntent, type VoiceSnapshot } from '@/lib/bots/voice'

const STEPS = [
  {
    id: 'key',
    title: 'Create a voice key',
    body: 'On Keys, make a token for the bot that should answer Siri. Give it leads:read and tasks:read. Add tasks:write only if it may add a task or mark one done.',
    illustration: ['Keys', 'Voice phone', 'leads:read', 'tasks:read'],
  },
  {
    id: 'copy',
    title: 'Copy the token once',
    body: 'The full token is on screen only once. Copy it into a password note, then dismiss it. The database keeps a hash, not the token.',
    illustration: ['Shown once', 'plxbot_ ••••••••', 'Copy', 'Dismiss'],
  },
  {
    id: 'dictate',
    title: 'Add Dictate Text',
    body: 'On the iPhone, open Shortcuts and tap the plus. Add the Dictate Text action. This is what you say after Siri opens the shortcut.',
    illustration: ['Shortcuts', '+', 'Dictate Text', 'What is due today?'],
  },
  {
    id: 'url',
    title: 'Post to the voice endpoint',
    body: 'Add Get Contents of URL. Method POST. Header Authorization, value Bearer and the token. Body JSON, field query, value the Dictated Text.',
    illustration: ['Get Contents of URL', 'POST', 'Authorization', 'Bearer'],
  },
  {
    id: 'speak',
    title: 'Speak the reply',
    body: 'Add Speak Text and pass it the contents of the URL. The endpoint returns a short sentence, not a page of JSON.',
    illustration: ['Speak Text', 'Contents of URL', 'One task is due today.'],
  },
  {
    id: 'name',
    title: 'Name it Prime Lux',
    body: 'Rename the shortcut Prime Lux. That name is the Siri phrase. Say “Prime Lux”, then the question.',
    illustration: ['Name', 'Prime Lux', 'Add to Siri', 'Hey Siri'],
  },
  {
    id: 'test',
    title: 'Test a phrase',
    body: 'Try “What’s due today?” Send test runs that question through the same phrases the endpoint speaks.',
    illustration: ['What’s due today?', 'Siri', 'Speak'],
  },
  {
    id: 'trouble',
    title: 'If it does not answer',
    body: '401 means the token is missing, wrong, or revoked. 429 means wait a minute. A line that says Prime Lux is offline means the site or the database cannot be reached.',
    illustration: ['401', '429', 'Offline'],
  },
  {
    id: 'revoke',
    title: 'Revoke a lost phone',
    body: 'On Keys, revoke that phone’s key. The old token stops on the next request. Make a new key before you build the shortcut again.',
    illustration: ['Keys', 'Voice phone', 'Revoke', 'Stopped'],
  },
] as const

const SAMPLES = ["What's due today?", 'What is overdue?', "What's on this week?", 'Any new leads?', 'Status of Avery']

export function SiriSetup({
  snapshot,
  guardrails = DEFAULT_GUARDRAILS,
}: {
  snapshot: VoiceSnapshot
  guardrails?: Guardrails
}) {
  const [done, setDone] = useState<string[]>([])
  const [query, setQuery] = useState(SAMPLES[0])
  const [speech, setSpeech] = useState('')
  const [origin, setOrigin] = useState('')
  const endpoint = `${origin}/api/bot/voice`

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const spoken = useMemo(() => {
    const intent = parseVoiceIntent(query)
    const action = actionForIntent(intent)
    const decision = action
      ? decideBotAction({
          action,
          scopes: ['leads:read', 'tasks:read', 'tasks:write'],
          botStatus: 'active',
          guardrails,
          at: new Date(snapshot.now),
          timeZone: snapshot.timezone,
          runDays: [0, 1, 2, 3, 4, 5, 6],
          runStart: '00:00',
          runEnd: '23:59',
        })
      : null
    return answerVoice(intent, snapshot, decision)
  }, [query, snapshot, guardrails])

  return (
    <section className="rounded-2xl border border-[var(--dashboard-border)] bg-white p-4 sm:p-6">
      <h2 className="font-serif text-3xl">Siri</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--dashboard-text-muted)]">
        Build the shortcut on the iPhone. A signed shortcut file is not included. The phrase is Prime Lux.
      </p>
      <p className="mt-4 break-all text-sm">
        Endpoint <span className="font-medium">{endpoint || '/api/bot/voice'}</span>
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="lux-cta min-h-11 w-full sm:w-auto"
          onClick={() => {
            const url = `${window.location.origin}/api/bot/voice`
            setOrigin(window.location.origin)
            void navigator.clipboard.writeText(url).then(() => toast.success('Copied')).catch(() => toast.success('Copied'))
          }}
        >
          Copy URL
        </button>
        <a className="lux-cta-ghost inline-flex min-h-11 w-full items-center justify-center sm:w-auto" href="/prime-lux-siri.txt" download>
          Download steps
        </a>
      </div>

      <ol className="mt-6 space-y-4">
        {STEPS.map((step, index) => (
          <li key={step.id} className="rounded-xl border border-black/10 p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Phone lines={step.illustration} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--dashboard-text-muted)]">Step {index + 1}</p>
                <h3 className="mt-1 font-serif text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed">{step.body}</p>
                <label className="mt-3 flex min-h-11 items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={done.includes(step.id)}
                    onChange={(event) => setDone((current) => event.target.checked ? [...current, step.id] : current.filter((id) => id !== step.id))}
                  />
                  Done
                </label>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-xl border border-black/10 p-4">
        <h3 className="font-serif text-2xl">Send test</h3>
        <p className="mt-1 text-sm text-[var(--dashboard-text-muted)]">Sample question, spoken the way the endpoint answers.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLES.map((sample) => (
            <button
              key={sample}
              type="button"
              className={`min-h-11 rounded-full border px-3 text-sm ${query === sample ? 'border-black bg-black text-white' : 'border-black/15'}`}
              onClick={() => setQuery(sample)}
            >
              {sample}
            </button>
          ))}
        </div>
        <label className="mt-3 block text-sm">
          Question
          <input className="plan-field" aria-label="Voice question" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <button type="button" className="lux-cta mt-3 min-h-11 w-full sm:w-auto" onClick={() => setSpeech(spoken)}>
          Send test
        </button>
        {speech && (
          <p className="mt-4 text-sm leading-relaxed" aria-live="polite">
            Siri would say: {speech}
          </p>
        )}
      </div>
    </section>
  )
}

function Phone({ lines }: { lines: readonly string[] }) {
  return (
    <div className="mx-auto w-full max-w-[220px] shrink-0 rounded-[28px] border border-black/15 bg-[var(--dashboard-background)] p-3 shadow-sm" aria-hidden>
      <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-black/20" />
      <div className="space-y-2 rounded-2xl bg-white p-3">
        {lines.map((line) => (
          <p key={line} className="truncate text-xs">{line}</p>
        ))}
      </div>
    </div>
  )
}

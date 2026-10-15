'use client'

import { useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import {
  BOT_PROMPTS,
  DEFAULT_BOT_VARIABLES,
  fillPrompt,
  promptValues,
  type BotVariables,
} from '@/lib/admin/bot-prompts'

const FIELDS: { key: keyof BotVariables; label: string; hint: string }[] = [
  { key: 'businessName', label: 'Business name', hint: 'Replaces the house name in every prompt.' },
  { key: 'timezone', label: 'Timezone', hint: 'Used by the ops desk and the digest.' },
  { key: 'digestTime', label: 'Digest time', hint: 'When the daily briefing should be ready.' },
]

export function BotControl({
  projectRef,
  schema,
  hostToast = false,
}: {
  projectRef: string
  schema: string
  hostToast?: boolean
}) {
  const [variables, setVariables] = useState<BotVariables>(DEFAULT_BOT_VARIABLES)
  const [copied, setCopied] = useState<string | null>(null)
  const values = useMemo(
    () => promptValues(variables, projectRef, schema),
    [variables, projectRef, schema],
  )

  async function copyPrompt(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.left = '-9999px'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopied(id)
    toast.success('Copied')
    window.setTimeout(() => {
      setCopied((current) => (current === id ? null : current))
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {hostToast && (
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: 'bg-white border border-black/10 text-black shadow-lg font-sans',
              title: 'text-black font-medium',
            },
            duration: 2500,
          }}
        />
      )}

      <section className="rounded-2xl border border-[var(--dashboard-border)] bg-white p-4 sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--dashboard-text-muted)]">Before you copy</p>
        <h2 className="mt-1 font-serif text-2xl">Variables</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--dashboard-text-muted)]">
          Edit these and the prompts update as you type. The project ref is read from the public Supabase URL. No key is included.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {FIELDS.map((field) => (
            <label key={field.key} className="block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--dashboard-text-muted)]">{field.label}</span>
              <input
                className="plan-field mt-2 w-full"
                value={variables[field.key]}
                aria-label={field.label}
                onChange={(event) => setVariables((current) => ({ ...current, [field.key]: event.target.value }))}
              />
              <span className="mt-1 block text-xs text-[var(--dashboard-text-muted)]">{field.hint}</span>
            </label>
          ))}
        </div>
        <p className="mt-4 text-sm text-[var(--dashboard-text-muted)]">
          Project ref <span className="font-medium text-[var(--dashboard-text)]">{projectRef}</span>
        </p>
      </section>

      {BOT_PROMPTS.map((prompt) => {
        const text = fillPrompt(prompt.template, values)
        const isCopied = copied === prompt.id
        return (
          <article key={prompt.id} className="rounded-2xl border border-[var(--dashboard-border)] bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-serif text-2xl">{prompt.title}</h2>
                <p className="mt-1 text-sm text-[var(--dashboard-text-muted)]">{prompt.lede}</p>
              </div>
              <button
                type="button"
                className="lux-cta inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 sm:w-auto"
                onClick={() => copyPrompt(prompt.id, text)}
              >
                {isCopied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl border border-black/10 bg-[var(--dashboard-background)] p-4 font-sans text-sm leading-relaxed text-[var(--dashboard-text)]">
              {text}
            </pre>
          </article>
        )
      })}
    </div>
  )
}

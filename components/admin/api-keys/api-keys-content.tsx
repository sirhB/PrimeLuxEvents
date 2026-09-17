'use client'

import { useState, useTransition } from 'react'
import { createApiKey, revokeApiKey, type ApiKeyListItem } from '@/app/actions/api-keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminPage, AdminPageHeader, AdminPanel } from '@/components/admin/page-shell'
import { toast } from 'sonner'
import { Copy, KeyRound, Trash2 } from 'lucide-react'

function formatDate(value: string | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export function ApiKeysAdminContent({
  keys: initial,
  loadError,
}: {
  keys: ApiKeyListItem[]
  loadError?: string
}) {
  const [keys, setKeys] = useState(initial)
  const [name, setName] = useState('')
  const [pending, startTransition] = useTransition()
  const [revealedKey, setRevealedKey] = useState<string | null>(null)

  const create = () => {
    startTransition(async () => {
      const result = await createApiKey({ name })
      if (!result.success || !result.key || !result.rawKey) {
        toast.error(result.error || 'Could not create key')
        return
      }
      setKeys((prev) => [result.key!, ...prev])
      setName('')
      setRevealedKey(result.rawKey)
      toast.success('API key created — copy it now; it will not be shown again.')
    })
  }

  const revoke = (id: string) => {
    if (!confirm('Revoke this API key? Callers using it will immediately lose access.')) return
    startTransition(async () => {
      const result = await revokeApiKey(id)
      if (!result.success) {
        toast.error(result.error || 'Could not revoke key')
        return
      }
      setKeys((prev) =>
        prev.map((k) =>
          k.id === id
            ? { ...k, is_active: false, revoked_at: new Date().toISOString() }
            : k,
        ),
      )
      toast.success('API key revoked')
    })
  }

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Copied')
    } catch {
      toast.error('Could not copy')
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="API keys"
        description="Issue keys so partners and integrations can read the rental catalog (products & categories)."
        eyebrow="Developers"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'API keys' },
        ]}
      />

      {loadError && (
        <AdminPanel>
          <p className="text-sm text-[var(--dashboard-text)]">{loadError}</p>
        </AdminPanel>
      )}

      {revealedKey && (
        <AdminPanel className="border-[var(--dashboard-accent-gold)]/40">
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--dashboard-text)]">
              New key (copy now — it won’t be shown again)
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 break-all rounded-md bg-[var(--dashboard-surface)] px-3 py-2 text-xs text-[var(--dashboard-text)]">
                {revealedKey}
              </code>
              <Button type="button" size="sm" variant="outline" onClick={() => copy(revealedKey)}>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setRevealedKey(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </AdminPanel>
      )}

      <AdminPanel>
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--dashboard-text)]">Create key</h2>
            <p className="mt-1 text-xs text-[var(--dashboard-text-muted)]">
              Scope: <code className="text-[11px]">catalog:read</code> — list/search products and
              categories via <code className="text-[11px]">/api/v1/catalog/*</code>
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="api-key-name">Label</Label>
              <Input
                id="api-key-name"
                placeholder="e.g. Planner portal — Acme Events"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                disabled={pending}
              />
            </div>
            <Button type="button" onClick={create} disabled={pending || name.trim().length < 2}>
              <KeyRound className="mr-1.5 h-4 w-4" />
              Generate key
            </Button>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel>
        <div className="mb-4 space-y-1">
          <h2 className="text-sm font-semibold text-[var(--dashboard-text)]">Usage</h2>
          <pre className="overflow-x-auto rounded-md bg-[var(--dashboard-surface)] p-3 text-[11px] leading-relaxed text-[var(--dashboard-text-muted)]">
{`curl -H "Authorization: Bearer plx_…" \\
  "https://your-domain.com/api/v1/catalog/products?limit=20"

curl -H "X-API-Key: plx_…" \\
  "https://your-domain.com/api/v1/catalog/categories"`}
          </pre>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[var(--dashboard-border)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] text-[11px] uppercase tracking-wider text-[var(--dashboard-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Prefix</th>
                <th className="px-4 py-3 font-medium">Scopes</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last used</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-[var(--dashboard-text-muted)]"
                  >
                    No API keys yet.
                  </td>
                </tr>
              ) : (
                keys.map((k) => {
                  const revoked = Boolean(k.revoked_at) || !k.is_active
                  return (
                    <tr key={k.id} className="border-b border-[var(--dashboard-border)]/60">
                      <td className="px-4 py-3 font-medium text-[var(--dashboard-text)]">
                        {k.name}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-[var(--dashboard-text-muted)]">
                          {k.key_prefix}…
                        </code>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--dashboard-text-muted)]">
                        {(k.scopes || []).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {revoked ? (
                          <span className="text-red-600/90">Revoked</span>
                        ) : (
                          <span className="text-emerald-700/90">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--dashboard-text-muted)]">
                        {formatDate(k.last_used_at)}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--dashboard-text-muted)]">
                        {formatDate(k.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {!revoked && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() => revoke(k.id)}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </AdminPage>
  )
}

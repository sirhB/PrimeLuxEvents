'use client'

import { Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useEditorContent } from './editor-content-context'
import { useState } from 'react'
import { toast } from 'sonner'
import { getPublicPath } from '@/lib/admin/visual-editor-config'

type SaveStatusProps = {
  activePage: string
}

export function SaveStatus({ activePage }: SaveStatusProps) {
  const editor = useEditorContent()
  const [isRevalidating, setIsRevalidating] = useState(false)

  if (!editor) return null

  const { dirtyKeys, savingKeys, lastSavedAt } = editor
  const isSaving = savingKeys.size > 0
  const hasUnsaved = dirtyKeys.size > 0

  let status: 'saving' | 'unsaved' | 'saved' = 'saved'
  if (isSaving) status = 'saving'
  else if (hasUnsaved) status = 'unsaved'

  async function handleRevalidate() {
    setIsRevalidating(true)
    try {
      const path = getPublicPath(activePage)
      const res = await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      })
      if (!res.ok) throw new Error('Revalidation failed')
      toast.success('Live site refreshed')
    } catch {
      toast.error('Could not refresh live site')
    } finally {
      setIsRevalidating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium',
          status === 'saving' &&
            'border-[var(--dashboard-accent-gold)]/30 bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)]',
          status === 'unsaved' &&
            'border-[var(--dashboard-accent-orange)]/30 bg-[var(--dashboard-accent-orange)]/10 text-[var(--dashboard-accent-orange)]',
          status === 'saved' &&
            'border-[var(--dashboard-accent-green)]/30 bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)]',
        )}
        role="status"
        aria-live="polite"
      >
        {status === 'saving' && (
          <>
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            Saving…
          </>
        )}
        {status === 'unsaved' && (
          <>
            <AlertCircle className="h-3 w-3" aria-hidden />
            Unsaved changes
          </>
        )}
        {status === 'saved' && (
          <>
            <Check className="h-3 w-3" aria-hidden />
            {lastSavedAt ? 'All changes saved' : 'Ready'}
          </>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleRevalidate}
        disabled={isRevalidating || hasUnsaved || isSaving}
        className="h-8 border-[var(--dashboard-border)] text-[11px] text-[var(--dashboard-text-muted)] hover:border-[var(--dashboard-accent-gold)]/35 hover:text-[var(--dashboard-text)]"
        title="Refresh live site cache"
      >
        {isRevalidating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        <span className="ml-1.5 hidden sm:inline">Refresh live site</span>
      </Button>
    </div>
  )
}

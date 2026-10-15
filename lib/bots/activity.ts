export type ActivityEntry = {
  id: string
  botId: string
  botName: string
  action: string
  tableName: string
  recordId: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  reversible: boolean
  undoneAt: string | null
  createdAt: string
}

export type UndoResult =
  | { ok: true; entry: ActivityEntry; restored: Record<string, unknown> }
  | { ok: false; code: 'not_reversible' | 'already_undone' | 'missing_before' }

export function undoActivity(entry: ActivityEntry, at: string): UndoResult {
  if (!entry.reversible) return { ok: false, code: 'not_reversible' }
  if (entry.undoneAt) return { ok: false, code: 'already_undone' }
  if (!entry.before) return { ok: false, code: 'missing_before' }
  return {
    ok: true,
    restored: { ...entry.before },
    entry: { ...entry, undoneAt: at },
  }
}

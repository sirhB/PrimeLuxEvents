export type PromptVersion = {
  id: string
  promptId: 'master' | 'ops' | 'digest'
  version: number
  body: string
  note: string
  createdAt: string
}

export type DiffLine = { kind: 'same' | 'add' | 'del'; text: string }

export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split('\n')
  const b = after.split('\n')
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const lines: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      lines.push({ kind: 'same', text: a[i] })
      i += 1
      j += 1
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      lines.push({ kind: 'del', text: a[i] })
      i += 1
    } else {
      lines.push({ kind: 'add', text: b[j] })
      j += 1
    }
  }
  while (i < a.length) lines.push({ kind: 'del', text: a[i++] })
  while (j < b.length) lines.push({ kind: 'add', text: b[j++] })
  return lines
}

export function rollbackVersion(versions: PromptVersion[], versionId: string, at: string): PromptVersion[] {
  const chosen = versions.find((version) => version.id === versionId)
  if (!chosen) return versions
  const samePrompt = versions.filter((version) => version.promptId === chosen.promptId)
  const next = samePrompt.reduce((max, version) => Math.max(max, version.version), 0) + 1
  return [
    {
      id: `ver-${chosen.promptId}-${next}`,
      promptId: chosen.promptId,
      version: next,
      body: chosen.body,
      note: `Rollback to v${chosen.version}`,
      createdAt: at,
    },
    ...versions,
  ]
}

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export type ColumnBrief = { name: string; type: string }

const SECRET_COLUMN = /password|secret|service_role|api_key|anon_key|private_key/i

const GROUPS: { title: string; tables: string[] }[] = [
  { title: 'Plans and leads', tables: ['event_plans', 'venue_leads', 'venues', 'venue_tours', 'venue_bookings'] },
  {
    title: 'CRM',
    tables: [
      'crm_companies',
      'crm_contacts',
      'crm_activities',
      'crm_proposals',
      'crm_proposal_lines',
      'crm_contracts',
      'crm_payments',
      'crm_reminders',
      'crm_saved_views',
    ],
  },
  {
    title: 'Staff tasks',
    tables: ['tasks', 'task_templates', 'task_template_items', 'task_comments', 'staff_notifications'],
  },
  { title: 'Client hub', tables: ['crm_schedule', 'crm_layouts', 'crm_documents', 'crm_messages'] },
  { title: 'Orders and payments', tables: ['orders', 'order_items', 'payments'] },
  {
    title: 'Bot control',
    tables: [
      'ops_bots',
      'ops_bot_keys',
      'ops_bot_activity',
      'ops_bot_approvals',
      'ops_bot_guardrails',
      'ops_bot_prompt_versions',
      'ops_bot_requests',
      'ops_bot_webhook_deliveries',
    ],
  },
]

function stripComments(sql: string) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '')
}

function splitArgs(body: string) {
  const parts: string[] = []
  let current = ''
  let depth = 0
  for (const char of body) {
    if (char === '(') depth += 1
    if (char === ')' && depth > 0) depth -= 1
    if (char === ',' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += char
  }
  if (current.trim()) parts.push(current)
  return parts
}

function columnBrief(raw: string): ColumnBrief | null {
  const line = raw.trim().replace(/,$/, '').replace(/\s+/g, ' ')
  if (!line) return null
  if (/^(primary|unique|constraint|foreign|check|exclude)\b/i.test(line)) return null
  const match = line.match(/^("?[a-z_][a-z0-9_]*"?)\s+(.+)$/i)
  if (!match) return null
  const name = match[1].replace(/"/g, '').toLowerCase()
  if (SECRET_COLUMN.test(name)) return null
  let type = match[2]
  type = type.replace(/\s+default\b[\s\S]*$/i, '')
  type = type.replace(/\s+references\b[\s\S]*$/i, '')
  type = type.replace(/\s+not\s+null\b/gi, '')
  type = type.replace(/\s+null\b/gi, '')
  type = type.replace(/\s+primary\s+key\b/gi, '')
  type = type.replace(/\s+unique\b/gi, '')
  type = type.replace(/\s+check\s*\([\s\S]*$/i, '')
  type = type.replace(/\s+/g, ' ').trim().toLowerCase()
  if (!type) return null
  return { name, type }
}

function tableName(raw: string) {
  return raw.replace(/^public\./i, '').replace(/"/g, '').toLowerCase()
}

export function summarizeSchema(sql: string) {
  const source = stripComments(sql)
  const tables = new Map<string, ColumnBrief[]>()

  const ensure = (name: string) => {
    const key = tableName(name)
    if (!tables.has(key)) tables.set(key, [])
    return tables.get(key)!
  }

  const createRe = /create\s+table\s+(?:if\s+not\s+exists\s+)?((?:public\.)?[a-z_][a-z0-9_]*)\s*\(([\s\S]*?)\)\s*;/gi
  for (const match of source.matchAll(createRe)) {
    const columns = ensure(match[1])
    const known = new Set(columns.map((column) => column.name))
    for (const part of splitArgs(match[2])) {
      const column = columnBrief(part)
      if (!column || known.has(column.name)) continue
      columns.push(column)
      known.add(column.name)
    }
  }

  const alterRe = /alter\s+table\s+(?:only\s+)?(?:if\s+exists\s+)?((?:public\.)?[a-z_][a-z0-9_]*)\s+([\s\S]*?);/gi
  for (const match of source.matchAll(alterRe)) {
    const columns = ensure(match[1])
    const known = new Set(columns.map((column) => column.name))
    const body = match[2]
    for (const drop of body.matchAll(/drop\s+column\s+(?:if\s+exists\s+)?([a-z_][a-z0-9_]*)/gi)) {
      const name = drop[1].toLowerCase()
      const index = columns.findIndex((column) => column.name === name)
      if (index >= 0) columns.splice(index, 1)
      known.delete(name)
    }
    const additions = body.split(/add\s+column\s+(?:if\s+not\s+exists\s+)?/i).slice(1)
    for (const addition of additions) {
      const column = columnBrief(addition)
      if (!column || known.has(column.name)) continue
      columns.push(column)
      known.add(column.name)
    }
  }

  const dropRe = /drop\s+table\s+(?:if\s+exists\s+)?((?:public\.)?[a-z_][a-z0-9_]*)\s*;/gi
  for (const match of source.matchAll(dropRe)) tables.delete(tableName(match[1]))

  return GROUPS.map((group) => {
    const lines = group.tables.map((name) => {
      const columns = tables.get(name)
      if (!columns?.length) return `${name}: not defined in the migrations`
      return `${name}: ${columns.map((column) => `${column.name} ${column.type}`).join(', ')}`
    })
    return `${group.title}\n${lines.join('\n')}`
  }).join('\n\n')
}

export function loadSchemaBrief() {
  const root = path.join(process.cwd(), 'supabase')
  const migrationDir = path.join(root, 'migrations')
  const files = [
    path.join(root, 'schema.sql'),
    ...readdirSync(migrationDir)
      .filter((name) => name.endsWith('.sql'))
      .sort()
      .map((name) => path.join(migrationDir, name)),
  ]
  const sql = files.map((file) => readFileSync(file, 'utf8')).join('\n')
  return summarizeSchema(sql)
}

#!/usr/bin/env node
/**
 * Create a staff admin that signs in with a username.
 *
 * Usage:
 *   node scripts/create-admin.mjs --username daymane --name "Daymane" --role admin [--email real@example.com]
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env
 * (or .env.local). Apply supabase/migrations/20261024_admin_usernames.sql first.
 *
 * The generated temporary password is NEVER printed. It is appended to a file
 * outside the repo (default /workspace/secure/admin-temp-passwords.txt, mode
 * 600; override with ADMIN_CREDENTIALS_FILE). The user must change it on
 * first login.
 */

import { readFileSync, existsSync, mkdirSync, appendFileSync, chmodSync } from 'node:fs'
import { resolve, dirname, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomInt } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/
const SYNTHETIC_DOMAIN = 'admins.primeluxevents.internal'
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_!@#%'

function loadEnvLocal() {
  const envPath = resolve(ROOT, '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq <= 0) continue
    const key = t.slice(0, eq)
    let v = t.slice(eq + 1)
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[key]) process.env[key] = v
  }
}

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) out[a.slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true'
  }
  return out
}

function tempPassword(len = 20) {
  let s = ''
  for (let i = 0; i < len; i++) s += ALPHABET[randomInt(ALPHABET.length)]
  return s
}

function credentialsFile() {
  const file = resolve(process.env.ADMIN_CREDENTIALS_FILE || '/workspace/secure/admin-temp-passwords.txt')
  const rel = relative(ROOT, file)
  if (!rel.startsWith('..') && !isAbsolute(rel)) {
    throw new Error('Credentials file must be outside the repository')
  }
  return file
}

async function main() {
  loadEnvLocal()
  const args = parseArgs(process.argv.slice(2))
  const username = String(args.username || '').trim().toLowerCase()
  const name = String(args.name || '').trim()
  const roleName = String(args.role || 'admin').trim()
  const realEmail = args.email ? String(args.email).trim().toLowerCase() : ''

  if (!USERNAME_PATTERN.test(username)) throw new Error('--username must be 3-32 chars of [a-z0-9._-]')
  if (!name) throw new Error('--name is required')
  if (realEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(realEmail)) throw new Error('--email is not valid')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')

  const file = credentialsFile()
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

  const { data: role, error: roleErr } = await admin.from('roles').select('id').eq('name', roleName).maybeSingle()
  if (roleErr) throw new Error(roleErr.message)
  if (!role) throw new Error(`Role "${roleName}" not found`)

  const { data: taken, error: takenErr } = await admin
    .from('user_profiles').select('id').eq('username', username).maybeSingle()
  if (takenErr) throw new Error(`${takenErr.message}. Apply the admin_usernames migration first.`)
  if (taken) throw new Error(`Username "${username}" is already in use`)

  const email = realEmail || `${username}@${SYNTHETIC_DOMAIN}`
  const password = tempPassword()
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, username },
  })
  if (createErr || !created?.user) throw new Error(createErr?.message || 'createUser failed')
  const userId = created.user.id

  try {
    const { error: pErr } = await admin.from('user_profiles').upsert(
      { id: userId, email, username, full_name: name, is_active: true, must_change_password: true },
      { onConflict: 'id' },
    )
    if (pErr) throw new Error(pErr.message)
    const { error: rErr } = await admin.from('user_roles').insert({ user_id: userId, role_id: role.id })
    if (rErr) throw new Error(rErr.message)
  } catch (err) {
    await admin.auth.admin.deleteUser(userId)
    throw err
  }

  mkdirSync(dirname(file), { recursive: true, mode: 0o700 })
  appendFileSync(file, `${new Date().toISOString()}\tusername=${username}\ttemp_password=${password}\n`, { mode: 0o600 })
  chmodSync(file, 0o600)

  console.log(`Admin "${username}" created (role ${roleName}). Temporary password written to ${file}. Password change required on first login.`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : 'create-admin failed')
  process.exit(1)
})

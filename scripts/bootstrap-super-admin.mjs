#!/usr/bin/env node
/**
 * Create or promote the initial super admin.
 *
 * Reads SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD from the environment.
 * The password is never printed and must not be committed.
 *
 * Also requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * Apply supabase/migrations/20261014_canonical_roles_permissions.sql first.
 *
 * Idempotent:
 * - Creates the auth user when the email does not exist, and requires a
 *   password change on first login.
 * - Promotes an existing user to super_admin without resetting a password
 *   they already chose.
 * - If the account is still waiting on that first change, the env password
 *   is applied again so a corrected temporary password takes effect.
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const PLACEHOLDER_PASSWORD = 'replace-with-a-long-random-password'
const DEFAULT_EMAIL = 'super@admin.com'

export function assertBootstrapEnv(env) {
  const email = (env.SUPER_ADMIN_EMAIL || DEFAULT_EMAIL).trim().toLowerCase()
  const password = env.SUPER_ADMIN_PASSWORD || ''
  if (!email.includes('@') || email.startsWith('@') || email.endsWith('@')) {
    throw new Error('SUPER_ADMIN_EMAIL must be a valid email address')
  }
  if (!password) {
    throw new Error('SUPER_ADMIN_PASSWORD is required')
  }
  if (password === PLACEHOLDER_PASSWORD) {
    throw new Error('SUPER_ADMIN_PASSWORD is still the example placeholder. Set a real password in the environment.')
  }
  if (password.length < 12) {
    throw new Error('SUPER_ADMIN_PASSWORD must be at least 12 characters')
  }
  if (password.length > 200) {
    throw new Error('SUPER_ADMIN_PASSWORD must be at most 200 characters')
  }
  return { email, password }
}

function loadEnvLocal() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const envPath = resolve(root, '.env.local')
  if (!existsSync(envPath)) return
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq)
    let value = trimmed.slice(eq + 1)
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

async function findUserByEmail(admin, email) {
  let page = 1
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw new Error(error.message)
    const found = data.users.find((user) => user.email?.toLowerCase() === email)
    if (found) return found
    if (data.users.length < 200) return null
    page += 1
    if (page > 50) return null
  }
}

async function ensureSuperAdminRole(admin) {
  const { data: existing, error: readError } = await admin
    .from('roles')
    .select('id')
    .eq('name', 'super_admin')
    .maybeSingle()
  if (readError) throw new Error(readError.message)
  if (existing?.id) return existing.id

  const { data: created, error } = await admin
    .from('roles')
    .insert({
      name: 'super_admin',
      display_name: 'Super Admin',
      description: 'Always has full access. This role cannot be deleted or locked out.',
      color: '#C9A962',
      is_system_role: true,
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return created.id
}

async function main() {
  loadEnvLocal()
  const { email, password } = assertBootstrapEnv(process.env)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let user = await findUserByEmail(admin, email)
  let created = false
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Super Admin' },
    })
    if (error) throw new Error(error.message)
    user = data.user
    created = true
  }
  if (!user?.id) throw new Error('Supabase did not return the super admin user')

  const { data: profile, error: profileError } = await admin
    .from('user_profiles')
    .select('id, must_change_password')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError) {
    throw new Error(
      `${profileError.message}. Apply supabase/migrations/20261014_canonical_roles_permissions.sql before bootstrapping.`,
    )
  }

  if (created || !profile) {
    const { error } = await admin.from('user_profiles').upsert({
      id: user.id,
      email,
      full_name: 'Super Admin',
      is_active: true,
      must_change_password: created,
    }, { onConflict: 'id' })
    if (error) throw new Error(error.message)
  } else if (profile.must_change_password) {
    const { error } = await admin.auth.admin.updateUserById(user.id, { password })
    if (error) throw new Error(error.message)
  }

  const { error: activateError } = await admin
    .from('user_profiles')
    .update({ is_active: true, email })
    .eq('id', user.id)
  if (activateError) throw new Error(activateError.message)

  const roleId = await ensureSuperAdminRole(admin)
  const { error: assignError } = await admin.from('user_roles').insert({
    user_id: user.id,
    role_id: roleId,
    assigned_by: user.id,
  })
  if (assignError && !/duplicate|unique/i.test(assignError.message)) {
    throw new Error(assignError.message)
  }

  const waiting = created || profile?.must_change_password === true
  const action = created ? 'created' : 'promoted'
  console.log(
    waiting
      ? `Super admin ready: ${email} (${action}, password change required on first login)`
      : `Super admin ready: ${email} (${action}, existing password left unchanged)`,
  )
}

const invokedDirectly = process.argv[1]?.includes('bootstrap-super-admin')
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Bootstrap failed')
    process.exit(1)
  })
}

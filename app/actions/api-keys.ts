'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission, getCurrentUser } from '@/lib/auth/authorization'
import { createServiceClient } from '@/lib/supabase/server'
import { generateApiKey } from '@/lib/api/keys'

export type ApiKeyListItem = {
  id: string
  name: string
  key_prefix: string
  scopes: string[]
  is_active: boolean
  last_used_at: string | null
  expires_at: string | null
  revoked_at: string | null
  created_at: string
}

export async function listApiKeys(): Promise<{
  keys: ApiKeyListItem[]
  error?: string
}> {
  await requirePermission('settings.view')

  try {
    const admin = createServiceClient()
    const { data, error } = await admin
      .from('api_keys')
      .select(
        'id, name, key_prefix, scopes, is_active, last_used_at, expires_at, revoked_at, created_at',
      )
      .order('created_at', { ascending: false })

    if (error) {
      const missing =
        error.code === '42P01' ||
        error.message?.toLowerCase().includes('does not exist') ||
        error.message?.includes('api_keys')
      return {
        keys: [],
        error: missing
          ? 'API keys table is missing. Apply migration 20260917_public_api_keys.sql in Supabase.'
          : error.message,
      }
    }

    return { keys: (data as ApiKeyListItem[]) || [] }
  } catch (err) {
    return {
      keys: [],
      error: err instanceof Error ? err.message : 'Failed to load API keys',
    }
  }
}

export async function createApiKey(input: {
  name: string
  scopes?: string[]
  expiresAt?: string | null
}): Promise<{
  success: boolean
  error?: string
  /** Raw key — shown once only */
  rawKey?: string
  key?: ApiKeyListItem
}> {
  await requirePermission('settings.update')
  const user = await getCurrentUser()

  const name = input.name?.trim()
  if (!name || name.length < 2) {
    return { success: false, error: 'Name must be at least 2 characters.' }
  }
  if (name.length > 80) {
    return { success: false, error: 'Name must be 80 characters or fewer.' }
  }

  const scopes = input.scopes?.length ? input.scopes : ['catalog:read']
  const { rawKey, keyPrefix, keyHash } = generateApiKey()

  let expiresAt: string | null = null
  if (input.expiresAt) {
    const parsed = new Date(input.expiresAt)
    if (Number.isNaN(parsed.getTime())) {
      return { success: false, error: 'Invalid expiration date.' }
    }
    if (parsed.getTime() <= Date.now()) {
      return { success: false, error: 'Expiration must be in the future.' }
    }
    expiresAt = parsed.toISOString()
  }

  try {
    const admin = createServiceClient()
    const { data, error } = await admin
      .from('api_keys')
      .insert({
        name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        scopes,
        is_active: true,
        created_by: user?.id ?? null,
        expires_at: expiresAt,
      })
      .select(
        'id, name, key_prefix, scopes, is_active, last_used_at, expires_at, revoked_at, created_at',
      )
      .single()

    if (error || !data) {
      return {
        success: false,
        error: error?.message || 'Failed to create API key.',
      }
    }

    revalidatePath('/admin/api-keys')
    return {
      success: true,
      rawKey,
      key: data as ApiKeyListItem,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create API key.',
    }
  }
}

export async function revokeApiKey(keyId: string): Promise<{
  success: boolean
  error?: string
}> {
  await requirePermission('settings.update')

  if (!keyId?.trim()) {
    return { success: false, error: 'Key id is required.' }
  }

  try {
    const admin = createServiceClient()
    const { data, error } = await admin
      .from('api_keys')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', keyId)
      .is('revoked_at', null)
      .select('id')
      .maybeSingle()

    if (error) {
      return { success: false, error: error.message }
    }
    if (!data) {
      return { success: false, error: 'Key not found or already revoked.' }
    }

    revalidatePath('/admin/api-keys')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to revoke API key.',
    }
  }
}

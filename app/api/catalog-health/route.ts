import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isStaffUser } from '@/lib/auth/roles'
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/supabase/env'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * Launch diagnostics — staff only. Does not expose secret values.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isStaffUser(user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = getSupabaseUrl() || null
  const hasAnon = Boolean(getSupabaseAnonKey())
  const hasService = Boolean(getSupabaseServiceRoleKey())

  const result: Record<string, unknown> = {
    ok: false,
    url,
    hasAnon,
    hasService,
    productCount: null,
    categoryCount: null,
    error: null,
    hint: null,
  }

  const key = getSupabaseAnonKey()
  if (!url || !key) {
    result.error = 'Missing Supabase URL or anon key on this deployment'
    result.hint =
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.'
    return NextResponse.json(result, { status: 500 })
  }

  try {
    // Use anon key so diagnostics reflect what public RLS actually allows
    const sb = createSupabaseJsClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const [{ count: productCount, error: pErr }, { count: categoryCount, error: cErr }] =
      await Promise.all([
        sb.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        sb.from('categories').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ])

    if (pErr || cErr) {
      result.error = pErr?.message || cErr?.message
      result.hint =
        'If this is an RLS error, apply catalog public SELECT policies and database data safety migrations.'
      return NextResponse.json(result, { status: 500 })
    }

    result.productCount = productCount
    result.categoryCount = categoryCount
    result.ok = (productCount || 0) > 0
    if (!result.ok) {
      result.hint = 'Connected to Supabase but found 0 active products.'
    }
    return NextResponse.json(result)
  } catch (err: unknown) {
    result.error = err instanceof Error ? err.message : String(err)
    return NextResponse.json(result, { status: 500 })
  }
}

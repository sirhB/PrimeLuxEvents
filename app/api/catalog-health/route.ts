import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * Launch diagnostics: reports which Supabase credentials are present and
 * whether products/categories can be read. Does not expose secret values.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null
  const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const hasService = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

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

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    result.error = 'Missing Supabase URL or API key on this deployment'
    result.hint =
      'In Vercel → Settings → Environment Variables, set NEXT_PUBLIC_SUPABASE_URL to https://bxktvrvpksxaijhdjegh.supabase.co and SUPABASE_SERVICE_ROLE_KEY (plux service role). Then redeploy.'
    return NextResponse.json(result, { status: 500 })
  }

  try {
    const sb = createClient(url, key, {
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
        'If this is an RLS error, run supabase/migrations/20260827_plux_public_catalog_rls.sql in the plux SQL Editor, or set SUPABASE_SERVICE_ROLE_KEY on Vercel.'
      return NextResponse.json(result, { status: 500 })
    }

    result.productCount = productCount
    result.categoryCount = categoryCount
    result.ok = (productCount || 0) > 0
    if (!result.ok) {
      result.hint =
        'Connected to Supabase but found 0 active products. Confirm URL points at plux (bxktvrvpksxaijhdjegh) and import completed.'
    }
    return NextResponse.json(result)
  } catch (err: any) {
    result.error = err?.message || String(err)
    return NextResponse.json(result, { status: 500 })
  }
}

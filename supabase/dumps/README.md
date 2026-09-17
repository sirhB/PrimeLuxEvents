# Database dumps for cutover to a new Supabase project

| File | Contents | Size |
|------|----------|------|
| `plux-full-db-for-new-supabase.sql` | Full **public** schema from plux (`bxktvrvpksxaijhdjegh`): 46 tables, enums, functions, RLS policies, and all rows (catalog + CMS + roles/permissions). | ~1 MB |
| `plux-full-db-for-new-supabase.sql.gz` | Same, gzipped | ~115 KB |
| `catalog-only-seed.sql` | Catalog-only bootstrap + categories/products/inventory | ~777 KB |

## Restore (recommended)

From Supabase Dashboard → **Project Settings → Database**, copy the **direct** connection string (not the transaction pooler), then:

```bash
DATABASE_URL='postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres' \
  ./scripts/restore-full-db.sh
```

Or with `psql` 17+:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/dumps/plux-full-db-for-new-supabase.sql
```

## SQL Editor alternative

Paste `plux-full-db-for-new-supabase.sql` into **SQL Editor**. If the editor rejects the size, use the `.gz` + `psql` path above, or run `catalog-only-seed.sql` first to unblock the storefront.

## After restore

1. Confirm Vercel Production points at the **new** project URL + anon + service_role keys.
2. Hard-refresh `https://prime-lux-events-beige.vercel.app/catalog`.
3. Auth users are **not** included (they live in `auth.*`). Re-invite staff or migrate Auth separately if needed.

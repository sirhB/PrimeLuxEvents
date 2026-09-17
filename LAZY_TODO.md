# Lazy Todo

Scratch checklist for deferred ops / launch steps. Check items off when done; append new ones at the bottom.

---

## Public API keys — go live

- [ ] Merge / deploy the public catalog API PR (`cursor/public-catalog-api-8b90` / #42)
- [ ] Apply Supabase migration `supabase/migrations/20260917_public_api_keys.sql` (SQL Editor or CLI) so the `api_keys` table exists
- [ ] Confirm Admin → **API keys** loads without a “table missing” error
- [ ] Create a labeled key (e.g. partner or integration name); copy the raw `plx_…` secret once — it is not shown again
- [ ] Smoke-test against production (or staging) with the key:

```bash
curl -H "Authorization: Bearer plx_…" \
  "https://YOUR_DOMAIN/api/v1/catalog/categories"

curl -H "Authorization: Bearer plx_…" \
  "https://YOUR_DOMAIN/api/v1/catalog/products?limit=5"
```

- [ ] Confirm unauthenticated calls return `401` / `missing_api_key`
- [ ] Hand the key to the partner/integration over a secure channel; note who has it and when it was issued
- [ ] (Optional) Set an expiration when creating keys for temporary access; revoke from Admin → API keys when done

### Later / nice-to-have (not required for first go-live)

- [ ] Document the public API for partners (endpoints, query params, rate limits)
- [ ] Add more scopes / data surfaces beyond `catalog:read` (orders, availability, etc.)
- [ ] Audit / rotate keys periodically; revoke unused ones

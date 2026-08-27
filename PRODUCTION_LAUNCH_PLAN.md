# PrimeLux Events — Production Launch Plan

This plan covers launching **PrimeLux Events** (Next.js + Supabase + Stripe on Vercel) safely. Follow phases in order; do not go live until **Phase 0–4** blockers are cleared.

> **Implementation status (code):** Phase 0 hardening is in progress on branch `cursor/production-launch-plan-550f` — mock payments fail closed, Stripe webhook uses service role, checkout/consultation/signature writes go through service-role server actions, invite plaintext passwords removed, security headers added, CI workflow added, and migration `20260827_production_rls_hardening.sql` must be applied on Supabase before relying on the tightened RLS. **Database data safety follow-up:** apply `20260829_database_data_safety.sql` (staff-only ops RLS, signature/claim RPCs, staff-only user search, tighter GRANTs). Catalog reads use the anon key (no `cost_cents`); checkout amounts are server-authoritative; admin auth cache is HMAC-signed.

**Stack assumptions**
- App: Next.js 16 (App Router) on **Vercel**
- Database / Auth / Storage: **Supabase** (PostgreSQL)
- Payments: **Stripe**
- Domain: `primeluxevents.com` (already referenced in metadata/sitemap)

---

## Phase 0 — Blockers (do before anything else)

These are launch-blocking security issues already present in the repo.

| # | Issue | Action | Status |
|---|--------|--------|--------|
| 0.1 | `.env.local` committed with live secrets | Removed from tracking / gitignored; **still rotate** any historically exposed keys in Supabase | Partially done (ops: rotate) |
| 0.2 | `SUPABASE_SERVICE_ROLE_KEY` missing from example | Documented in `.env.local.example` | Done |
| 0.3 | Mock payment intents when Stripe unset | Fail closed unless `ALLOW_MOCK_PAYMENTS=true` (never in production) | Done in code |
| 0.4 | Stripe webhook used user-scoped client | Uses service role client | Done in code |
| 0.5 | Permissive RLS open inserts | Migration `20260827_production_rls_hardening.sql` + service-role checkout writes | Done in code (apply migration) |
| 0.6 | Storage uploads for any authenticated user | Staff-only storage policies in same migration; signatures via service-role action | Done in code (apply migration) |
| 0.7 | Invitation `temp_password` plaintext | Token-only invites; column nulled; UI/API no longer use it | Done in code (apply migration) |
| 0.8 | `typescript.ignoreBuildErrors: true` | Still true for build stability; CI runs `tsc` with continue-on-error until debt cleared | Partial |

---

## Phase 1 — Secure the database (Supabase)

### 1.1 Separate projects

| Environment | Purpose |
|-------------|---------|
| **Production** | Live customers, live Stripe, locked-down RLS |
| **Staging** | Mirror of prod schema; Stripe test mode; safe for QA |

Never point a public preview deploy at the production database.

### 1.2 Apply schema correctly

1. Create the production Supabase project (US region preferred if customers are US-based).
2. Apply base schema + all files in `supabase/migrations/` **in filename order** (71 migrations as of this plan).
3. Prefer Supabase CLI linked to the project (`supabase db push` / migration history) over pasting SQL ad hoc in the SQL editor.
4. Seed only what production needs (settings, roles/permissions, categories). Do **not** apply demo/scraped/order seed data to production.
5. Record a migration checklist: migration name → applied timestamp → operator.

### 1.3 Row Level Security (RLS) hardening

Audit every table with RLS enabled. Target policy model:

| Data | Who can read | Who can write |
|------|--------------|---------------|
| Public catalog (products, categories, packages, portfolio) | `anon` + `authenticated` (SELECT) | Staff only (via role claims / `user_roles`) |
| Orders | Owner customer (by `user_id` / email link) + staff | Insert via controlled server path; customers update only allowed fields; staff full manage |
| Order items / reservations | Same as parent order | Same; **remove** open `WITH CHECK (true)` guest inserts unless replaced by a secure RPC or service-role server action |
| CRM / leads / chats / tasks / warehouse | Staff only | Staff only, ideally permission-scoped |
| `user_profiles`, roles, permissions | Self-read + staff | Staff / service role only |
| Payments / signatures | Owner + staff | Insert via authenticated checkout or service role; no public `WITH CHECK (true)` |

**Concrete remediation steps**
1. Inventory policies with `WITH CHECK (true)` or `USING (true)` on write operations (known: checkout RLS migrations, payments/signatures, consultations/leads inserts).
2. For guest checkout: either require auth before order creation, or create orders only through a **server action / Edge Function using the service role** after validating cart + payment intent server-side.
3. Replace “any authenticated user = admin” patterns with checks against `user_roles` / helpers already in `lib/auth/authorization.ts`.
4. Re-test: anon cannot mutate inventory; customer A cannot read customer B’s orders; non-staff cannot upload to storage or open `/admin`.

### 1.4 Storage buckets

Buckets in use: `products`, portfolio, signatures, check deposits.

| Bucket | Public read? | Write |
|--------|--------------|-------|
| Product / portfolio images | Yes (CDN-style) | Staff roles only |
| Signatures / check deposits | No (signed URLs) | Owner or staff; never world-writable |

Update policies in `20260107_setup_storage.sql` and related migrations accordingly on production.

### 1.5 Supabase Auth settings (Dashboard)

- [ ] Disable public signup **or** keep it only for customers; never auto-grant staff roles on signup
- [ ] Enable email confirmation for production
- [ ] Set Site URL to `https://primeluxevents.com` and redirect allow-list (`/auth/callback`, `/login`, `/invite/*`)
- [ ] Configure SMTP (custom domain) for branded auth emails
- [ ] Set JWT expiry / refresh reasonably; enable leaked-password protection if available
- [ ] Confirm service role key is **never** in `NEXT_PUBLIC_*` vars or client bundles

### 1.6 Database operational security

- [ ] Enable **Point-in-Time Recovery** (Pro+) or at least daily backups; test a restore on staging
- [ ] Restrict database password; do not share with app deploys (app uses API keys only)
- [ ] Review Realtime publication: only tables that need live updates (e.g. admin notifications)
- [ ] Enable Supabase security advisor / linter and fix critical findings
- [ ] Optional: network restrictions / SSL enforcement (Supabase defaults are TLS; keep it that way)

### 1.7 Service role usage audit

Service role bypasses RLS. Allowed server-only uses today include catalog reads, admin team pages, invites, authorization helpers. Before launch:

- [ ] Grep for `createServiceRoleClient` / `SUPABASE_SERVICE_ROLE_KEY` and confirm each call site is server-only
- [ ] Remove fallback that uses service role when anon key is missing (`lib/supabase/server.ts`) in production — fail loudly instead
- [ ] Prefer RLS + user session for customer paths; service role only for trusted webhooks and admin ops

---

## Phase 2 — Application & secrets hardening

### 2.1 Environment variables (Vercel Production + Preview)

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Production project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Rotated anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Never expose to browser |
| `STRIPE_SECRET_KEY` | Server | Live `sk_live_...` in Production; `sk_test_...` in Preview/Staging |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Matching live/test publishable key |
| `STRIPE_WEBHOOK_SECRET` | Server | From Stripe webhook endpoint for this env |
| `NODE_ENV` | Set by Vercel | Used for secure cookies |

Update `.env.local.example` to list all of the above. Configure Vercel **Production** vs **Preview** env separately.

### 2.2 Stripe go-live

1. Complete Stripe account verification / business profile.
2. Create Products/Prices if needed (or continue amount-based PaymentIntents).
3. Switch Production env to **live** keys.
4. Register webhook endpoint: `https://primeluxevents.com/api/stripe/webhook`
   - Events: at least `payment_intent.succeeded` (and failed/canceled if you handle them).
5. Fix webhook to use service role + verify signature (already partially done).
6. Disable mock payment path when `NODE_ENV === 'production'` or when live keys are present.
7. Test full flow in Stripe test mode on staging first, then one live $1 (or minimum) deposit test.

### 2.3 Auth / admin hardening

- [ ] Ensure first production admin is created intentionally (invite or SQL + role seed); revoke any leftover seed admins
- [ ] Confirm middleware gate on `/admin/*` (`middleware.ts` + `lib/supabase/middleware.ts`)
- [ ] Sign or encrypt `admin-auth-cache` cookie, or stop trusting it for authorization (DB role check remains source of truth)
- [ ] Remove debug `console.log` noise from auth middleware in production
- [ ] Replace plaintext `temp_password` invite flow with token-only acceptance

### 2.4 HTTP security headers (Next.js / Vercel)

Add headers in `next.config.mjs` or Vercel config:

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy` (limit camera/mic to QR/scanner routes if needed)
- Content-Security-Policy tuned for Supabase, Stripe.js, Vercel Analytics, and any Puter/AI origins you keep

### 2.5 Build quality gates

- [ ] Turn off `typescript.ignoreBuildErrors`
- [ ] Add ESLint config so `npm run lint` is meaningful
- [ ] Standardize on one lockfile (`package-lock.json` **or** `pnpm-lock.yaml`, not both)
- [ ] Rename package from `my-v0-project` to `primelux-events`
- [ ] Ensure `npm run build` succeeds cleanly in CI

---

## Phase 3 — Infrastructure & CI/CD

### 3.1 Vercel project setup

1. Import `sirhB/PrimeLuxEvents`; Production branch = `main`.
2. Set Production domain `primeluxevents.com` (+ `www` redirect).
3. Framework preset: Next.js; build command `npm run build`; output default.
4. Attach env vars per environment (Phase 2.1).
5. Enable Vercel Authentication on Preview deployments if the catalog/admin should stay private pre-launch.

### 3.2 DNS & TLS

- [ ] Point apex + www DNS to Vercel
- [ ] Confirm HTTPS and HSTS
- [ ] Align Supabase Auth Site URL and Google/OAuth redirect URLs (if used) with the final domain

### 3.3 GitHub Actions (recommended minimum)

Add `.github/workflows/ci.yml`:

1. Install deps (respect chosen lockfile)
2. `npm run lint`
3. `npx tsc --noEmit`
4. `npm run build` (with dummy public env vars if required for compile)

Optional later: Playwright smoke against Preview URL (login, catalog, checkout start).

### 3.4 Monitoring & logging

| Layer | Recommendation |
|-------|----------------|
| Web analytics | Keep `@vercel/analytics`; add Speed Insights if desired |
| Errors | Add Sentry (or equivalent) for Next.js server + client |
| Uptime | External check on `/` and `/api/auth/me` or a dedicated `/api/health` |
| Stripe | Dashboard alerts for failed payments / webhooks |
| Supabase | Dashboard for auth failures, DB size, API errors |

Define an on-call owner and a rollback path (revert Vercel deployment + known-good migration strategy).

---

## Phase 4 — Data, content & operational readiness

Use the in-app launch readiness items (`readiness_items` on profiles) plus this ops checklist:

### 4.1 Content & catalog

- [ ] Production product catalog complete (prices in cents, images in Storage, slugs unique)
- [ ] Packages, modifiers, and inventory quantities verified
- [ ] CMS pages: home, FAQ, rental agreement, contact — production copy (not placeholders)
- [ ] Legal: Terms, Privacy Policy, rental agreement — reviewed by counsel as needed

### 4.2 Business configuration

- [ ] Deposit % / balance due rules match Stripe charge amounts
- [ ] Tax / fee handling confirmed
- [ ] Delivery / pickup settings and service area
- [ ] Team roles seeded (`admin`, `manager`, `staff`) and real staff invited
- [ ] Notification channels (email/SMS if any) configured

### 4.3 Customer & admin smoke tests (staging, then prod)

| Flow | Pass criteria |
|------|----------------|
| Browse catalog / package builder | Products load; images OK |
| Guest or account checkout + Stripe deposit | Real PaymentIntent; order row; reservation rows; webhook sets `payment_status` |
| Customer `/account` portal | Sees only own orders |
| Admin login + RBAC | Non-staff redirected; staff can manage inventory/orders |
| Invite staff | Accept invite without exposing passwords in DB/UI unnecessarily |
| Invoice PDF / signature | Generates and stores correctly |
| PWA install (optional) | Manifest and SW behave on mobile Safari/Chrome |

### 4.4 Backup & disaster recovery

- [ ] Document how to restore Supabase from backup
- [ ] Export critical settings JSON / seed of roles
- [ ] Keep Stripe and Supabase dashboard access in a shared password manager (2FA on)

---

## Phase 5 — Go-live cutover

1. **Freeze** non-critical merges to `main`.
2. Confirm Production env vars (live Stripe + prod Supabase).
3. Deploy latest `main` to Vercel Production.
4. Run Phase 4.3 smoke tests against production (minimal live charge, then refund if policy allows).
5. Submit sitemap in Search Console if SEO matters; confirm `robots.ts` / `sitemap` domain.
6. Announce soft launch (limited traffic) → monitor errors/webhooks for 24–48 hours.
7. Full launch marketing only after soft launch is clean.

**Rollback:** Instant previous deployment in Vercel. If a bad migration shipped, restore DB from backup on staging first; do not “fix forward” blindly on prod without a tested migration.

---

## Phase 6 — Post-launch (first 30 days)

- [ ] Weekly review of Supabase Auth / API error rates
- [ ] Stripe dispute and webhook failure review
- [ ] Tighten CSP after observing real third-party needs
- [ ] Add automated E2E for checkout + admin login
- [ ] Rate-limit sensitive routes (login, invite accept, checkout) via middleware or Vercel Firewall / Upstash if abuse appears
- [ ] Plan for PITR, staging refresh from anonymized prod dump
- [ ] Revisit items in `FUTURE_ROADMAPPING.md` only after stability

---

## Suggested workstream order (engineering)

```text
Week-shaped sequence (effort, not calendar):

A. Secrets & git hygiene (Phase 0.1–0.2)
B. RLS + storage + guest checkout model (Phase 1.3–1.4)
C. Stripe webhook service role + fail-closed payments (Phase 0.3–0.4, 2.2)
D. Invite password removal; auth cookie cleanup (Phase 0.7, 2.3)
E. Build gates, headers, CI (Phase 2.4–2.5, 3.3)
F. Staging project + Vercel Preview env (Phase 1.1, 3.1)
G. Prod project migrate + seed roles + content (Phase 1.2, 4)
H. Soft launch → monitor → full launch (Phase 5–6)
```

---

## Ownership checklist (assign names)

| Area | Owner | Done? |
|------|-------|-------|
| Supabase prod project + migrations | | |
| RLS / storage audit | | |
| Secret rotation & Vercel env | | |
| Stripe live + webhooks | | |
| Domain / DNS | | |
| CI + build gates | | |
| Error monitoring | | |
| Legal / content | | |
| Smoke test sign-off | | |
| Go-live decision | | |

---

## Reference — high-risk files to change before launch

| File | Why |
|------|-----|
| `.gitignore` / `.env.local` | Stop tracking secrets |
| `.env.local.example` | Document all required vars |
| `next.config.mjs` | Typecheck + security headers |
| `lib/stripe.ts` / `app/actions/checkout.ts` | No mock payments in prod |
| `app/api/stripe/webhook/route.ts` | Service role updates |
| `lib/supabase/server.ts` | No silent service-role fallback |
| `supabase/migrations/*` checkout & storage RLS | Close open writes |
| `app/api/team/invitations/*` | Remove plaintext temp passwords |
| `.github/workflows/ci.yml` | *(new)* CI gate |

---

## Definition of “production ready”

The app may be considered launched when:

1. Production Supabase has full migrations, hardened RLS/storage, backups enabled, and rotated keys.
2. Vercel Production uses live Stripe + prod Supabase; Preview uses separate staging resources.
3. Checkout creates real charges; webhooks update orders reliably; mock payments cannot run.
4. Customers cannot access other customers’ data; non-staff cannot access admin or mutate catalog/storage.
5. CI builds without ignoring TypeScript errors; basic monitoring alerts a human.
6. Smoke tests on production pass and a rollback path is documented.

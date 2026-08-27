# Preferred Vendor Partner Portal — Plan

A dedicated section of the PrimeLux client portal for event planners and decorators who designate PrimeLux as a preferred rental vendor. Partners get exclusive trade rates and operational perks that end clients do not.

---

## 1. Goals

| Goal | Success signal |
|------|----------------|
| Make PrimeLux the default rental partner for planners/decorators | Repeat partner bookings; partner-attributed revenue |
| Differentiate trade pricing from retail | Logged-in partners see and checkout at trade rates |
| Reduce back-and-forth for multi-client workflows | Partners manage multiple client events in one place |
| Keep ops simple for staff | Admin can approve partners, set tiers, and see partner-sourced orders |

**Non-goals (v1):** Multi-vendor marketplace, public preferred-vendor directory, commission payouts automation, white-label portals for partner agencies.

---

## 2. Positioning & personas

PrimeLux remains a **single-operator luxury rental house**. Planners/decorators are **trade partners**, not competing vendors in a marketplace.

| Persona | Needs |
|---------|--------|
| **Event planner** | Book on behalf of clients, trade pricing, quick quotes, priority holds, shared lookbooks |
| **Decorator / designer** | Same as planner + inventory hold windows, design consult booking, mood-board / favorites sharing |
| **PrimeLux staff** | Approve applications, assign rate tiers, see which orders come from partners |

Brand language in-product: **Partner Portal** / **Preferred Vendor Program** (avoid “vendor marketplace”).

---

## 3. Program model

### Membership states

```
applicant → pending review → approved (active) → suspended / revoked
```

- **Applicant:** submits company + contact details via `/partners/apply` (public) or invite link.
- **Pending:** can log in but sees a “Pending approval” state; no trade rates.
- **Active:** full Partner Portal section + trade pricing at checkout.
- **Suspended / revoked:** portal locked to explanation + contact; rates revert to retail.

### Rate tiers (build on existing `tiered_discounts`)

Today checkout already checks for a `planner` role and applies volume tiers from `tiered_discounts` — but the **`planner` role is never seeded**, and there is **no partner UX**.

Proposed model:

| Tier | Example | Pricing behavior |
|------|---------|------------------|
| **Preferred** | Standard approved partner | Trade % off retail (base partner rate) + existing volume tiers |
| **Elite** | High-volume / exclusive | Higher base trade rate + extended hold windows |
| **House** | Internal / VIP designers | Custom rate card (admin override) |

Implementation options (prefer A for v1):

- **A. Role + partner profile:** Seed `planner` role; store tier on `partner_profiles.tier`; map tier → base discount %; keep volume `tiered_discounts` on top.
- **B. Partner-only price lists:** Separate SKU trade prices (heavier ops; defer).

### Core perks (v1)

1. **Exclusive trade rates** — visible in cart/checkout and a Rates page.
2. **Priority inventory holds** — longer soft-hold before deposit (configurable hours).
3. **Partner booking for clients** — create orders with client contact distinct from the partner account.
4. **Dedicated concierge thread** — messages flagged as partner priority in admin chat.
5. **Showroom priority** — partner appointment type with preferred slots.
6. **Asset kit** — downloadable lookbooks, preferred-vendor badge, rate card PDF.

### Perks (v2+)

- Referral attribution + credits (aligns with roadmap referral program).
- Shared client mood boards / favorites collections.
- Multi-user agency seats (owner + assistants).
- Commission / credit ledger.

---

## 4. Portal information architecture

Keep partners inside the existing **`/account`** shell (same auth, PWA, linen visual language). Branch nav by partner status rather than building a separate app.

### Nav (active partners only)

| Item | Route | Purpose |
|------|-------|---------|
| Partner home | `/account/partner` | Status badge, next events, savings YTD, quick actions |
| Trade rates | `/account/partner/rates` | Current tier, thresholds, example savings |
| Client events | `/account/partner/events` | Multi-client project list → book / open order |
| Perks & assets | `/account/partner/perks` | Hold rules, badge, downloads, how to list PrimeLux |
| Apply / status | `/account/partner/apply` | Application form or pending state (non-partners) |

End-client nav (Orders, Favorites, Appointments, Messages, Profile, Settings) remains. Partner items appear as a labeled group (“Partner program”) above or below core items when eligible.

### Key screens (first viewport / one job each)

**Partner home**

- Brand signal: “Preferred Vendor Partner”
- One headline: tier + status
- One supporting line: next delivery or “Start a client booking”
- CTA group: *New client event* · *View trade rates*
- No stat strips or card grids in the first viewport; metrics live below the fold

**Trade rates**

- Current tier explanation
- Volume ladder (reuse `tiered_discounts` data)
- Note that rates apply only when logged in as an approved partner

**Client events**

- List of partner-managed projects (client name, event date, linked order status)
- Empty state → create first client event
- Detail → client contacts, venue, linked order(s), messages

**Perks & assets**

- Hold window copy
- Concierge / appointment benefits
- Downloadable assets (storage URLs)

### Public / acquisition

- Marketing page: `/partners` — program pitch + CTA to apply (reuse about/testimonial planner language).
- Application: `/partners/apply` → creates `partner_profiles` row + optional auth signup.
- Post-login: non-partners see a soft upsell on `/account` (“Are you a planner? Join the Preferred Vendor Program”).

---

## 5. Data model

### New tables

**`partner_profiles`**

| Column | Notes |
|--------|-------|
| `id` uuid PK | |
| `user_id` uuid FK → auth.users | Unique; one primary account per partner v1 |
| `company_name` text | |
| `business_type` text | `planner` \| `decorator` \| `designer` \| `other` |
| `website` text nullable | |
| `instagram` text nullable | |
| `phone` text | |
| `tax_id` text nullable | Optional; for agreements later |
| `status` text | `pending` \| `active` \| `suspended` \| `revoked` |
| `tier` text | `preferred` \| `elite` \| `house` |
| `base_discount_percent` int nullable | Override; else derive from tier settings |
| `notes` text | Staff-only |
| `approved_at` timestamptz | |
| `approved_by` uuid nullable | Staff user |
| `created_at` / `updated_at` | |

**`partner_events`** (lightweight projects — the old `events` table was removed; partners need multi-client context)

| Column | Notes |
|--------|-------|
| `id` uuid PK | |
| `partner_id` uuid FK → partner_profiles | |
| `client_name` text | End client / couple / brand |
| `client_email` text nullable | For order attribution / claims |
| `client_phone` text nullable | |
| `event_date` date nullable | |
| `venue_name` / `venue_address` | Optional until checkout |
| `status` text | `planning` \| `booked` \| `completed` \| `cancelled` |
| `order_id` uuid nullable FK → orders | Set when booking converts |
| `created_at` / `updated_at` | |

**`partner_tier_settings`** (admin-configurable; or store in `settings` JSON)

| Column | Notes |
|--------|-------|
| `tier` text PK | |
| `base_discount_percent` int | Applied before volume tiers |
| `hold_hours` int | Soft hold window |
| `label` text | Display name |

### Schema touch-ups

- Seed role: `planner` (or rename to `partner` and update checkout) in `roles`.
- On approve: assign role + set `partner_profiles.status = active`.
- `orders`: add nullable `partner_id` / `partner_event_id` for attribution (partner books; `user_id` may remain the partner; client email stored on order + partner_event).
- Consultations: optional `partner_id` link when `planner_name` matches an approved partner (nice-to-have).

### RLS

- Partners: read/update own `partner_profiles`; CRUD own `partner_events`; read own partner-attributed orders.
- Staff (admin/manager): full manage on partner tables.
- Trade rates: only active partners receive partner discount path in checkout (server-side; never trust client).

---

## 6. Auth & access

| Path | Behavior |
|------|----------|
| Existing `/account` login | Unchanged for end clients |
| Partner apply | Creates auth user (if needed) + `partner_profiles` pending |
| Staff invite partner | Extend invite flow or admin “Invite partner” → email with token; on accept, pending or auto-active |
| Middleware | No `/admin` access for partners; partner routes gated in `/account/partner/*` layout by `partner_profiles.status` |
| Role check | Centralize `isActivePartner(userId)` in `lib/auth/` (replace ad-hoc checkout query) |

Fix checkout’s current `planner` role lookup to use the shared helper and combine **base tier discount + volume `tiered_discounts`**.

---

## 7. Checkout, shared carts & payment model

**Critical billing rule:** End clients must **never** pay PrimeLux on a partner-sourced booking. If they did, PrimeLux would receive retail and owe the partner a cut. Instead:

1. Partner builds a cart and creates a **shared cart** with a public link (`/share/[token]`).
2. Client reviews **retail** pricing only — **no Stripe / no payment** on the share link.
3. Partner invoices and collects from the client externally.
4. Partner **settles** with PrimeLux in the portal at the **trade total** (base tier % + volume ladder).
5. Order is created with `billing_party = 'partner'`, `client_can_pay = false`, owned by the partner account.

Cart / partner checkout badge: “Partner trade pricing — settle-up with PrimeLux.”
Admin order detail shows Partner badge + company name.

---

## 8. Admin surface

New admin area under CRM / Marketing, e.g. **`/admin/partners`**:

| View | Actions |
|------|---------|
| Applications inbox | Approve / reject, set tier, notes |
| Partner directory | Search, suspend, edit tier / discount override |
| Partner order report | Filter orders by `partner_id`; GMV and savings |

Reuse existing patterns from `/admin/customers` and `/admin/marketing/discounts`. Extend discounts admin to document that volume tiers are **partner-only** (current checkout behavior).

---

## 9. UX & design notes

- Stay within account portal tokens (linen / champagne / IBM Plex + Instrument Serif) — do not invent a second visual system.
- Partner home: one composition, brand-first (“PrimeLux Preferred Partner”), not a dashboard of cards.
- Motion: subtle status reveal on approval, rate-tier highlight transition, list enter for events (2–3 intentional motions).
- Mobile: partner nav items in existing bottom bar overflow / sidebar sheet; prioritize Partner home + New event.

---

## 10. Phased delivery

### Phase 0 — Foundations (unblocks everything)

- Seed `planner` / `partner` role; `partner_profiles` + tier settings; RLS; `isActivePartner()`.
- Wire checkout to role + base discount correctly; admin assign role manually for pilot partners.
- Soft entry: `/account` banner for users without a profile → apply.

### Phase 1 — Partner section MVP

- Routes: `/account/partner`, `/rates`, `/perks`, `/apply`.
- Public `/partners` + application.
- Admin approve/reject + tier.
- Cart badge + discount visibility.
- Asset uploads via Storage (manual admin URLs OK).

### Phase 2 — Multi-client workflow

- `partner_events` CRUD.
- Checkout “book for client” + order attribution.
- Partner home driven by upcoming partner events.

### Phase 3 — Deeper perks

- Priority holds, partner appointment type, message priority flag.
- Rate card PDF generation.
- Reporting in admin.

### Phase 4 — Growth loops

- Referral codes / credits (roadmap item).
- Agency seats.
- Optional public “as seen with” partner stories (CMS).

---

## 11. Mapping to current codebase

| Existing | Use |
|----------|-----|
| `/account/*` shell, sidebar, bottom bar | Host partner section; extend `accountNavItems` conditionally |
| `tiered_discounts` + `/admin/marketing/discounts` | Volume ladder for partners |
| Checkout planner role check in `app/actions/checkout.ts` | Replace with `isActivePartner` + base tier discount |
| `consultations.has_planner` / `planner_name` | Lead signal only; later link to `partner_id` |
| Staff `/invite/[token]` | Pattern for partner invites (separate token type) |
| Account messages / appointments | Flag or type for partner priority (Phase 3) |
| `FUTURE_ROADMAPPING.md` referral program | Phase 4 |

### Gaps this plan fills

- No partner identity, approval, or portal IA today.
- `planner` role referenced but not seeded.
- No multi-client event entity for trade bookings.
- No admin CRM for preferred partners.

---

## 12. Open decisions

1. **Role name:** Implemented as `partner` (not `planner`).
2. **Who is the order’s `user_id`:** Partner account owns the order; client contact lives on the shared cart / delivery notes. Client email is **not** used as `customer_email` so claim/pay paths cannot unlock Stripe for the end client.
3. **Invoice presentation:** Share link shows retail only; partner portal shows retail vs trade side-by-side.
4. **Application auto-approve:** Never for v1; staff review in `/admin/partners`.
5. **Whether decorators differ from planners in product:** Same portal; `business_type` for CRM only.

---

## 13. Acceptance criteria (MVP)

- Approved partner sees Partner nav and trade rates page reflecting their tier.
- Checkout applies base + volume discounts only for `status = active` partners.
- Pending applicants see status, not rates.
- Staff can approve/reject and set tier in admin.
- End clients without partner profile see no partner routes (or only apply CTA).
- Partner-attributed orders identifiable in admin (Phase 2: via `partner_id`).

---

## 14. Suggested implementation order for engineering

1. Migration: `partner_profiles`, `partner_tier_settings`, seed role, RLS.
2. `lib/auth/partners.ts` helpers.
3. Fix checkout discount path.
4. Admin partners list + approve.
5. Account layout nav branching + partner pages (home, rates, perks, apply).
6. Public `/partners` marketing + apply flow.
7. `partner_events` + checkout linkage.
8. Polish: badges, assets, reporting.

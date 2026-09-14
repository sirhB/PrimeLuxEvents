# Admin Dashboard Refresh + Weekend Prep Workflow

Living build tracker for this refresh. Update after every phase.

## Progress

- [x] IA + shell a11y + single main landmark
- [x] Ops Today home + weekend summary widgets
- [x] Week Prep hub + cohort queries + generate-by-delivery-range fix
- [x] Wire schedule / scanner / pack-slip / delivery filters into Week Prep
- [x] Standardize page-shell patterns on major surfaces (Ops Today, Week Prep, Delivery header chrome)
- [x] Docs (`ADMIN.md`) + cleanup notes

## Goals

- Workflow-first admin console (not a flat list of ~28 tools)
- Weekday → weekend delivery prep at the center of ops
- Keep Atelier Rail theme; improve hierarchy, contrast, a11y
- Reuse pick D−2 / pack D−1 / load D task chain; add range-aware UI + readiness rollups

## Notes

### IA + shell
- Reorganized [`lib/admin/nav.ts`](lib/admin/nav.ts) into Today / Pipeline / Fulfillment / Catalog / Manage
- Week Prep is a top Today item and mobile tab (Orders / Week Prep / Scan / Inbox / Menu)
- Sidebar filters by `permission` + admin role; groups support `defaultCollapsed`
- Skip link + `#admin-main`; site layout avoids nested `<main>` on portal routes
- Command palette listbox / option semantics; mobile menu `aria-expanded` / `aria-controls`

### Ops Today
- [`app/admin/page.tsx`](app/admin/page.tsx) + [`components/admin/dashboard/dashboard-content.tsx`](components/admin/dashboard/dashboard-content.tsx)
- Attention queue, weekend readiness rollup, today’s tasks, quick actions (analytics charts moved off the home path)

### Week Prep
- [`/admin/week-prep`](app/admin/week-prep/page.tsx) readiness board
- Cohort helpers in [`lib/warehouse/week-prep.ts`](lib/warehouse/week-prep.ts) + [`lib/warehouse/weekend.ts`](lib/warehouse/weekend.ts)
- `generateWarehouseTasksForDeliveryDateRange` in task-generator

### Fulfillment wiring
- Warehouse schedule accepts `?from=&to=` range mode
- Delivery planner filters by `from`/`to`/`date`
- Pack slips seed date from `date`/`from` and can narrow upcoming list with `to`
- Scanner accepts `orderId` from Week Prep rows

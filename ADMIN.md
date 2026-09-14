# PrimeLux Events — Admin

Operational console for the luxury event rental business. Staff roles (`admin`, `manager`, `staff`) access `/admin` after login.

## Navigation

| Section | Pages |
|---------|--------|
| **Today** | Ops Today, Week Prep, Calendar, Activity, Analytics |
| **Pipeline** | Orders, Leads, Appointments, Messages, Customers |
| **Fulfillment** | Warehouse schedule, Scanner, Pack slips, Delivery, Bags, Inventory, Warehouse, Tasks, Logistics |
| **Catalog** | Products, Categories, Packages, Portfolio, Site editor |
| **Manage** | Preferred partners, Discounts, Staff, Staff shifts, Settings |

Mobile bottom bar: **Orders / Week Prep / Scan / Inbox / Menu**. Desktop search is command-palette driven (`⌘K` / `Ctrl+K`). Nav items with a `permission` are filtered from the sidebar when the signed-in user lacks that permission (admins still see everything).

## Core workflows

### Ops Today (`/admin`)
Attention queue (pending orders, new leads, unread messages, overdue warehouse tasks), this-weekend readiness summary, today’s due tasks, and quick actions.

### Week Prep (`/admin/week-prep`)
Weekday control surface for upcoming Fri–Sun deliveries:
1. Confirmed orders with weekend `delivery_date`
2. Pick (D−2) → Pack (D−1) → Bags → Load (D) readiness per order
3. Generate missing warehouse tasks for the weekend window
4. Deep links into warehouse schedule (`?from=&to=`), scanner (`?orderId=`), pack slips (`?date=` / range), and delivery planner (`?from=&to=`)

### Warehouse task chain
Reuse `lib/warehouse/task-generator.ts`: pick due delivery−2, pack due delivery−1, vehicle load due delivery day. Progress lives on tasks (not new order statuses).

## Capabilities

- **CRM:** Lead kanban, customers, consultations, messaging
- **Orders:** Create/process bookings, invoices, bag assignment, pack slips
- **Inventory:** Products, categories, packages, stock views, warehouse locations, QR scan picking
- **Ops:** Week Prep, logistics hub, delivery, calendar, team tasks, appointments
- **Content:** Portfolio + visual site editor
- **System:** Staff/permissions, global settings, activity audit

## Shell architecture

- Layout: `app/admin/layout.tsx` → `AdminLayoutContent`
- Nav config: `lib/admin/nav.ts` (single source for sidebar, mobile tabs, command palette)
- Page chrome: `components/admin/page-shell.tsx` (`AdminPage`, `AdminPageHeader`, panels, stats, empty states)
- Theme tokens: `--dashboard-*` in `app/globals.css` (Atelier Rail graphite + brass)
- A11y: skip link to `#admin-main`, single main landmark on admin (site layout uses a `div` for portal routes), `aria-expanded` on nav groups / mobile menu, command palette listbox semantics

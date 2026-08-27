# PrimeLux Events — Admin

Operational console for the luxury event rental business. Staff roles (`admin`, `manager`, `staff`) access `/admin` after login.

## Navigation

| Section | Pages |
|---------|--------|
| **Home** | Dashboard, Analytics, Activity |
| **Pipeline** | Orders, Leads, Appointments, Messages, Customers, Discounts |
| **Fulfillment** | Logistics, Delivery, Scanner, Pack slips, Inventory, Warehouse, Bags, Tasks, Calendar |
| **Catalog** | Products, Categories, Packages, Portfolio, Site editor |
| **Admin** | Staff, Settings |

Mobile uses a compact bottom bar (Orders / Leads / Scan / Inbox / Menu) with the full tree in the slide-out sidebar. Desktop search is command-palette driven (`⌘K` / `Ctrl+K`).

## Capabilities

- **CRM:** Lead kanban, customers, consultations, messaging
- **Orders:** Create/process bookings, invoices, bag assignment, pack slips
- **Inventory:** Products, categories, packages, stock views, warehouse locations, QR scan picking
- **Ops:** Logistics hub, delivery, calendar, team tasks, appointments
- **Content:** Portfolio + visual site editor
- **System:** Staff/permissions, global settings, activity audit

## Shell architecture

- Layout: `app/admin/layout.tsx` → `AdminLayoutContent`
- Nav config: `lib/admin/nav.ts` (single source for sidebar, mobile tabs, command palette)
- Page chrome: `components/admin/page-shell.tsx` (`AdminPage`, `AdminPageHeader`, panels, stats)
- Theme tokens: `--dashboard-*` in `app/globals.css` (Atelier Rail graphite + brass)

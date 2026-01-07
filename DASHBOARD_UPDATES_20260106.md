# Dashboard Updates - January 6, 2026

## Summary of Changes

This document outlines the changes made to the PrimeLux Events admin dashboard to improve lead tracking and order visibility.

## 1. Upcoming Orders Card (Replaces "Projects Worked")

### Location
- **Component**: `/components/admin/dashboard/upcoming-orders-card.tsx`
- **Dashboard**: `/app/admin/page.tsx`

### Features
- Shows orders with associated events occurring within the next 10 days
- Displays key metrics:
  - Total number of upcoming orders
  - Total revenue from upcoming orders
- Lists up to 5 upcoming orders with:
  - Customer name
  - Event name and date
  - Days until event
  - Order total
  - Order status badge
- Click any order to navigate to order details
- "See All" link to view all orders

### Technical Details
- Queries the `events` table for events within 10-day window
- Joins with `orders` table via `event_id` foreign key
- Calculates days until event dynamically
- Color-coded status badges (confirmed = green, pending = yellow, etc.)

## 2. Consultations Rebranded to "Leads"

### Purpose
Better reflects the nature of tracking potential customers and their progression through the sales funnel.

### Changes Made

#### Database
- **Migration**: `/supabase/migrations/20260106_rebrand_consultations_to_leads.sql`
- Updated table comments to reflect "Leads" terminology
- Database table name remains `consultations` for backward compatibility

#### User Interface Updates

1. **Main Leads Page** (`/app/admin/consultations/page.tsx`)
   - Page title: "Consultations" → "Leads"
   - Description: Updated to reference lead tracking and follow-up
   - Search placeholder: "Search consultations..." → "Search leads..."
   - Empty states: "No consultations" → "No leads"

2. **Navigation** 
   - **Admin Sidebar** (`/components/admin-sidebar.tsx`): "Consultations" → "Leads"
   - **Modern Sidebar** (`/components/admin/modern-sidebar.tsx`): "Consultations" → "Leads"

3. **Search Component** (`/components/admin-search.tsx`)
   - Type label: "Consultations" → "Leads"
   - Search placeholders updated
   - Quick links updated
   - Help text updated

### Workflow Stages (Unchanged)
The lead progression workflow remains the same:
1. **New Request** - Awaiting triage
2. **Pending Client Response** - Waiting on a reply
3. **Appointment Confirmed** - Booked on the calendar
4. **Completed** - Wrap up and follow-up

### Internal Code
- Variable names, types, and database references remain as `consultation` for consistency
- Only user-facing text has been updated to "Leads"

## Benefits

### Upcoming Orders Card
- **Better visibility**: Admins can immediately see what's coming up in the next 10 days
- **Revenue tracking**: Quick view of upcoming revenue
- **Proactive planning**: Identify orders that need attention before delivery dates

### Leads Rebranding
- **Clearer terminology**: "Leads" better communicates the purpose of tracking potential customers
- **Sales focus**: Emphasizes the follow-up and conversion aspects
- **Industry standard**: Aligns with common CRM terminology

## Future Enhancements

### Potential Additions
1. **Lead scoring**: Add priority/quality indicators to leads
2. **Follow-up reminders**: Automated notifications for leads requiring action
3. **Conversion tracking**: Track which leads convert to orders
4. **Lead sources**: Track where leads come from (website, referral, etc.)
5. **Communication history**: Inline view of all communications with a lead
6. **Lead assignment**: Assign leads to specific team members

### Upcoming Orders Enhancements
1. **Delivery route planning**: Group orders by delivery location
2. **Inventory alerts**: Flag orders with low-stock items
3. **Custom date ranges**: Allow filtering by different time windows
4. **Export functionality**: Export upcoming orders for printing/planning

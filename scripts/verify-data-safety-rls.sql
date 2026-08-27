-- Staging verification matrix for 20260829_database_data_safety.sql
-- Run in Supabase SQL editor as a privileged role, then re-test as anon / customer / staff
-- via the API or Table Editor with those JWTs.

-- 1) Helpers exist
SELECT public.is_staff() IS NOT NULL AS is_staff_exists;

-- 2) No open authenticated policies on ops tables
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'tasks',
    'warehouse_task_templates',
    'staff_shifts',
    'warehouse_bags',
    'bag_assignments',
    'warehouse_locations',
    'admin_notifications'
  )
ORDER BY tablename, policyname;

-- Expect: policy names start with Staff / use is_staff(); no "Authenticated users can ..."

-- 3) Customer broad UPDATE policy removed
SELECT policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'orders'
  AND policyname = 'Customers can sign their own orders';
-- Expect: 0 rows

-- 4) Signature / claim RPCs exist and are executable by authenticated only
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('customer_sign_order', 'customer_claim_orders', 'search_users', 'get_user_by_email');

-- Manual API checks (document results):
-- [ ] Anon SELECT products (active) OK; INSERT orders DENIED
-- [ ] Customer A cannot SELECT Customer B orders
-- [ ] Customer cannot UPDATE orders.status / balance_paid via PostgREST
-- [ ] customer_sign_order works for owner; fails for non-owner
-- [ ] Non-staff cannot SELECT tasks / warehouse_* / staff_shifts
-- [ ] Non-staff search_users / get_user_by_email raises Not authorized
-- [ ] Forged admin-auth-cache cookie rejected by middleware
-- [ ] Checkout with inflated packageData.price uses DB price
-- [ ] createPaymentIntent with customAmount above total is clamped
-- [ ] Stripe webhook duplicate PI is no-op

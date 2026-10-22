-- Lock down SECURITY DEFINER helpers flagged by the Supabase security advisor.
-- No behavior change for the app: triggers fire regardless of EXECUTE grants,
-- planner_is_banned is only called with the service-role client (lib/membership/server.ts),
-- and planner_owns_lead is only used in RLS policies scoped to `authenticated`.

-- Trigger function: never meant to be called directly.
REVOKE EXECUTE ON FUNCTION public.planner_settings_audit_trg() FROM PUBLIC, anon, authenticated;

-- Ban lookup by email would let anyone probe which emails are banned.
REVOKE EXECUTE ON FUNCTION public.planner_is_banned(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.planner_is_banned(uuid, text) TO service_role;

-- Only needed by signed-in planners (RLS on planner_carts); always false for anon anyway.
REVOKE EXECUTE ON FUNCTION public.planner_owns_lead(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.planner_owns_lead(uuid) TO authenticated, service_role;

-- Left unchanged on purpose: can_read_planner_cart, client_quotes, client_quote_lines,
-- client_quote_payments, client_approve_planner_cart. Each enforces access internally
-- (is_admin / owning planner / client_can_read_lead) and is called from client quote flows.

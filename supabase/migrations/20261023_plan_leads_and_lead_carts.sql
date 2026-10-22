-- Rentals-first onboarding: "Plan your event" leads + server-side carts tied to a lead.
-- Reuses the existing CRM lead table (public.venue_leads) and event_plans.
-- Anonymous visitors never read leads. They hold an opaque random token (httpOnly cookie);
-- only its SHA-256 hash is stored. Cart reads/writes go through SECURITY DEFINER functions
-- that match on that hash, so a visitor can only ever touch their own cart.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS budget_range text;
ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS location_choice text
  CHECK (location_choice IS NULL OR location_choice IN ('primelux', 'own', 'tbd'));
ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS location_detail text;
ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS date_flexible boolean DEFAULT false NOT NULL;
ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS contact_consent boolean DEFAULT false NOT NULL;
ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS contact_consent_at timestamptz;
ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS visitor_token_hash text;

CREATE UNIQUE INDEX IF NOT EXISTS venue_leads_visitor_token_hash_key
  ON public.venue_leads (visitor_token_hash) WHERE visitor_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS venue_leads_user_id_idx ON public.venue_leads (user_id);
CREATE INDEX IF NOT EXISTS venue_leads_contact_email_idx ON public.venue_leads (lower(contact_email));

CREATE TABLE IF NOT EXISTS public.lead_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE REFERENCES public.venue_leads(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) <= 200),
  item_count integer NOT NULL DEFAULT 0 CHECK (item_count >= 0),
  subtotal_cents integer NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  checked_out_at timestamptz,
  order_id uuid,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS lead_carts_updated_at_idx ON public.lead_carts (updated_at);

ALTER TABLE public.lead_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_leads ENABLE ROW LEVEL SECURITY;

-- Staff (venue CRM) can see and manage every cart. Nobody else gets table access.
DROP POLICY IF EXISTS "Staff manage lead carts" ON public.lead_carts;
CREATE POLICY "Staff manage lead carts"
  ON public.lead_carts FOR ALL
  TO authenticated
  USING (public.can_manage_venue_crm() OR public.is_staff())
  WITH CHECK (public.can_manage_venue_crm() OR public.is_staff());

-- Anonymous/public visitors may only INSERT a fresh plan-flow lead (no SELECT/UPDATE/DELETE),
-- so they can never read other leads. The app inserts through the server, but this keeps the
-- table safe if the anon key is used directly.
DROP POLICY IF EXISTS "Visitors insert plan leads" ON public.venue_leads;
CREATE POLICY "Visitors insert plan leads"
  ON public.venue_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    source = 'plan_flow'
    AND stage = 'inquiry'
    AND owner_name IS NULL
    AND coalesce(value_cents, 0) = 0
    AND visitor_token_hash IS NOT NULL
    AND contact_consent = true
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- Signed-in clients can read the leads attached to their own account.
DROP POLICY IF EXISTS "Clients read own plan leads" ON public.venue_leads;
CREATE POLICY "Clients read own plan leads"
  ON public.venue_leads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Token-scoped cart access ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.lead_cart_for_token(p_token text)
RETURNS TABLE (lead_id uuid, items jsonb, item_count integer, subtotal_cents integer, updated_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT c.lead_id, c.items, c.item_count, c.subtotal_cents, c.updated_at
  FROM public.venue_leads l
  JOIN public.lead_carts c ON c.lead_id = l.id
  WHERE p_token IS NOT NULL
    AND length(p_token) >= 32
    AND l.visitor_token_hash = encode(digest(p_token, 'sha256'), 'hex')
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.save_lead_cart(p_token text, p_items jsonb, p_item_count integer, p_subtotal_cents integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_lead uuid;
BEGIN
  IF p_token IS NULL OR length(p_token) < 32 THEN
    RAISE EXCEPTION 'invalid token';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) > 200 THEN
    RAISE EXCEPTION 'invalid cart';
  END IF;
  SELECT id INTO v_lead FROM public.venue_leads
   WHERE visitor_token_hash = encode(digest(p_token, 'sha256'), 'hex');
  IF v_lead IS NULL THEN
    RAISE EXCEPTION 'unknown lead';
  END IF;
  INSERT INTO public.lead_carts (lead_id, items, item_count, subtotal_cents, updated_at, checked_out_at)
  VALUES (v_lead, p_items, greatest(p_item_count, 0), greatest(p_subtotal_cents, 0), timezone('utc'::text, now()), NULL)
  ON CONFLICT (lead_id) DO UPDATE
    SET items = excluded.items,
        item_count = excluded.item_count,
        subtotal_cents = excluded.subtotal_cents,
        updated_at = excluded.updated_at,
        checked_out_at = CASE WHEN excluded.item_count > 0 THEN NULL ELSE public.lead_carts.checked_out_at END;
  RETURN v_lead;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_lead_cart_checked_out(p_token text, p_order_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  UPDATE public.lead_carts c
     SET checked_out_at = timezone('utc'::text, now()), order_id = p_order_id
    FROM public.venue_leads l
   WHERE c.lead_id = l.id
     AND p_token IS NOT NULL AND length(p_token) >= 32
     AND l.visitor_token_hash = encode(digest(p_token, 'sha256'), 'hex');
$$;

REVOKE ALL ON FUNCTION public.lead_cart_for_token(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_lead_cart(text, jsonb, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_lead_cart_checked_out(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lead_cart_for_token(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.save_lead_cart(text, jsonb, integer, integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_lead_cart_checked_out(text, uuid) TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_carts TO authenticated;
GRANT INSERT ON public.venue_leads TO anon;

-- Abandonment view for the CRM (staff-only through lead_carts RLS; security_invoker keeps RLS).
CREATE OR REPLACE VIEW public.lead_cart_status
WITH (security_invoker = true) AS
SELECT
  c.lead_id,
  c.item_count,
  c.subtotal_cents,
  c.updated_at,
  c.checked_out_at,
  CASE
    WHEN c.checked_out_at IS NOT NULL THEN 'checked_out'
    WHEN c.item_count = 0 THEN 'empty'
    ELSE 'open'
  END AS status
FROM public.lead_carts c;

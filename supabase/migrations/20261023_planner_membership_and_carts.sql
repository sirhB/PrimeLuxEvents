-- Planner membership (Stripe Billing, $99/mo) + planner carts for client events.
-- Members get 50% off eligible rentals as their cost; they set the client price (markup).
-- Client payments are Stripe Connect direct charges on the planner's Express account
-- (planner = merchant of record); Prime Lux's share is the application fee
-- (lib/carts/split.ts primeLuxFeeCents). Isolated in lib/carts/payment-provider.ts. No payout ledger.
-- Ships in the PR only. Apply with the Supabase CLI after review.
--
-- Access (RLS on every new table):
--   admins (public.is_admin()) everything
--   planners: their own membership, carts, lines, payments
--   clients: shared quotes on their own event (public.client_can_read_lead) + approve via RPC
--   Stripe webhook writes with the service role (bypasses RLS)

-- ---------------------------------------------------------------------------
-- Membership
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.planner_memberships (
  planner_user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'none'
    CHECK (status IN ('none', 'incomplete', 'active', 'past_due', 'balance_due', 'canceled', 'terminated')),
  current_period_end timestamptz,
  -- balance_due: unpaid membership invoices still owed after canceling while past due
  balance_due_cents bigint NOT NULL DEFAULT 0 CHECK (balance_due_cents >= 0),
  balance_due_url text,                          -- Stripe hosted invoice page for the oldest open invoice
  terminated_at timestamptz,
  terminated_reason text CHECK (terminated_reason IN ('nonpayment', 'sharing')),
  terminated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  policies_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Permanent bans. Keyed by user and by email so a new account with the same email can't rejoin.
-- No delete policy for anyone: bans are permanent (service role only).
CREATE TABLE IF NOT EXISTS public.planner_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email_lower text,
  stripe_customer_id text,
  reason text NOT NULL CHECK (reason IN ('nonpayment', 'sharing')),
  banned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE UNIQUE INDEX IF NOT EXISTS planner_bans_user_uidx ON public.planner_bans (planner_user_id) WHERE planner_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS planner_bans_email_idx ON public.planner_bans (email_lower);

CREATE OR REPLACE FUNCTION public.planner_is_banned(p_user uuid, p_email text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.planner_bans b
    WHERE (p_user IS NOT NULL AND b.planner_user_id = p_user)
       OR (p_email IS NOT NULL AND b.email_lower = lower(p_email))
  );
$$;

-- Stripe webhook idempotency for planner events (platform + Connect endpoints).
CREATE TABLE IF NOT EXISTS public.planner_stripe_events (
  stripe_event_id text PRIMARY KEY,
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'processed', 'failed')),
  error text,
  received_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------------
-- Member discount eligibility (admin-managed). A product rule beats its category rule.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_discount_eligibility (
  target_type text NOT NULL CHECK (target_type IN ('product', 'category')),
  target_id uuid NOT NULL,
  eligible boolean NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (target_type, target_id)
);

-- ---------------------------------------------------------------------------
-- Which planner works which client event (admin-assigned)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.planner_event_assignments (
  lead_id uuid PRIMARY KEY REFERENCES public.venue_leads(id) ON DELETE CASCADE,
  planner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS planner_event_assignments_planner_idx ON public.planner_event_assignments (planner_user_id);

-- ---------------------------------------------------------------------------
-- Cart settings (single row)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.planner_cart_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  member_discount_bps integer NOT NULL DEFAULT 5000 CHECK (member_discount_bps BETWEEN 0 AND 10000),
  max_line_discount_bps integer NOT NULL DEFAULT 1500 CHECK (max_line_discount_bps BETWEEN 0 AND 10000),
  default_deposit_bps integer NOT NULL DEFAULT 3000 CHECK (default_deposit_bps BETWEEN 100 AND 10000),
  -- Prime Lux platform/service fee on every planner-collected payment (default 0 = off).
  -- Deducted from the planner's proceeds inside the application fee; never added to the
  -- client's total and never varies by payment method (CT surcharge law).
  platform_fee_bps integer NOT NULL DEFAULT 0 CHECK (platform_fee_bps BETWEEN 0 AND 5000),
  platform_fee_flat_cents integer NOT NULL DEFAULT 0 CHECK (platform_fee_flat_cents BETWEEN 0 AND 100000),
  platform_fee_min_cents integer CHECK (platform_fee_min_cents >= 0),
  platform_fee_cap_cents integer CHECK (platform_fee_cap_cents >= 0),
  -- Prime Lux collects sales tax as a marketplace facilitator (off by default).
  -- TODO(CPA): CT marketplace facilitator rule (CGS 12-408e, $250k threshold) needs CPA review.
  marketplace_facilitator_tax boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);
INSERT INTO public.planner_cart_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Audit trail for admin changes to fees and tax settings (who, when, before/after).
CREATE TABLE IF NOT EXISTS public.planner_settings_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  before jsonb NOT NULL,
  after jsonb NOT NULL
);
CREATE OR REPLACE FUNCTION public.planner_settings_audit_trg()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF to_jsonb(OLD) - 'updated_at' IS DISTINCT FROM to_jsonb(NEW) - 'updated_at' THEN
    INSERT INTO public.planner_settings_audit (changed_by, before, after) VALUES (NEW.updated_by, to_jsonb(OLD), to_jsonb(NEW));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS planner_settings_audit ON public.planner_cart_settings;
CREATE TRIGGER planner_settings_audit AFTER UPDATE ON public.planner_cart_settings
  FOR EACH ROW EXECUTE FUNCTION public.planner_settings_audit_trg();

-- ---------------------------------------------------------------------------
-- Carts and lines
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.planner_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.venue_leads(id) ON DELETE CASCADE,
  planner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL DEFAULT 'Event quote',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'shared', 'approved', 'paid', 'ordered', 'void')),
  note_to_client text,
  default_markup_bps integer CHECK (default_markup_bps BETWEEN 0 AND 100000),
  delivery_fee_cents bigint NOT NULL DEFAULT 0 CHECK (delivery_fee_cents >= 0),
  tax_rate numeric(6, 5) NOT NULL DEFAULT 0.08875 CHECK (tax_rate >= 0 AND tax_rate < 1),
  -- Server-computed snapshot (never trusted from the browser)
  member_active_at_pricing boolean NOT NULL DEFAULT false,
  subtotal_cents bigint NOT NULL DEFAULT 0,      -- client merchandise after line discounts
  setup_fee_cents bigint NOT NULL DEFAULT 0,
  tax_cents bigint NOT NULL DEFAULT 0,
  total_cents bigint NOT NULL DEFAULT 0,
  cost_cents bigint NOT NULL DEFAULT 0,          -- planner cost (member price) of merchandise
  margin_cents bigint NOT NULL DEFAULT 0,        -- subtotal - cost: the planner's markup
  paid_cents bigint NOT NULL DEFAULT 0,
  shared_at timestamptz,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS planner_carts_lead_idx ON public.planner_carts (lead_id);
CREATE INDEX IF NOT EXISTS planner_carts_planner_idx ON public.planner_carts (planner_user_id, status);

CREATE TABLE IF NOT EXISTS public.planner_cart_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.planner_carts(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('product', 'package', 'venue')),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  package_id uuid REFERENCES public.packages(id) ON DELETE SET NULL,
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  name text NOT NULL,
  image_url text,
  list_unit_cents bigint NOT NULL CHECK (list_unit_cents >= 0),     -- site price
  cost_unit_cents bigint NOT NULL CHECK (cost_unit_cents >= 0),     -- planner cost
  client_unit_cents bigint NOT NULL CHECK (client_unit_cents >= 0), -- what the client pays
  markup_bps integer CHECK (markup_bps BETWEEN 0 AND 100000),
  member_discounted boolean NOT NULL DEFAULT false,
  setup_fee_cents bigint NOT NULL DEFAULT 0 CHECK (setup_fee_cents >= 0),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 10000),
  discount_bps integer NOT NULL DEFAULT 0 CHECK (discount_bps BETWEEN 0 AND 10000),
  note text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  -- No stacking: a member-discounted line can't also carry a line discount.
  CHECK (NOT (member_discounted AND discount_bps > 0)),
  CHECK (client_unit_cents >= cost_unit_cents OR discount_bps = 0)
);
CREATE INDEX IF NOT EXISTS planner_cart_lines_cart_idx ON public.planner_cart_lines (cart_id);

-- Planner Stripe Connect (Express) accounts. Status mirrors account.updated webhooks.
CREATE TABLE IF NOT EXISTS public.planner_connect_accounts (
  planner_user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id text NOT NULL UNIQUE,      -- acct_...
  charges_enabled boolean NOT NULL DEFAULT false,
  payouts_enabled boolean NOT NULL DEFAULT false,
  details_submitted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Client payments for a cart: Payment Links created ON the planner's connected account
-- (direct charges) with application_fee_amount = Prime Lux's share of that payment.
CREATE TABLE IF NOT EXISTS public.planner_cart_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.planner_carts(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('deposit', 'installment', 'final')),
  label text NOT NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  application_fee_cents bigint NOT NULL DEFAULT 0 CHECK (application_fee_cents >= 0 AND application_fee_cents <= amount_cents),
  platform_fee_cents bigint NOT NULL DEFAULT 0 CHECK (platform_fee_cents >= 0 AND platform_fee_cents <= application_fee_cents),
  stripe_account_id text,                      -- planner's acct_ the charge lives on
  stripe_payment_link_id text UNIQUE,
  url text,
  stripe_checkout_session_id text UNIQUE,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_fee_cents bigint,                     -- Stripe processing fee (paid by the planner's account)
  refunded_cents bigint NOT NULL DEFAULT 0 CHECK (refunded_cents >= 0),
  fee_refunded_cents bigint NOT NULL DEFAULT 0 CHECK (fee_refunded_cents >= 0),
  dispute_status text NOT NULL DEFAULT 'none' CHECK (dispute_status IN ('none', 'open', 'won', 'lost')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'void')),
  paid_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS planner_cart_payments_cart_idx ON public.planner_cart_payments (cart_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.planner_owns_lead(p_lead uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.planner_event_assignments a WHERE a.lead_id = p_lead AND a.planner_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.can_read_planner_cart(p_cart uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.planner_carts c
    WHERE c.id = p_cart AND (
      public.is_admin()
      OR c.planner_user_id = auth.uid()
      OR (c.status IN ('shared', 'approved', 'paid', 'ordered') AND public.client_can_read_lead(c.lead_id))
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.client_approve_planner_cart(p_cart uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_lead uuid; v_status text;
BEGIN
  SELECT lead_id, status INTO v_lead, v_status FROM public.planner_carts WHERE id = p_cart FOR UPDATE;
  IF v_lead IS NULL OR NOT public.client_can_read_lead(v_lead) THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF v_status <> 'shared' THEN RAISE EXCEPTION 'quote is not awaiting approval'; END IF;
  UPDATE public.planner_carts
     SET status = 'approved', approved_at = timezone('utc'::text, now()), approved_by = auth.uid(),
         updated_at = timezone('utc'::text, now())
   WHERE id = p_cart;
END;
$$;
REVOKE ALL ON FUNCTION public.client_approve_planner_cart(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.client_approve_planner_cart(uuid) TO authenticated;

-- Client-safe quote lines: client price only (no cost, margin, or list price).
CREATE OR REPLACE FUNCTION public.client_quote_lines(p_cart uuid)
RETURNS TABLE (id uuid, name text, image_url text, client_unit_cents bigint, setup_fee_cents bigint,
               quantity integer, discount_bps integer, note text, item_position integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT l.id, l.name, l.image_url, l.client_unit_cents, l.setup_fee_cents, l.quantity, l.discount_bps, l.note, l.position
  FROM public.planner_cart_lines l
  JOIN public.planner_carts c ON c.id = l.cart_id
  WHERE l.cart_id = p_cart
    AND c.status IN ('shared', 'approved', 'paid', 'ordered')
    AND (public.client_can_read_lead(c.lead_id) OR public.is_admin() OR c.planner_user_id = auth.uid())
  ORDER BY l.position;
$$;
REVOKE ALL ON FUNCTION public.client_quote_lines(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.client_quote_lines(uuid) TO authenticated;

-- Client-safe quote headers for the signed-in client (shared or later, own events only).
CREATE OR REPLACE FUNCTION public.client_quotes()
RETURNS TABLE (id uuid, lead_id uuid, title text, status text, note_to_client text,
               delivery_fee_cents bigint, tax_rate numeric, subtotal_cents bigint, setup_fee_cents bigint,
               tax_cents bigint, total_cents bigint, paid_cents bigint, approved_at timestamptz, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.lead_id, c.title, c.status, c.note_to_client, c.delivery_fee_cents, c.tax_rate, c.subtotal_cents,
         c.setup_fee_cents, c.tax_cents, c.total_cents, c.paid_cents, c.approved_at, c.updated_at
  FROM public.planner_carts c
  WHERE c.status IN ('shared', 'approved', 'paid', 'ordered') AND public.client_can_read_lead(c.lead_id)
  ORDER BY c.updated_at DESC;
$$;
REVOKE ALL ON FUNCTION public.client_quotes() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.client_quotes() TO authenticated;

CREATE OR REPLACE FUNCTION public.client_quote_payments(p_cart uuid)
RETURNS TABLE (id uuid, kind text, label text, amount_cents bigint, url text, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.kind, p.label, p.amount_cents, p.url, p.status
  FROM public.planner_cart_payments p
  WHERE p.cart_id = p_cart AND public.can_read_planner_cart(p_cart) AND p.status <> 'void'
  ORDER BY p.created_at;
$$;
REVOKE ALL ON FUNCTION public.client_quote_payments(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.client_quote_payments(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.planner_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_discount_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_event_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_cart_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_settings_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_cart_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_cart_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_connect_accounts ENABLE ROW LEVEL SECURITY;

-- Admin read/write on everything except bans and webhook log (read-only; service role writes).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'planner_memberships', 'member_discount_eligibility', 'planner_event_assignments', 'planner_cart_settings',
    'planner_carts', 'planner_cart_lines', 'planner_cart_payments', 'planner_connect_accounts'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_all', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t || '_admin_all', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['planner_bans', 'planner_stripe_events', 'planner_settings_audit'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_admin())', t || '_admin_select', t);
  END LOOP;
END $$;

-- Planners read their own rows (membership status changes only via webhook / server).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['planner_memberships', 'planner_event_assignments', 'planner_carts', 'planner_connect_accounts'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_planner_select_own', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (planner_user_id = auth.uid())', t || '_planner_select_own', t);
  END LOOP;
END $$;

-- Eligibility and cart settings are readable by staff (pricing needs them).
DROP POLICY IF EXISTS member_discount_eligibility_staff_select ON public.member_discount_eligibility;
CREATE POLICY member_discount_eligibility_staff_select ON public.member_discount_eligibility
  FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS planner_cart_settings_staff_select ON public.planner_cart_settings;
CREATE POLICY planner_cart_settings_staff_select ON public.planner_cart_settings
  FOR SELECT TO authenticated USING (public.is_staff());

-- Carts: planners create/edit their own for assigned events while draft/shared.
DROP POLICY IF EXISTS planner_carts_planner_insert ON public.planner_carts;
CREATE POLICY planner_carts_planner_insert ON public.planner_carts
  FOR INSERT TO authenticated
  WITH CHECK (planner_user_id = auth.uid() AND public.planner_owns_lead(lead_id) AND status = 'draft');
DROP POLICY IF EXISTS planner_carts_planner_update ON public.planner_carts;
CREATE POLICY planner_carts_planner_update ON public.planner_carts
  FOR UPDATE TO authenticated
  USING (planner_user_id = auth.uid() AND status IN ('draft', 'shared'))
  WITH CHECK (planner_user_id = auth.uid() AND public.planner_owns_lead(lead_id) AND status IN ('draft', 'shared', 'void'));
-- Clients get NO direct select on planner_carts (it holds cost and margin columns).
-- They read quotes through client_quotes() below, which returns client-safe columns only.

-- Lines: planners (own, editable carts) and admins only. Clients use client_quote_lines().
DROP POLICY IF EXISTS planner_cart_lines_planner_select ON public.planner_cart_lines;
CREATE POLICY planner_cart_lines_planner_select ON public.planner_cart_lines
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.planner_carts c WHERE c.id = cart_id AND c.planner_user_id = auth.uid()));
DROP POLICY IF EXISTS planner_cart_lines_planner_write ON public.planner_cart_lines;
CREATE POLICY planner_cart_lines_planner_write ON public.planner_cart_lines
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.planner_carts c WHERE c.id = cart_id AND c.planner_user_id = auth.uid() AND c.status IN ('draft', 'shared')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.planner_carts c WHERE c.id = cart_id AND c.planner_user_id = auth.uid() AND c.status IN ('draft', 'shared')));

-- Payments (with the fee split): the cart's planner and admins only.
-- Clients get just label/amount/url/status through client_quote_payments().
DROP POLICY IF EXISTS planner_cart_payments_planner_read ON public.planner_cart_payments;
CREATE POLICY planner_cart_payments_planner_read ON public.planner_cart_payments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.planner_carts c WHERE c.id = cart_id AND c.planner_user_id = auth.uid()));

-- ===========================================================================
-- Planner invoicing (included with an active membership)
-- Stripe Invoicing on the planner's connected account (direct). application_fee_amount
-- covers only Prime Lux catalog lines (lib/invoices/math.ts). Custom-only invoices: no fee.
-- ===========================================================================

ALTER TABLE public.planner_connect_accounts
  ADD COLUMN IF NOT EXISTS business_name text,
  ADD COLUMN IF NOT EXISTS logo_file_id text;     -- Stripe file on the connected account

CREATE TABLE IF NOT EXISTS public.planner_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  email text NOT NULL CHECK (position('@' in email) > 1),
  phone text,
  company text,
  lead_id uuid REFERENCES public.venue_leads(id) ON DELETE SET NULL,
  stripe_customer_id text,                        -- cus_ on the planner's connected account
  stripe_account_id text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (planner_user_id, email)
);

CREATE TABLE IF NOT EXISTS public.planner_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  client_id uuid NOT NULL REFERENCES public.planner_clients(id) ON DELETE RESTRICT,
  cart_id uuid REFERENCES public.planner_carts(id) ON DELETE SET NULL,  -- converted from a cart/quote
  title text NOT NULL DEFAULT 'Invoice',
  memo text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  plan_mode text NOT NULL DEFAULT 'full' CHECK (plan_mode IN ('full', 'deposit', 'installments')),
  deposit_bps integer CHECK (deposit_bps BETWEEN 100 AND 9900),
  installments integer CHECK (installments BETWEEN 2 AND 12),
  due_date date,
  delivery_fee_cents bigint NOT NULL DEFAULT 0 CHECK (delivery_fee_cents >= 0),
  tax_rate numeric(6, 5) NOT NULL DEFAULT 0.08875 CHECK (tax_rate >= 0 AND tax_rate < 1),
  -- Server-computed snapshot
  member_active_at_pricing boolean NOT NULL DEFAULT false,
  total_cents bigint NOT NULL DEFAULT 0,
  tax_cents bigint NOT NULL DEFAULT 0,
  prime_lux_fee_cents bigint NOT NULL DEFAULT 0 CHECK (prime_lux_fee_cents >= 0),
  paid_cents bigint NOT NULL DEFAULT 0,
  stripe_account_id text,
  -- Unguessable token for the public client pay page (/pay/invoice/[id]?t=...)
  access_token text NOT NULL DEFAULT (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS planner_invoices_planner_idx ON public.planner_invoices (planner_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.planner_invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.planner_invoices(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  kind text NOT NULL CHECK (kind IN ('catalog', 'custom')),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,  -- catalog only
  name text NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 100000),
  list_unit_cents bigint NOT NULL DEFAULT 0,      -- catalog: site price
  setup_fee_cents bigint NOT NULL DEFAULT 0,      -- catalog: Prime Lux setup
  eligible boolean NOT NULL DEFAULT false,        -- catalog: member discount applies (server-set)
  markup_bps integer CHECK (markup_bps BETWEEN 0 AND 100000),
  unit_cents bigint NOT NULL DEFAULT 0 CHECK (unit_cents >= 0),  -- client unit price (server-computed for catalog)
  taxable boolean NOT NULL DEFAULT true
);

-- One Stripe invoice per scheduled payment (full = one; deposit/installments = several, each
-- with its own due date and its proportional share of the Prime Lux fee).
CREATE TABLE IF NOT EXISTS public.planner_invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.planner_invoices(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  label text NOT NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  application_fee_cents bigint NOT NULL DEFAULT 0 CHECK (application_fee_cents >= 0 AND application_fee_cents <= amount_cents),
  platform_fee_cents bigint NOT NULL DEFAULT 0 CHECK (platform_fee_cents >= 0 AND platform_fee_cents <= application_fee_cents),
  refunded_cents bigint NOT NULL DEFAULT 0,
  fee_refunded_cents bigint NOT NULL DEFAULT 0,
  due_date date,
  stripe_invoice_id text UNIQUE,
  number text,
  hosted_invoice_url text,
  invoice_pdf text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  stripe_fee_cents bigint,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.planner_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_invoice_payments ENABLE ROW LEVEL SECURITY;

-- Admins: everything.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['planner_clients', 'planner_invoices', 'planner_invoice_lines', 'planner_invoice_payments'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_all', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t || '_admin_all', t);
  END LOOP;
END $$;

-- Planners: read their own clients/invoices. All writes go through server actions
-- (service role) so membership gating and server-side pricing can't be bypassed.
DROP POLICY IF EXISTS planner_clients_own_select ON public.planner_clients;
CREATE POLICY planner_clients_own_select ON public.planner_clients
  FOR SELECT TO authenticated USING (planner_user_id = auth.uid());
DROP POLICY IF EXISTS planner_invoices_own_select ON public.planner_invoices;
CREATE POLICY planner_invoices_own_select ON public.planner_invoices
  FOR SELECT TO authenticated USING (planner_user_id = auth.uid());
DROP POLICY IF EXISTS planner_invoice_lines_own_select ON public.planner_invoice_lines;
CREATE POLICY planner_invoice_lines_own_select ON public.planner_invoice_lines
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.planner_invoices i WHERE i.id = invoice_id AND i.planner_user_id = auth.uid()));
DROP POLICY IF EXISTS planner_invoice_payments_own_select ON public.planner_invoice_payments;
CREATE POLICY planner_invoice_payments_own_select ON public.planner_invoice_payments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.planner_invoices i WHERE i.id = invoice_id AND i.planner_user_id = auth.uid()));

-- Public client pay page: invoice id + access token. Returns client-safe fields only
-- (no cost, markup, or Prime Lux fee). Drafts and voids are not shown.
CREATE OR REPLACE FUNCTION public.public_invoice(p_id uuid, p_token text)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', i.id, 'title', i.title, 'memo', i.memo, 'status', i.status, 'due_date', i.due_date,
    'total_cents', i.total_cents, 'tax_cents', i.tax_cents, 'paid_cents', i.paid_cents,
    'business_name', coalesce(ca.business_name, 'Your planner'),
    'client_name', c.name,
    'lines', coalesce((SELECT jsonb_agg(jsonb_build_object('name', l.name, 'description', l.description, 'quantity', l.quantity, 'unit_cents', l.unit_cents) ORDER BY l.position)
              FROM public.planner_invoice_lines l WHERE l.invoice_id = i.id), '[]'::jsonb),
    'delivery_fee_cents', i.delivery_fee_cents,
    'setup_fee_cents', coalesce((SELECT sum(l.setup_fee_cents * l.quantity) FROM public.planner_invoice_lines l WHERE l.invoice_id = i.id AND l.kind = 'catalog'), 0),
    'payments', coalesce((SELECT jsonb_agg(jsonb_build_object('label', p.label, 'amount_cents', p.amount_cents, 'due_date', p.due_date, 'status', p.status, 'number', p.number, 'url', p.hosted_invoice_url, 'pdf', p.invoice_pdf) ORDER BY p.position)
              FROM public.planner_invoice_payments p WHERE p.invoice_id = i.id AND p.status <> 'void'), '[]'::jsonb)
  )
  FROM public.planner_invoices i
  JOIN public.planner_clients c ON c.id = i.client_id
  LEFT JOIN public.planner_connect_accounts ca ON ca.planner_user_id = i.planner_user_id
  WHERE i.id = p_id AND i.access_token = p_token AND i.status IN ('open', 'paid', 'uncollectible');
$$;
REVOKE ALL ON FUNCTION public.public_invoice(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_invoice(uuid, text) TO anon, authenticated;

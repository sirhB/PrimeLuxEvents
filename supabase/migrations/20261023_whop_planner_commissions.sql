-- Whop planner payouts: connected accounts, checkout links, payments, and a commission ledger.
-- Ships in the PR only. Apply with the Supabase CLI after review.
--
-- Access model (RLS on every table):
--   * admins (public.is_admin()) read and write everything
--   * a planner reads only rows where planner_user_id = auth.uid()
--   * the Whop webhook writes with the service role, which bypasses RLS
-- Money is stored in integer cents. Rates are basis points (1000 = 10%).

-- ---------------------------------------------------------------------------
-- Global defaults (single row)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commission_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  default_rate_bps integer NOT NULL DEFAULT 1000 CHECK (default_rate_bps BETWEEN 0 AND 10000),
  earn_trigger text NOT NULL DEFAULT 'final_payment' CHECK (earn_trigger IN ('deposit', 'final_payment')),
  currency text NOT NULL DEFAULT 'usd',
  auto_transfer boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);
INSERT INTO public.commission_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- One row per planner: Whop connected account, KYC state, commission rate
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.planner_payout_profiles (
  planner_user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  whop_account_id text UNIQUE,                 -- biz_...
  kyc_status text NOT NULL DEFAULT 'not_started'
    CHECK (kyc_status IN ('not_started', 'pending', 'approved', 'rejected')),
  kyc_verification_id text,
  rate_bps integer CHECK (rate_bps BETWEEN 0 AND 10000),  -- null = use commission_settings.default_rate_bps
  earn_trigger text CHECK (earn_trigger IN ('deposit', 'final_payment')), -- null = global default
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------------
-- Per-event planner assignment and optional overrides
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_commission_terms (
  lead_id uuid PRIMARY KEY REFERENCES public.venue_leads(id) ON DELETE CASCADE,
  planner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  rate_bps_override integer CHECK (rate_bps_override BETWEEN 0 AND 10000),
  earn_trigger_override text CHECK (earn_trigger_override IN ('deposit', 'final_payment')),
  contract_total_cents bigint CHECK (contract_total_cents >= 0),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS event_commission_terms_planner_idx ON public.event_commission_terms (planner_user_id);

-- ---------------------------------------------------------------------------
-- Checkout links created through Whop for an event
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whop_checkout_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.venue_leads(id) ON DELETE CASCADE,
  planner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  kind text NOT NULL CHECK (kind IN ('deposit', 'installment', 'final')),
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'usd',
  title text NOT NULL,
  whop_checkout_id text UNIQUE,
  whop_plan_id text,
  purchase_url text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'void')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS whop_checkout_links_lead_idx ON public.whop_checkout_links (lead_id);
CREATE INDEX IF NOT EXISTS whop_checkout_links_planner_idx ON public.whop_checkout_links (planner_user_id);

-- ---------------------------------------------------------------------------
-- Payments reported by Whop webhooks (tagged with lead + planner via metadata)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whop_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whop_payment_id text NOT NULL UNIQUE,
  checkout_link_id uuid REFERENCES public.whop_checkout_links(id) ON DELETE SET NULL,
  lead_id uuid NOT NULL REFERENCES public.venue_leads(id) ON DELETE CASCADE,
  planner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  kind text NOT NULL CHECK (kind IN ('deposit', 'installment', 'final')),
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  refunded_cents bigint NOT NULL DEFAULT 0 CHECK (refunded_cents >= 0),
  currency text NOT NULL DEFAULT 'usd',
  dispute_status text NOT NULL DEFAULT 'none' CHECK (dispute_status IN ('none', 'open', 'won', 'lost')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS whop_payments_lead_idx ON public.whop_payments (lead_id);
CREATE INDEX IF NOT EXISTS whop_payments_planner_idx ON public.whop_payments (planner_user_id);

-- ---------------------------------------------------------------------------
-- Commission ledger. Append-only deltas: accruals are positive, reversals negative.
-- The running total per (lead, planner) is the commission currently owed.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commission_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.venue_leads(id) ON DELETE CASCADE,
  planner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  entry_type text NOT NULL CHECK (entry_type IN ('accrual', 'reversal')),
  amount_cents bigint NOT NULL,
  basis_cents bigint NOT NULL DEFAULT 0,
  rate_bps integer NOT NULL CHECK (rate_bps BETWEEN 0 AND 10000),
  status text NOT NULL DEFAULT 'earned'
    CHECK (status IN ('pending', 'earned', 'held', 'transferring', 'paid', 'failed', 'reversed', 'offset')),
  reason text,
  source_event_id text,                        -- webhook-id that produced the entry
  whop_transfer_id text UNIQUE,
  transfer_idempotency_key text UNIQUE,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CHECK ((entry_type = 'accrual' AND amount_cents >= 0) OR (entry_type = 'reversal' AND amount_cents <= 0))
);
CREATE INDEX IF NOT EXISTS commission_entries_planner_idx ON public.commission_entries (planner_user_id, status);
CREATE INDEX IF NOT EXISTS commission_entries_lead_idx ON public.commission_entries (lead_id);

-- ---------------------------------------------------------------------------
-- Webhook idempotency: one row per Whop webhook-id
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whop_webhook_events (
  webhook_id text PRIMARY KEY,
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'processed', 'ignored', 'failed')),
  error text,
  received_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  processed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.commission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_payout_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_commission_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whop_checkout_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whop_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whop_webhook_events ENABLE ROW LEVEL SECURITY;

-- Admins: full access everywhere.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'commission_settings', 'planner_payout_profiles', 'event_commission_terms',
    'whop_checkout_links', 'whop_payments', 'commission_entries', 'whop_webhook_events'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_all', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
      t || '_admin_all', t
    );
  END LOOP;
END $$;

-- Planners: read their own rows only.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'planner_payout_profiles', 'event_commission_terms', 'whop_checkout_links',
    'whop_payments', 'commission_entries'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_planner_select_own', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (planner_user_id = auth.uid())',
      t || '_planner_select_own', t
    );
  END LOOP;
END $$;

-- Planners may create checkout links for events assigned to them (server re-checks too).
DROP POLICY IF EXISTS whop_checkout_links_planner_insert_own ON public.whop_checkout_links;
CREATE POLICY whop_checkout_links_planner_insert_own ON public.whop_checkout_links
  FOR INSERT TO authenticated
  WITH CHECK (
    planner_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.event_commission_terms t
      WHERE t.lead_id = whop_checkout_links.lead_id AND t.planner_user_id = auth.uid()
    )
  );

-- Staff may read the global defaults (rate and trigger shown on My earnings).
DROP POLICY IF EXISTS commission_settings_staff_select ON public.commission_settings;
CREATE POLICY commission_settings_staff_select ON public.commission_settings
  FOR SELECT TO authenticated USING (public.is_staff());

-- whop_webhook_events has no planner policy: admins only (service role bypasses RLS).

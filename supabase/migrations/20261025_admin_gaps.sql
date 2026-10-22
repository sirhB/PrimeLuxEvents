-- Admin gaps: CRM persistence, abandoned-cart setting, public venue day status, order refunds.
-- Ship in PR only; apply after review.

-- 1. CRM persistence -------------------------------------------------------
ALTER TABLE public.crm_reminders ADD COLUMN IF NOT EXISTS done_at timestamptz;
ALTER TABLE public.crm_reminders ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.crm_saved_views ADD COLUMN IF NOT EXISTS cart text;
ALTER TABLE public.crm_saved_views ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.crm_proposals ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.crm_contracts ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.crm_payments ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.venue_tours ADD COLUMN IF NOT EXISTS venue_name text;
ALTER TABLE public.venue_bookings ADD COLUMN IF NOT EXISTS venue_name text;
ALTER TABLE public.task_comments ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS crm_reminders_due_idx ON public.crm_reminders (due_on) WHERE done = false;

-- RLS stays on (enabled in 20261016); re-assert for safety.
ALTER TABLE public.crm_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_saved_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_proposal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- 2. Abandoned-cart threshold (settings is staff-write; value is not sensitive)
INSERT INTO public.settings (key, value, description)
VALUES ('crm_cart_abandon_days', '3', 'Days without checkout before a lead cart counts as abandoned')
ON CONFLICT (key) DO NOTHING;

-- 3. Public venue day status ------------------------------------------------
-- Staff-only reads on venue_availability; public gets only (day, status) via function.
DROP POLICY IF EXISTS "Public read venue availability" ON public.venue_availability;
DROP POLICY IF EXISTS "Staff read venue availability" ON public.venue_availability;
CREATE POLICY "Staff read venue availability"
  ON public.venue_availability FOR SELECT TO authenticated
  USING (public.can_manage_venue_crm());

ALTER TABLE public.venue_availability ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.venue_availability ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Status precedence: a live booking (confirmed/booked) > staff block (booked/closed/blocked)
-- > live hold > staff hold > open. Staff "open" never hides a live booking or hold.
CREATE OR REPLACE FUNCTION public.venue_day_status(p_venue_id uuid, p_from date, p_to date)
RETURNS TABLE (day date, status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH days AS (
    SELECT d::date AS day
    FROM generate_series(p_from, LEAST(p_to, p_from + 400), interval '1 day') d
  ),
  booked AS (
    SELECT d.day,
      max(CASE WHEN b.status IN ('confirmed', 'booked', 'contracted') THEN 2
               WHEN b.status IN ('hold', 'held') THEN 1 ELSE 0 END) AS rank
    FROM days d
    JOIN public.venue_bookings b
      ON b.venue_id = p_venue_id
     AND b.status NOT IN ('released', 'cancelled')
     AND d.day BETWEEN b.starts_on AND b.ends_on
    GROUP BY d.day
  ),
  manual AS (
    SELECT a.day,
      CASE WHEN a.status IN ('booked', 'closed', 'blocked') THEN 2
           WHEN a.status IN ('hold', 'held') THEN 1 ELSE 0 END AS rank
    FROM public.venue_availability a
    WHERE a.venue_id = p_venue_id AND a.day BETWEEN p_from AND p_to
  )
  SELECT d.day,
    CASE greatest(coalesce(b.rank, 0), coalesce(m.rank, 0))
      WHEN 2 THEN 'booked' WHEN 1 THEN 'held' ELSE 'open' END
  FROM days d
  LEFT JOIN booked b ON b.day = d.day
  LEFT JOIN manual m ON m.day = d.day
  ORDER BY d.day;
$$;

REVOKE ALL ON FUNCTION public.venue_day_status(uuid, date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.venue_day_status(uuid, date, date) TO anon, authenticated;

-- 4. Order refunds ----------------------------------------------------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunded_amount integer DEFAULT 0 NOT NULL;

CREATE TABLE IF NOT EXISTS public.order_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  payment_intent_id text NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  reason text NOT NULL,
  stripe_reason text,
  idempotency_key text NOT NULL UNIQUE,
  stripe_refund_id text UNIQUE,
  status text DEFAULT 'pending' NOT NULL, -- pending | succeeded | failed | canceled
  error text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS order_refunds_order_idx ON public.order_refunds (order_id);

ALTER TABLE public.order_refunds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff read order refunds" ON public.order_refunds;
CREATE POLICY "Staff read order refunds" ON public.order_refunds FOR SELECT TO authenticated
  USING (public.has_named_permission('orders.view') OR public.has_named_permission('orders.update'));
DROP POLICY IF EXISTS "Staff insert order refunds" ON public.order_refunds;
CREATE POLICY "Staff insert order refunds" ON public.order_refunds FOR INSERT TO authenticated
  WITH CHECK (public.has_named_permission('orders.update'));
DROP POLICY IF EXISTS "Staff update order refunds" ON public.order_refunds;
CREATE POLICY "Staff update order refunds" ON public.order_refunds FOR UPDATE TO authenticated
  USING (public.has_named_permission('orders.update'))
  WITH CHECK (public.has_named_permission('orders.update'));
-- No DELETE policy: refund records are permanent.

DROP TRIGGER IF EXISTS audit_order_refunds ON public.order_refunds;
CREATE TRIGGER audit_order_refunds
  AFTER INSERT OR UPDATE ON public.order_refunds
  FOR EACH ROW EXECUTE FUNCTION record_audit_log();

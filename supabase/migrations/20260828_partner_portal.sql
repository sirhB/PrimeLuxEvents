-- Preferred Vendor Partner Portal
-- Partners create shareable carts for clients (view-only, no client payment).
-- Partners collect from clients externally, then settle the trade portion with PrimeLux.

-- ---------------------------------------------------------------------------
-- Role
-- ---------------------------------------------------------------------------
INSERT INTO roles (name, display_name, description, color, is_system_role)
VALUES (
  'partner',
  'Preferred Partner',
  'Event planner or decorator in the Preferred Vendor program',
  '#a67c52',
  true
)
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Tier settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partner_tier_settings (
  tier text PRIMARY KEY CHECK (tier IN ('preferred', 'elite', 'house')),
  label text NOT NULL,
  base_discount_percent integer NOT NULL CHECK (base_discount_percent >= 0 AND base_discount_percent <= 100),
  hold_hours integer NOT NULL DEFAULT 72,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO partner_tier_settings (tier, label, base_discount_percent, hold_hours) VALUES
  ('preferred', 'Preferred', 10, 72),
  ('elite', 'Elite', 15, 120),
  ('house', 'House', 20, 168)
ON CONFLICT (tier) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Partner profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partner_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  business_type text NOT NULL DEFAULT 'planner'
    CHECK (business_type IN ('planner', 'decorator', 'designer', 'other')),
  website text,
  instagram text,
  phone text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended', 'revoked')),
  tier text NOT NULL DEFAULT 'preferred'
    CHECK (tier IN ('preferred', 'elite', 'house')),
  base_discount_percent integer
    CHECK (base_discount_percent IS NULL OR (base_discount_percent >= 0 AND base_discount_percent <= 100)),
  notes text,
  -- How clients pay the partner (shown on share invoice — not PrimeLux payout)
  payment_zelle text,
  payment_venmo text,
  payment_apple_cash text,
  payment_cash_app text,
  payment_other_label text,
  payment_other_value text,
  payment_instructions text,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_partner_profiles_status ON partner_profiles(status);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_tier ON partner_profiles(tier);

CREATE TRIGGER update_partner_profiles_modtime
  BEFORE UPDATE ON partner_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Shared carts (partner → client review links)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partner_shared_carts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id uuid NOT NULL REFERENCES partner_profiles(id) ON DELETE CASCADE,
  share_token text NOT NULL UNIQUE,
  title text,
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  event_date date,
  event_type text,
  venue_address text,
  delivery_address text,
  delivery_date date,
  delivery_time text,
  pickup_date date,
  pickup_time text,
  same_day_pickup boolean DEFAULT false,
  notes text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Retail = what the client owes the partner (shown on share link)
  retail_subtotal integer NOT NULL DEFAULT 0,
  retail_setup_fee integer NOT NULL DEFAULT 0,
  retail_tax_amount integer NOT NULL DEFAULT 0,
  retail_delivery_fee integer NOT NULL DEFAULT 0,
  retail_total integer NOT NULL DEFAULT 0,
  -- Trade = what the partner owes PrimeLux
  trade_discount_amount integer NOT NULL DEFAULT 0,
  trade_discount_name text,
  trade_subtotal integer NOT NULL DEFAULT 0,
  trade_tax_amount integer NOT NULL DEFAULT 0,
  trade_total integer NOT NULL DEFAULT 0,
  tax_rate numeric,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'shared', 'accepted', 'settled', 'expired', 'cancelled')),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  expires_at timestamptz,
  shared_at timestamptz,
  settled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_partner_shared_carts_partner ON partner_shared_carts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_shared_carts_status ON partner_shared_carts(status);
CREATE INDEX IF NOT EXISTS idx_partner_shared_carts_token ON partner_shared_carts(share_token);

CREATE TRIGGER update_partner_shared_carts_modtime
  BEFORE UPDATE ON partner_shared_carts
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Orders: partner attribution + block client payment
-- ---------------------------------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES partner_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS partner_shared_cart_id uuid REFERENCES partner_shared_carts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS billing_party text DEFAULT 'customer'
    CHECK (billing_party IN ('customer', 'partner')),
  ADD COLUMN IF NOT EXISTS client_can_pay boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_tier_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_shared_carts ENABLE ROW LEVEL SECURITY;

-- Tier settings: authenticated read
DROP POLICY IF EXISTS "Anyone authenticated can read partner tiers" ON partner_tier_settings;
CREATE POLICY "Anyone authenticated can read partner tiers"
  ON partner_tier_settings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can manage partner tiers" ON partner_tier_settings;
CREATE POLICY "Staff can manage partner tiers"
  ON partner_tier_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'manager', 'staff')
    )
  );

-- Partner profiles
DROP POLICY IF EXISTS "Users can read own partner profile" ON partner_profiles;
CREATE POLICY "Users can read own partner profile"
  ON partner_profiles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'manager', 'staff')
    )
  );

DROP POLICY IF EXISTS "Users can create own partner application" ON partner_profiles;
CREATE POLICY "Users can create own partner application"
  ON partner_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own pending partner profile" ON partner_profiles;
CREATE POLICY "Users can update own pending partner profile"
  ON partner_profiles FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'manager')
    )
  );

-- Shared carts: partners manage own; public read via service role / token RPC
DROP POLICY IF EXISTS "Partners manage own shared carts" ON partner_shared_carts;
CREATE POLICY "Partners manage own shared carts"
  ON partner_shared_carts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_profiles pp
      WHERE pp.id = partner_shared_carts.partner_id AND pp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'manager', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM partner_profiles pp
      WHERE pp.id = partner_shared_carts.partner_id AND pp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'manager', 'staff')
    )
  );

-- Public share links are loaded via service-role server actions filtered by share_token.
-- Do not expose shared carts broadly to anon.

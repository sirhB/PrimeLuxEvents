-- Security deposit (separate Stripe charge, refundable) + customer pickup / return windows

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfillment_method text DEFAULT 'delivery'
    CHECK (fulfillment_method IN ('delivery', 'customer_pickup')),
  ADD COLUMN IF NOT EXISTS return_date date,
  ADD COLUMN IF NOT EXISTS return_time text,
  ADD COLUMN IF NOT EXISTS pickup_confirmed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pickup_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS pickup_confirmed_by uuid,
  ADD COLUMN IF NOT EXISTS security_deposit_amount integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS security_deposit_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS security_deposit_status text DEFAULT 'none'
    CHECK (security_deposit_status IN ('none', 'held', 'refunded', 'partially_refunded', 'forfeited')),
  ADD COLUMN IF NOT EXISTS security_deposit_refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS security_deposit_refund_id text;

COMMENT ON COLUMN orders.fulfillment_method IS 'delivery = we deliver; customer_pickup = customer picks up at warehouse';
COMMENT ON COLUMN orders.return_date IS 'Scheduled return / drop-off date for customer pickup rentals';
COMMENT ON COLUMN orders.security_deposit_amount IS 'Refundable security deposit in cents (separate Stripe PaymentIntent)';
COMMENT ON COLUMN orders.security_deposit_payment_intent_id IS 'Stripe PaymentIntent for the security deposit charge';
COMMENT ON COLUMN orders.security_deposit_status IS 'Lifecycle of the held security deposit';

CREATE INDEX IF NOT EXISTS idx_orders_security_deposit_pi
  ON orders (security_deposit_payment_intent_id)
  WHERE security_deposit_payment_intent_id IS NOT NULL;

-- Default settings keys (upsert-friendly for settings table)
INSERT INTO settings (key, value, description)
VALUES
  ('security_deposit_type', 'percent', 'flat or percent'),
  ('security_deposit_flat_cents', '10000', 'Flat security deposit in cents when type=flat'),
  ('security_deposit_percent', '20', 'Percent of merchandise subtotal when type=percent')
ON CONFLICT (key) DO NOTHING;

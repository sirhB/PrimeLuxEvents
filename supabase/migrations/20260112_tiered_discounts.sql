-- Create tiered_discounts table
CREATE TABLE IF NOT EXISTS tiered_discounts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  min_cart_total integer NOT NULL, -- in cents
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value integer NOT NULL, -- percentage (e.g. 5 for 5%) or fixed amount in cents
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE tiered_discounts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage tiered_discounts"
  ON tiered_discounts
  USING (auth.role() = 'authenticated');

-- Trigger to update updated_at
CREATE TRIGGER update_tiered_discounts_modtime
    BEFORE UPDATE ON tiered_discounts
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Add indexes
CREATE INDEX idx_tiered_discounts_min_cart_total ON tiered_discounts(min_cart_total);
CREATE INDEX idx_tiered_discounts_is_active ON tiered_discounts(is_active);

-- Seed some initial data
INSERT INTO tiered_discounts (name, min_cart_total, discount_type, discount_value, is_active)
VALUES 
('Spend $1k, Get 5% Off', 100000, 'percentage', 5, true),
('Spend $5k, Get 10% Off', 500000, 'percentage', 10, true),
('Spend $10k, Get 15% Off', 1000000, 'percentage', 15, true);

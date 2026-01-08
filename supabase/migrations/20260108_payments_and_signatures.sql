-- Create payments table to track transactions against orders
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  amount integer NOT NULL, -- in cents
  payment_method text,
  payment_status text DEFAULT 'pending', -- pending, succeeded, failed
  stripe_payment_intent_id text UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add Phase 2 fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS balance_paid integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS signature_url text,
ADD COLUMN IF NOT EXISTS signed_at timestamp with time zone;

-- Enable RLS on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Public can insert payments (webhook)"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Create signatures bucket in storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for signatures
CREATE POLICY "Public Signature Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'signatures' );

CREATE POLICY "Public Signature Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'signatures' );

CREATE POLICY "Admin Signature Delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'signatures' 
    AND auth.role() = 'authenticated'
);

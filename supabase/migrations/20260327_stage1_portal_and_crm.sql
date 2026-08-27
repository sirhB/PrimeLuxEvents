-- Stage 1: Customer portal hardening, favorites, appointments access, CRM archive

-- 1. Favorites / wishlist
CREATE TABLE IF NOT EXISTS favorites (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can view all favorites" ON favorites;
CREATE POLICY "Staff can view all favorites"
  ON favorites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'manager', 'staff')
    )
  );

-- 2. Customers may update signature fields on their own orders
DROP POLICY IF EXISTS "Customers can sign their own orders" ON orders;
CREATE POLICY "Customers can sign their own orders"
  ON orders FOR UPDATE
  USING (
    auth.uid() = user_id
    OR lower(customer_email) = lower(auth.jwt() ->> 'email')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR lower(customer_email) = lower(auth.jwt() ->> 'email')
  );

-- 3. Link appointments to portal users + customer RLS
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

UPDATE appointments a
SET user_id = up.id
FROM user_profiles up
WHERE a.user_id IS NULL
  AND a.client_email IS NOT NULL
  AND lower(a.client_email) = lower(up.email);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);

DROP POLICY IF EXISTS "Admins can view all appointments." ON appointments;
DROP POLICY IF EXISTS "Admins can insert appointments." ON appointments;
DROP POLICY IF EXISTS "Admins can update appointments." ON appointments;
DROP POLICY IF EXISTS "Admins can delete appointments." ON appointments;
DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Customers can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Customers can create own appointments" ON appointments;
DROP POLICY IF EXISTS "Customers can cancel own appointments" ON appointments;

CREATE POLICY "Staff can manage appointments"
  ON appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'manager', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'manager', 'staff')
    )
  );

CREATE POLICY "Customers can view own appointments"
  ON appointments FOR SELECT
  USING (
    auth.uid() = user_id
    OR lower(client_email) = lower(auth.jwt() ->> 'email')
  );

CREATE POLICY "Customers can create own appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR lower(client_email) = lower(auth.jwt() ->> 'email')
  );

CREATE POLICY "Customers can cancel own appointments"
  ON appointments FOR UPDATE
  USING (
    auth.uid() = user_id
    OR lower(client_email) = lower(auth.jwt() ->> 'email')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR lower(client_email) = lower(auth.jwt() ->> 'email')
  );

-- 4. CRM customer details (archive + notes overrides for guest/registered customers)
CREATE TABLE IF NOT EXISTS customer_details (
  email text PRIMARY KEY,
  full_name text,
  phone text,
  notes text,
  is_archived boolean DEFAULT false NOT NULL,
  archived_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE customer_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage customer_details" ON customer_details;
CREATE POLICY "Staff can manage customer_details"
  ON customer_details FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'manager', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'manager', 'staff')
    )
  );

-- 5. Conversion analytics view for admin dashboard
CREATE OR REPLACE VIEW view_lead_conversion AS
SELECT
  (SELECT COUNT(*)::numeric FROM consultations) AS total_leads,
  (SELECT COUNT(*)::numeric FROM consultations WHERE status IN ('confirmed', 'appointment_confirmed', 'converted')) AS converted_leads,
  CASE
    WHEN (SELECT COUNT(*) FROM consultations) = 0 THEN 0
    ELSE ROUND(
      (
        (SELECT COUNT(*)::numeric FROM consultations WHERE status IN ('confirmed', 'appointment_confirmed', 'converted'))
        / NULLIF((SELECT COUNT(*)::numeric FROM consultations), 0)
      ) * 100,
      1
    )
  END AS conversion_rate_pct;

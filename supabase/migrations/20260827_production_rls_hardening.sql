-- Production security hardening
-- Tightens RLS / storage after moving order creation, payments, signatures,
-- and consultation intake to service-role server actions / webhooks.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'manager', 'staff')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Orders / items / reservations — no public INSERT (service role only)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can create orders." ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can insert order items." ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create rental reservations" ON public.rental_reservations;
DROP POLICY IF EXISTS "Anyone can insert reservations." ON public.rental_reservations;

-- Staff may still insert via the dashboard when needed
DROP POLICY IF EXISTS "Staff can insert orders" ON public.orders;
CREATE POLICY "Staff can insert orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff can insert order items" ON public.order_items;
CREATE POLICY "Staff can insert order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff can insert rental reservations" ON public.rental_reservations;
CREATE POLICY "Staff can insert rental reservations"
  ON public.rental_reservations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- Payments — webhook uses service role; staff can read
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can insert payments (webhook)" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

CREATE POLICY "Staff can view payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (public.is_staff());

CREATE POLICY "Customers can view payments for their orders"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
        AND (
          o.user_id = auth.uid()
          OR lower(o.customer_email) = lower(auth.jwt() ->> 'email')
        )
    )
  );

-- ---------------------------------------------------------------------------
-- Catalog writes — staff only (replace open authenticated write-all)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated can write products" ON public.products;
DROP POLICY IF EXISTS "Authenticated can write categories" ON public.categories;

DROP POLICY IF EXISTS "Staff can write products" ON public.products;
CREATE POLICY "Staff can write products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff can write categories" ON public.categories;
CREATE POLICY "Staff can write categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- Consultations / leads — no open INSERT; staff manage; customers none
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can create consultations." ON public.consultations;
DROP POLICY IF EXISTS "Admins can view all consultations." ON public.consultations;
DROP POLICY IF EXISTS "Admins can update consultations." ON public.consultations;
DROP POLICY IF EXISTS "Admins can delete consultations." ON public.consultations;

CREATE POLICY "Staff can view consultations"
  ON public.consultations FOR SELECT
  TO authenticated
  USING (public.is_staff());

CREATE POLICY "Staff can insert consultations"
  ON public.consultations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update consultations"
  ON public.consultations FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can delete consultations"
  ON public.consultations FOR DELETE
  TO authenticated
  USING (public.is_staff());

-- ---------------------------------------------------------------------------
-- Settings / content writes — staff only
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can update settings." ON public.settings;
DROP POLICY IF EXISTS "Admins can insert settings." ON public.settings;
DROP POLICY IF EXISTS "Admins can update content." ON public.content;
DROP POLICY IF EXISTS "Admins can insert content." ON public.content;

CREATE POLICY "Staff can update settings"
  ON public.settings FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can insert settings"
  ON public.settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update content"
  ON public.content FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can insert content"
  ON public.content FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- Storage — products / portfolio / check-deposits: staff writes
-- Signatures: service role uploads only (no public INSERT)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Admin Check Deposit Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Check Deposit Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Signature Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Signature Delete" ON storage.objects;

CREATE POLICY "Staff upload products"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products' AND public.is_staff());

CREATE POLICY "Staff update products"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'products' AND public.is_staff());

CREATE POLICY "Staff delete products"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'products' AND public.is_staff());

CREATE POLICY "Staff upload portfolio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND public.is_staff());

CREATE POLICY "Staff update portfolio"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_staff());

CREATE POLICY "Staff delete portfolio"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_staff());

CREATE POLICY "Staff upload check deposits"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'check-deposits' AND public.is_staff());

CREATE POLICY "Staff delete check deposits"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'check-deposits' AND public.is_staff());

CREATE POLICY "Staff delete signatures"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'signatures' AND public.is_staff());

-- ---------------------------------------------------------------------------
-- Invitations — wipe legacy plaintext temp passwords
-- ---------------------------------------------------------------------------
UPDATE public.user_invitations
SET temp_password = NULL
WHERE temp_password IS NOT NULL;

COMMENT ON COLUMN public.user_invitations.temp_password IS
  'DEPRECATED: do not store plaintext passwords. Invitation token is the sole secret. Column retained for schema compatibility; always NULL.';

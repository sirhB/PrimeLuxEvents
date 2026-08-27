-- Production security hardening
-- Tightens RLS / storage after moving order creation, payments, signatures,
-- and consultation intake to service-role server actions / webhooks.
--
-- Safe to re-run. Skips tables that do not exist on this project (e.g. plux
-- may lack rental_reservations / payments / user_invitations).

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
  -- If RBAC tables are missing, treat as non-staff (service role still bypasses RLS)
  IF to_regclass('public.user_roles') IS NULL OR to_regclass('public.roles') IS NULL THEN
    RETURN false;
  END IF;

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
  IF to_regclass('public.user_roles') IS NULL OR to_regclass('public.roles') IS NULL THEN
    RETURN false;
  END IF;

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
DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can create orders." ON public.orders';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can insert orders" ON public.orders';
    EXECUTE $p$
      CREATE POLICY "Staff can insert orders"
        ON public.orders FOR INSERT
        TO authenticated
        WITH CHECK (public.is_staff())
    $p$;
  END IF;

  IF to_regclass('public.order_items') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert order items." ON public.order_items';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can insert order items" ON public.order_items';
    EXECUTE $p$
      CREATE POLICY "Staff can insert order items"
        ON public.order_items FOR INSERT
        TO authenticated
        WITH CHECK (public.is_staff())
    $p$;
  END IF;

  IF to_regclass('public.rental_reservations') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can create rental reservations" ON public.rental_reservations';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert reservations." ON public.rental_reservations';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can insert rental reservations" ON public.rental_reservations';
    EXECUTE $p$
      CREATE POLICY "Staff can insert rental reservations"
        ON public.rental_reservations FOR INSERT
        TO authenticated
        WITH CHECK (public.is_staff())
    $p$;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Payments — webhook uses service role; staff can read
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.payments') IS NULL THEN
    RETURN;
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS "Public can insert payments (webhook)" ON public.payments';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments';
  EXECUTE 'DROP POLICY IF EXISTS "Staff can view payments" ON public.payments';
  EXECUTE 'DROP POLICY IF EXISTS "Customers can view payments for their orders" ON public.payments';

  EXECUTE $p$
    CREATE POLICY "Staff can view payments"
      ON public.payments FOR SELECT
      TO authenticated
      USING (public.is_staff())
  $p$;

  EXECUTE $p$
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
      )
  $p$;
END $$;

-- ---------------------------------------------------------------------------
-- Catalog writes — staff only (replace open authenticated write-all)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.products') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated can write products" ON public.products';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can write products" ON public.products';
    EXECUTE $p$
      CREATE POLICY "Staff can write products"
        ON public.products FOR ALL
        TO authenticated
        USING (public.is_staff())
        WITH CHECK (public.is_staff())
    $p$;
  END IF;

  IF to_regclass('public.categories') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated can write categories" ON public.categories';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can write categories" ON public.categories';
    EXECUTE $p$
      CREATE POLICY "Staff can write categories"
        ON public.categories FOR ALL
        TO authenticated
        USING (public.is_staff())
        WITH CHECK (public.is_staff())
    $p$;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Consultations / leads — no open INSERT; staff manage
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.consultations') IS NULL THEN
    RETURN;
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS "Anyone can create consultations." ON public.consultations';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can view all consultations." ON public.consultations';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can update consultations." ON public.consultations';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can delete consultations." ON public.consultations';
  EXECUTE 'DROP POLICY IF EXISTS "Staff can view consultations" ON public.consultations';
  EXECUTE 'DROP POLICY IF EXISTS "Staff can insert consultations" ON public.consultations';
  EXECUTE 'DROP POLICY IF EXISTS "Staff can update consultations" ON public.consultations';
  EXECUTE 'DROP POLICY IF EXISTS "Staff can delete consultations" ON public.consultations';

  EXECUTE $p$
    CREATE POLICY "Staff can view consultations"
      ON public.consultations FOR SELECT
      TO authenticated
      USING (public.is_staff())
  $p$;
  EXECUTE $p$
    CREATE POLICY "Staff can insert consultations"
      ON public.consultations FOR INSERT
      TO authenticated
      WITH CHECK (public.is_staff())
  $p$;
  EXECUTE $p$
    CREATE POLICY "Staff can update consultations"
      ON public.consultations FOR UPDATE
      TO authenticated
      USING (public.is_staff())
      WITH CHECK (public.is_staff())
  $p$;
  EXECUTE $p$
    CREATE POLICY "Staff can delete consultations"
      ON public.consultations FOR DELETE
      TO authenticated
      USING (public.is_staff())
  $p$;
END $$;

-- ---------------------------------------------------------------------------
-- Settings / content writes — staff only
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.settings') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can update settings." ON public.settings';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can insert settings." ON public.settings';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can update settings" ON public.settings';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can insert settings" ON public.settings';
    EXECUTE $p$
      CREATE POLICY "Staff can update settings"
        ON public.settings FOR UPDATE
        TO authenticated
        USING (public.is_staff())
        WITH CHECK (public.is_staff())
    $p$;
    EXECUTE $p$
      CREATE POLICY "Staff can insert settings"
        ON public.settings FOR INSERT
        TO authenticated
        WITH CHECK (public.is_staff())
    $p$;
  END IF;

  IF to_regclass('public.content') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can update content." ON public.content';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can insert content." ON public.content';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can update content" ON public.content';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can insert content" ON public.content';
    EXECUTE $p$
      CREATE POLICY "Staff can update content"
        ON public.content FOR UPDATE
        TO authenticated
        USING (public.is_staff())
        WITH CHECK (public.is_staff())
    $p$;
    EXECUTE $p$
      CREATE POLICY "Staff can insert content"
        ON public.content FOR INSERT
        TO authenticated
        WITH CHECK (public.is_staff())
    $p$;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Storage — products / portfolio / check-deposits: staff writes
-- Signatures: service role uploads only (no public INSERT)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('storage.objects') IS NULL THEN
    RETURN;
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS "Admin Upload" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Admin Update" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Admin Delete" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Admin Upload Portfolio" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Admin Update Portfolio" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Admin Delete Portfolio" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Admin Check Deposit Upload" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Admin Check Deposit Delete" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Public Signature Upload" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Admin Signature Delete" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Staff upload products" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Staff update products" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Staff delete products" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Staff upload portfolio" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Staff update portfolio" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Staff delete portfolio" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Staff upload check deposits" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Staff delete check deposits" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Staff delete signatures" ON storage.objects';

  EXECUTE $p$
    CREATE POLICY "Staff upload products"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'products' AND public.is_staff())
  $p$;
  EXECUTE $p$
    CREATE POLICY "Staff update products"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'products' AND public.is_staff())
  $p$;
  EXECUTE $p$
    CREATE POLICY "Staff delete products"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'products' AND public.is_staff())
  $p$;
  EXECUTE $p$
    CREATE POLICY "Staff upload portfolio"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'portfolio' AND public.is_staff())
  $p$;
  EXECUTE $p$
    CREATE POLICY "Staff update portfolio"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'portfolio' AND public.is_staff())
  $p$;
  EXECUTE $p$
    CREATE POLICY "Staff delete portfolio"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'portfolio' AND public.is_staff())
  $p$;
  EXECUTE $p$
    CREATE POLICY "Staff upload check deposits"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'check-deposits' AND public.is_staff())
  $p$;
  EXECUTE $p$
    CREATE POLICY "Staff delete check deposits"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'check-deposits' AND public.is_staff())
  $p$;
  EXECUTE $p$
    CREATE POLICY "Staff delete signatures"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'signatures' AND public.is_staff())
  $p$;
END $$;

-- ---------------------------------------------------------------------------
-- Invitations — wipe legacy plaintext temp passwords (if column exists)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.user_invitations') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_invitations'
      AND column_name = 'temp_password'
  ) THEN
    EXECUTE 'UPDATE public.user_invitations SET temp_password = NULL WHERE temp_password IS NOT NULL';
    EXECUTE $c$
      COMMENT ON COLUMN public.user_invitations.temp_password IS
        'DEPRECATED: do not store plaintext passwords. Invitation token is the sole secret. Column retained for schema compatibility; always NULL.'
    $c$;
  END IF;
END $$;

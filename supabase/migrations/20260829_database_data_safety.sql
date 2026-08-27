-- Database data safety
-- Staff-only ops tables, column-safe customer order signing, staff-only user
-- search RPCs, and tighter table privileges for anon/authenticated.
-- Safe to re-run. Depends on public.is_staff() from 20260827_production_rls_hardening.

-- ---------------------------------------------------------------------------
-- Ensure is_staff() exists (idempotent if hardening already applied)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_staff()
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
      AND r.name IN ('admin', 'manager', 'staff')
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Tasks — staff only (was any authenticated)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.tasks') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view all tasks" ON public.tasks';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON public.tasks';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can delete tasks" ON public.tasks';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can view tasks" ON public.tasks';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can insert tasks" ON public.tasks';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can update tasks" ON public.tasks';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can delete tasks" ON public.tasks';

    EXECUTE $p$
      CREATE POLICY "Staff can view tasks"
        ON public.tasks FOR SELECT
        USING (public.is_staff())
    $p$;
    EXECUTE $p$
      CREATE POLICY "Staff can insert tasks"
        ON public.tasks FOR INSERT
        WITH CHECK (public.is_staff())
    $p$;
    EXECUTE $p$
      CREATE POLICY "Staff can update tasks"
        ON public.tasks FOR UPDATE
        USING (public.is_staff())
        WITH CHECK (public.is_staff())
    $p$;
    EXECUTE $p$
      CREATE POLICY "Staff can delete tasks"
        ON public.tasks FOR DELETE
        USING (public.is_staff())
    $p$;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Warehouse templates / shifts / bags / locations / notifications
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.warehouse_task_templates') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view warehouse task templates" ON public.warehouse_task_templates';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage warehouse task templates" ON public.warehouse_task_templates';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can view warehouse task templates" ON public.warehouse_task_templates';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can manage warehouse task templates" ON public.warehouse_task_templates';

    EXECUTE $p$
      CREATE POLICY "Staff can view warehouse task templates"
        ON public.warehouse_task_templates FOR SELECT
        USING (public.is_staff())
    $p$;
    EXECUTE $p$
      CREATE POLICY "Staff can manage warehouse task templates"
        ON public.warehouse_task_templates FOR ALL
        USING (public.is_staff())
        WITH CHECK (public.is_staff())
    $p$;
  END IF;

  IF to_regclass('public.staff_shifts') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view staff shifts" ON public.staff_shifts';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage staff shifts" ON public.staff_shifts';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can view staff shifts" ON public.staff_shifts';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can manage staff shifts" ON public.staff_shifts';

    EXECUTE $p$
      CREATE POLICY "Staff can view staff shifts"
        ON public.staff_shifts FOR SELECT
        USING (public.is_staff())
    $p$;
    EXECUTE $p$
      CREATE POLICY "Staff can manage staff shifts"
        ON public.staff_shifts FOR ALL
        USING (public.is_staff())
        WITH CHECK (public.is_staff())
    $p$;
  END IF;

  IF to_regclass('public.warehouse_bags') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view bags" ON public.warehouse_bags';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can update bags" ON public.warehouse_bags';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can view bags" ON public.warehouse_bags';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can manage bags" ON public.warehouse_bags';

    EXECUTE $p$
      CREATE POLICY "Staff can view bags"
        ON public.warehouse_bags FOR SELECT
        USING (public.is_staff())
    $p$;
    EXECUTE $p$
      CREATE POLICY "Staff can manage bags"
        ON public.warehouse_bags FOR ALL
        USING (public.is_staff())
        WITH CHECK (public.is_staff())
    $p$;
  END IF;

  IF to_regclass('public.bag_assignments') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view bag assignments" ON public.bag_assignments';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage bag assignments" ON public.bag_assignments';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can view bag assignments" ON public.bag_assignments';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can manage bag assignments" ON public.bag_assignments';

    EXECUTE $p$
      CREATE POLICY "Staff can view bag assignments"
        ON public.bag_assignments FOR SELECT
        USING (public.is_staff())
    $p$;
    EXECUTE $p$
      CREATE POLICY "Staff can manage bag assignments"
        ON public.bag_assignments FOR ALL
        USING (public.is_staff())
        WITH CHECK (public.is_staff())
    $p$;
  END IF;

  IF to_regclass('public.warehouse_locations') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view warehouse locations" ON public.warehouse_locations';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage warehouse locations" ON public.warehouse_locations';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can view warehouse locations" ON public.warehouse_locations';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can manage warehouse locations" ON public.warehouse_locations';

    EXECUTE $p$
      CREATE POLICY "Staff can view warehouse locations"
        ON public.warehouse_locations FOR SELECT
        USING (public.is_staff())
    $p$;
    EXECUTE $p$
      CREATE POLICY "Staff can manage warehouse locations"
        ON public.warehouse_locations FOR ALL
        USING (public.is_staff())
        WITH CHECK (public.is_staff())
    $p$;
  END IF;

  IF to_regclass('public.admin_notifications') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view notifications" ON public.admin_notifications';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can update notifications" ON public.admin_notifications';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can insert notifications" ON public.admin_notifications';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own notifications" ON public.admin_notifications';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can view notifications" ON public.admin_notifications';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can update notifications" ON public.admin_notifications';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can insert notifications" ON public.admin_notifications';

    -- Prefer per-user notifications when user_id exists; otherwise staff-only
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'admin_notifications' AND column_name = 'user_id'
    ) THEN
      EXECUTE $p$
        CREATE POLICY "Staff can view notifications"
          ON public.admin_notifications FOR SELECT
          USING (public.is_staff() OR user_id = auth.uid())
      $p$;
      EXECUTE $p$
        CREATE POLICY "Staff can update notifications"
          ON public.admin_notifications FOR UPDATE
          USING (public.is_staff() OR user_id = auth.uid())
          WITH CHECK (public.is_staff() OR user_id = auth.uid())
      $p$;
    ELSE
      EXECUTE $p$
        CREATE POLICY "Staff can view notifications"
          ON public.admin_notifications FOR SELECT
          USING (public.is_staff())
      $p$;
      EXECUTE $p$
        CREATE POLICY "Staff can update notifications"
          ON public.admin_notifications FOR UPDATE
          USING (public.is_staff())
          WITH CHECK (public.is_staff())
      $p$;
    END IF;

    EXECUTE $p$
      CREATE POLICY "Staff can insert notifications"
        ON public.admin_notifications FOR INSERT
        WITH CHECK (public.is_staff())
    $p$;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Customer order updates — no broad UPDATE; signature via SECURITY DEFINER RPC
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Customers can sign their own orders" ON public.orders';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.customer_sign_order(
  p_order_id uuid,
  p_signature_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_signature_url IS NULL OR length(trim(p_signature_url)) = 0 OR length(p_signature_url) > 2000 THEN
    RAISE EXCEPTION 'Invalid signature URL';
  END IF;

  v_email := lower(auth.jwt() ->> 'email');

  UPDATE public.orders
  SET
    signature_url = p_signature_url,
    signed_at = timezone('utc'::text, now())
  WHERE id = p_order_id
    AND (
      user_id = auth.uid()
      OR lower(customer_email) = v_email
      OR public.is_staff()
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or not permitted';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.customer_sign_order(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.customer_sign_order(uuid, text) TO authenticated;

-- Claim guest orders for the logged-in customer (sets user_id only when null)
CREATE OR REPLACE FUNCTION public.customer_claim_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_email := lower(auth.jwt() ->> 'email');
  IF v_email IS NULL OR length(v_email) = 0 THEN
    RETURN 0;
  END IF;

  UPDATE public.orders
  SET user_id = auth.uid()
  WHERE user_id IS NULL
    AND lower(customer_email) = v_email;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.customer_claim_orders() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.customer_claim_orders() TO authenticated;

-- ---------------------------------------------------------------------------
-- Chat user search — staff only (prevents email enumeration)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_by_email(email_input text)
RETURNS TABLE (id uuid, email varchar)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT au.id, au.email::varchar
  FROM auth.users au
  WHERE au.email = email_input;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_users(search_term text)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF search_term IS NULL OR length(trim(search_term)) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    up.id,
    up.email::text,
    up.full_name::text
  FROM user_profiles up
  WHERE
    up.email ILIKE '%' || search_term || '%'
    OR up.full_name ILIKE '%' || search_term || '%';
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_by_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.search_users(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_users(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- Narrow table privileges (defense in depth — RLS remains the real ACL)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  -- Revoke blanket ALL; re-grant DML only (no TRUNCATE/REFERENCES/TRIGGER for clients)
  FOR r IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', r.table_name);
    EXECUTE format(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO anon, authenticated',
      r.table_name
    );
  END LOOP;
END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

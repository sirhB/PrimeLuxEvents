-- Bootstrap: grant admin role to admin@admin.com (and admin2@admin.com) if they exist.
-- Public signup does NOT grant staff roles — this must be run after the auth user is created.
-- Safe to re-run. Skips missing tables/users.

DO $$
DECLARE
  admin_role_id uuid;
  target RECORD;
BEGIN
  IF to_regclass('public.roles') IS NULL
     OR to_regclass('public.user_roles') IS NULL
     OR to_regclass('public.user_profiles') IS NULL THEN
    RAISE NOTICE 'RBAC tables missing — skip admin bootstrap';
    RETURN;
  END IF;

  INSERT INTO public.roles (name, display_name, description, color, is_system_role)
  VALUES (
    'admin',
    'Administrator',
    'Full system access with all permissions',
    '#ef4444',
    true
  )
  ON CONFLICT (name) DO NOTHING;

  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
  IF admin_role_id IS NULL THEN
    RAISE NOTICE 'admin role could not be created';
    RETURN;
  END IF;

  -- Ensure authenticated users can read role names (needed for staff login routing)
  -- Without this, joins from user_roles → roles fail for non-admin checks.
  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view roles" ON public.roles';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles';
    EXECUTE $p$
      CREATE POLICY "Authenticated users can view roles"
        ON public.roles FOR SELECT
        TO authenticated
        USING (true)
    $p$;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  FOR target IN
    SELECT id, email
    FROM auth.users
    WHERE lower(email) IN ('admin@admin.com', 'admin2@admin.com')
  LOOP
    INSERT INTO public.user_profiles (id, email, full_name, is_active)
    VALUES (
      target.id,
      target.email,
      CASE
        WHEN lower(target.email) = 'admin@admin.com' THEN 'System Administrator'
        ELSE 'System Administrator 2'
      END,
      true
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      is_active = true,
      updated_at = timezone('utc'::text, now());

    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (target.id, admin_role_id)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Admin role ensured for %', target.email;
  END LOOP;

  IF NOT FOUND THEN
    RAISE NOTICE 'No matching auth users yet. Sign up admin@admin.com first, then re-run this migration.';
  END IF;
END $$;

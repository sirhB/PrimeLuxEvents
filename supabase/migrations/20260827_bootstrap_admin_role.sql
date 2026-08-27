-- One-shot bootstrap for projects missing the RBAC schema (e.g. plux).
-- Creates roles / user_profiles / user_roles, then grants admin@admin.com access.
-- Safe to re-run.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  job_title text,
  department text,
  hire_date date,
  is_active boolean DEFAULT true,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  color text DEFAULT '#6366f1',
  is_system_role boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.user_profiles(id),
  assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(role_id, permission_id)
);

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER so RLS can check roles without recursion)
-- ---------------------------------------------------------------------------
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
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  );
END;
$$;

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

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Staff can view all user profiles" ON public.user_profiles;
CREATE POLICY "Staff can view all user profiles"
  ON public.user_profiles FOR SELECT
  USING (public.is_staff());

DROP POLICY IF EXISTS "Staff can manage user profiles" ON public.user_profiles;
CREATE POLICY "Staff can manage user profiles"
  ON public.user_profiles FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;
CREATE POLICY "Authenticated users can view roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
CREATE POLICY "Admins can manage roles"
  ON public.roles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can view permissions" ON public.permissions;
CREATE POLICY "Authenticated users can view permissions"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
CREATE POLICY "Admins can manage permissions"
  ON public.permissions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can view user_roles" ON public.user_roles;
CREATE POLICY "Authenticated users can view user_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can view role_permissions" ON public.role_permissions;
CREATE POLICY "Authenticated users can view role_permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage role_permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role_permissions"
  ON public.role_permissions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed staff roles + grant admin@admin.com
-- ---------------------------------------------------------------------------
INSERT INTO public.roles (name, display_name, description, color, is_system_role)
VALUES
  ('admin', 'Administrator', 'Full system access with all permissions', '#ef4444', true),
  ('manager', 'Manager', 'Manage operations and team', '#f59e0b', true),
  ('staff', 'Staff', 'Day-to-day warehouse and logistics access', '#3b82f6', true)
ON CONFLICT (name) DO NOTHING;

-- Minimal permissions used by requirePermission() in the app
INSERT INTO public.permissions (name, display_name, resource, action)
VALUES
  ('users.view', 'View users', 'users', 'view'),
  ('users.create', 'Invite users', 'users', 'create'),
  ('users.update', 'Update users', 'users', 'update'),
  ('users.manage', 'Manage roles', 'users', 'manage')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  admin_role_id uuid;
  target RECORD;
  found_any boolean := false;
BEGIN
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';

  FOR target IN
    SELECT id, email
    FROM auth.users
    WHERE lower(email) IN ('admin@admin.com', 'admin2@admin.com')
  LOOP
    found_any := true;

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

    RAISE NOTICE 'Admin role granted to %', target.email;
  END LOOP;

  IF NOT found_any THEN
    RAISE EXCEPTION 'No auth.users row for admin@admin.com. Confirm the user exists in Authentication → Users, then re-run.';
  END IF;
END $$;

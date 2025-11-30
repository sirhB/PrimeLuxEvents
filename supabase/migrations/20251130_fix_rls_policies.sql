-- Migration: Fix RLS policies to allow users to read roles and permissions
-- This resolves the "chicken and egg" problem where users couldn't read roles to verify their admin status

-- Update roles policies
DROP POLICY IF EXISTS "Admins can view roles" ON roles;

CREATE POLICY "Authenticated users can view roles" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Update permissions policies
DROP POLICY IF EXISTS "Admins can view permissions" ON permissions;

CREATE POLICY "Authenticated users can view permissions" ON permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Ensure the admin users exist and have the correct role (just in case)
DO $$
DECLARE
  admin_role_id uuid;
  admin_user_id uuid;
  admin2_user_id uuid;
BEGIN
  -- Get the admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

  -- Find user IDs
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@admin.com';
  SELECT id INTO admin2_user_id FROM auth.users WHERE email = 'admin2@admin.com';

  -- Re-assign admin role to admin@admin.com if user exists
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  -- Re-assign admin role to admin2@admin.com if user exists
  IF admin2_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin2_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
END $$;

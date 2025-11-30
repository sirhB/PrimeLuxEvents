-- Migration: Grant admin permissions to admin@admin.com and admin2@admin.com
-- This script creates user profiles and assigns admin role to specified users

-- First, ensure the admin role exists
INSERT INTO roles (name, display_name, description, color, is_system_role)
VALUES (
  'admin',
  'Administrator',
  'Full system access with all permissions',
  '#ef4444', -- Red color for admin
  true
)
ON CONFLICT (name) DO NOTHING;

-- Get the admin role ID for later use
DO $$
DECLARE
  admin_role_id uuid;
  admin_user_id uuid;
  admin2_user_id uuid;
BEGIN
  -- Get the admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

  -- Find user IDs from auth.users table for admin@admin.com
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@admin.com';

  -- Find user IDs from auth.users table for admin2@admin.com
  SELECT id INTO admin2_user_id 
  FROM auth.users 
  WHERE email = 'admin2@admin.com';

  -- Create or update user profile for admin@admin.com
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO user_profiles (id, email, full_name, is_active)
    VALUES (
      admin_user_id,
      'admin@admin.com',
      'System Administrator',
      true
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      is_active = true,
      updated_at = timezone('utc'::text, now());

    -- Assign admin role to admin@admin.com
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    RAISE NOTICE 'Admin role assigned to admin@admin.com';
  ELSE
    RAISE NOTICE 'User admin@admin.com not found in auth.users. Please create the user first.';
  END IF;

  -- Create or update user profile for admin2@admin.com
  IF admin2_user_id IS NOT NULL THEN
    INSERT INTO user_profiles (id, email, full_name, is_active)
    VALUES (
      admin2_user_id,
      'admin2@admin.com',
      'System Administrator 2',
      true
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      is_active = true,
      updated_at = timezone('utc'::text, now());

    -- Assign admin role to admin2@admin.com
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin2_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    RAISE NOTICE 'Admin role assigned to admin2@admin.com';
  ELSE
    RAISE NOTICE 'User admin2@admin.com not found in auth.users. Please create the user first.';
  END IF;
END $$;

-- Verify the assignments
SELECT 
  up.email,
  up.full_name,
  r.display_name as role,
  up.is_active
FROM user_profiles up
JOIN user_roles ur ON up.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE up.email IN ('admin@admin.com', 'admin2@admin.com')
ORDER BY up.email;

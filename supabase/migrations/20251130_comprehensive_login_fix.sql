-- Migration: Comprehensive Fix for Login Issues
-- 1. Fixes RLS on user_roles to ensure middleware can read roles
-- 2. Re-verifies and repairs admin role assignments

-- PART 1: FIX RLS POLICIES
-- Allow any authenticated user to read user_roles. 
-- This is necessary for the middleware to perform the join query successfully.
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Authenticated users can view user_roles" ON user_roles;

CREATE POLICY "Authenticated users can view user_roles" ON user_roles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Ensure user_profiles is readable by owner
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- PART 2: REPAIR DATA
DO $$
DECLARE
  admin_role_id uuid;
  admin_user_id uuid;
  admin2_user_id uuid;
BEGIN
  -- 1. Get or Create Admin Role
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  IF admin_role_id IS NULL THEN
    INSERT INTO roles (name, display_name, description, color, is_system_role)
    VALUES ('admin', 'Administrator', 'System Administrator', '#ef4444', true)
    RETURNING id INTO admin_role_id;
  END IF;

  -- 2. Repair admin@admin.com
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@admin.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Ensure profile exists
    INSERT INTO user_profiles (id, email, full_name, is_active)
    VALUES (admin_user_id, 'admin@admin.com', 'System Administrator', true)
    ON CONFLICT (id) DO UPDATE SET is_active = true;

    -- Ensure role assignment exists
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  -- 3. Repair admin2@admin.com
  SELECT id INTO admin2_user_id FROM auth.users WHERE email = 'admin2@admin.com';
  
  IF admin2_user_id IS NOT NULL THEN
    -- Ensure profile exists
    INSERT INTO user_profiles (id, email, full_name, is_active)
    VALUES (admin2_user_id, 'admin2@admin.com', 'System Administrator 2', true)
    ON CONFLICT (id) DO UPDATE SET is_active = true;

    -- Ensure role assignment exists
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin2_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

END $$;

-- PART 3: VERIFICATION
-- This query will show us the current state. 
-- If this returns rows, the data is correct and the issue was likely RLS.
SELECT 
  up.email,
  r.name as role_name,
  up.is_active
FROM user_profiles up
JOIN user_roles ur ON up.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE up.email IN ('admin@admin.com', 'admin2@admin.com');

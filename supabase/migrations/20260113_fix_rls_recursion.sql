-- Migration: Fix RLS recursion in user management tables
-- This migration replaces direct table checks in RLS policies with a SECURITY DEFINER function
-- to prevent infinite recursion.

-- 1. Create a helper function to check for admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update user_profiles policies
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;
CREATE POLICY "Admins can view all user profiles" ON user_profiles
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert user profiles" ON user_profiles;
CREATE POLICY "Admins can insert user profiles" ON user_profiles
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update user profiles" ON user_profiles;
CREATE POLICY "Admins can update user profiles" ON user_profiles
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete user profiles" ON user_profiles;
CREATE POLICY "Admins can delete user profiles" ON user_profiles
  FOR DELETE USING (is_admin());

-- 3. Update roles policies
DROP POLICY IF EXISTS "Admins can view roles" ON roles;
CREATE POLICY "Admins can view roles" ON roles
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage roles" ON roles;
CREATE POLICY "Admins can manage roles" ON roles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 4. Update user_roles policies
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 5. Update user_invitations policies
DROP POLICY IF EXISTS "Admins can manage user invitations" ON user_invitations;
CREATE POLICY "Admins can manage user invitations" ON user_invitations
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

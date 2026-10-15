-- Migration: Fix Infinite Recursion in Roles and Permissions
-- The issue: The "Admins can view roles" policy queries the 'roles' table to check for 'admin' role, creating a loop.
-- The fix: Allow all authenticated users to READ roles and permissions.

-- 1. Fix ROLES table policies
DROP POLICY IF EXISTS "Admins can view roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON roles;

-- Non-recursive read policy
drop policy if exists "Authenticated users can view roles" on roles;
CREATE POLICY "Authenticated users can view roles" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Write policies (safe to check admin status now)
drop policy if exists "Admins can insert roles" on roles;
CREATE POLICY "Admins can insert roles" ON roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

drop policy if exists "Admins can update roles" on roles;
CREATE POLICY "Admins can update roles" ON roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

drop policy if exists "Admins can delete roles" on roles;
CREATE POLICY "Admins can delete roles" ON roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- 2. Fix PERMISSIONS table policies
DROP POLICY IF EXISTS "Admins can view permissions" ON permissions;
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON permissions;

-- Non-recursive read policy
drop policy if exists "Authenticated users can view permissions" on permissions;
CREATE POLICY "Authenticated users can view permissions" ON permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Write policies
drop policy if exists "Admins can insert permissions" on permissions;
CREATE POLICY "Admins can insert permissions" ON permissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

drop policy if exists "Admins can update permissions" on permissions;
CREATE POLICY "Admins can update permissions" ON permissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

drop policy if exists "Admins can delete permissions" on permissions;
CREATE POLICY "Admins can delete permissions" ON permissions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

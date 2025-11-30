-- Migration: Fix RLS policies for role_permissions and ensure user_roles access
-- This ensures that authenticated users can read the permissions associated with roles

-- Update role_permissions policies
DROP POLICY IF EXISTS "Admins can manage role permissions" ON role_permissions;

CREATE POLICY "Authenticated users can view role_permissions" ON role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage role_permissions" ON role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Ensure user_roles is readable (existing policy should be fine, but let's be explicit)
-- "Users can view their own roles" is already there. 
-- Let's add a policy for reading ALL user_roles if you are an admin, which is already there too.

-- Let's verify the user_profiles policy again just in case
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Grant usage on schema public to anon and authenticated (standard fix)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

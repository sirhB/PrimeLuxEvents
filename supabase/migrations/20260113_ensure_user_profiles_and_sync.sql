-- Migration: Ensure all auth users have profiles and add sync trigger
-- This ensures that any user created (manually or via signup) gets a profile and can be seen in the team section.

-- 1. Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Sync existing users who might be missing profiles
INSERT INTO public.user_profiles (id, email, full_name, is_active)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email),
  true
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Ensure all admins have the admin role
-- We'll look for users with admin in their email as a heuristic for recovery,
-- but specifically we'll ensure the common ones are set.
DO $$
DECLARE
  admin_role_id uuid;
  user_rec RECORD;
BEGIN
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
  
  IF admin_role_id IS NOT NULL THEN
    -- Assign admin role to any user whose email contains 'admin' and doesn't have it yet
    FOR user_rec IN 
      SELECT id FROM auth.users 
      WHERE email LIKE '%admin%' 
      AND id NOT IN (SELECT user_id FROM public.user_roles WHERE role_id = admin_role_id)
    LOOP
      INSERT INTO public.user_roles (user_id, role_id)
      VALUES (user_rec.id, admin_role_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

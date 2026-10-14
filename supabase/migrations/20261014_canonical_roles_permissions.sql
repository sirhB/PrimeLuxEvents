-- Canonical roles and permissions.
-- Reconciles supabase/user_management_seed.sql and
-- supabase/migrations/20251130_seed_team_data.sql.
-- Grants are additive so existing access is kept. Passwords are never stored here.
-- The initial super admin is created by scripts/bootstrap-super-admin.mjs from env vars.

UPDATE permissions
SET action = 'view'
WHERE action = 'read' AND name LIKE '%.view';

INSERT INTO permissions (name, display_name, description, resource, action) VALUES
  ('portal.access', 'Access Staff portal', 'Open the admin panel', 'portal', 'access'),
  ('appointments.view', 'View Appointments', 'Showroom visits and appointment records', 'appointments', 'view'),
  ('appointments.create', 'Create Appointments', 'Showroom visits and appointment records', 'appointments', 'create'),
  ('appointments.update', 'Update Appointments', 'Showroom visits and appointment records', 'appointments', 'update'),
  ('appointments.delete', 'Delete Appointments', 'Showroom visits and appointment records', 'appointments', 'delete'),
  ('appointments.manage', 'Manage Appointments', 'Showroom visits and appointment records', 'appointments', 'manage'),
  ('portfolio.view', 'View Portfolio', 'Gallery stories and portfolio entries', 'portfolio', 'view'),
  ('portfolio.create', 'Create Portfolio', 'Gallery stories and portfolio entries', 'portfolio', 'create'),
  ('portfolio.update', 'Update Portfolio', 'Gallery stories and portfolio entries', 'portfolio', 'update'),
  ('portfolio.delete', 'Delete Portfolio', 'Gallery stories and portfolio entries', 'portfolio', 'delete'),
  ('portfolio.manage', 'Manage Portfolio', 'Gallery stories and portfolio entries', 'portfolio', 'manage'),
  ('visual_editor.view', 'View Visual editor', 'On-site visual editor', 'visual_editor', 'view'),
  ('visual_editor.update', 'Update Visual editor', 'On-site visual editor', 'visual_editor', 'update'),
  ('visual_editor.manage', 'Manage Visual editor', 'On-site visual editor', 'visual_editor', 'manage'),
  ('discounts.view', 'View Discounts', 'Promo codes and tiered discounts', 'discounts', 'view'),
  ('discounts.create', 'Create Discounts', 'Promo codes and tiered discounts', 'discounts', 'create'),
  ('discounts.update', 'Update Discounts', 'Promo codes and tiered discounts', 'discounts', 'update'),
  ('discounts.delete', 'Delete Discounts', 'Promo codes and tiered discounts', 'discounts', 'delete'),
  ('discounts.manage', 'Manage Discounts', 'Promo codes and tiered discounts', 'discounts', 'manage'),
  ('innovate.view', 'View Innovate', 'Innovate studios', 'innovate', 'view'),
  ('innovate.manage', 'Manage Innovate', 'Innovate studios', 'innovate', 'manage'),
  ('orders.view', 'View Orders', 'Bookings and order changes', 'orders', 'view'),
  ('orders.create', 'Create Orders', 'Bookings and order changes', 'orders', 'create'),
  ('orders.update', 'Update Orders', 'Bookings and order changes', 'orders', 'update'),
  ('orders.delete', 'Delete Orders', 'Bookings and order changes', 'orders', 'delete'),
  ('orders.manage', 'Manage Orders', 'Bookings and order changes', 'orders', 'manage'),
  ('products.view', 'View Products', 'Rental products', 'products', 'view'),
  ('products.create', 'Create Products', 'Rental products', 'products', 'create'),
  ('products.update', 'Update Products', 'Rental products', 'products', 'update'),
  ('products.delete', 'Delete Products', 'Rental products', 'products', 'delete'),
  ('products.manage', 'Manage Products', 'Rental products', 'products', 'manage'),
  ('delivery.view', 'View Delivery', 'Routes and drop-offs', 'delivery', 'view'),
  ('delivery.update', 'Update Delivery', 'Routes and drop-offs', 'delivery', 'update'),
  ('delivery.manage', 'Manage Delivery', 'Routes and drop-offs', 'delivery', 'manage'),
  ('invoices.view', 'View Invoices', 'Invoices and rental agreements', 'invoices', 'view'),
  ('invoices.create', 'Create Invoices', 'Invoices and rental agreements', 'invoices', 'create'),
  ('invoices.update', 'Update Invoices', 'Invoices and rental agreements', 'invoices', 'update'),
  ('invoices.manage', 'Manage Invoices', 'Invoices and rental agreements', 'invoices', 'manage'),
  ('shifts.view', 'View Staff shifts', 'Shift roster', 'shifts', 'view'),
  ('shifts.create', 'Create Staff shifts', 'Shift roster', 'shifts', 'create'),
  ('shifts.update', 'Update Staff shifts', 'Shift roster', 'shifts', 'update'),
  ('shifts.delete', 'Delete Staff shifts', 'Shift roster', 'shifts', 'delete'),
  ('shifts.manage', 'Manage Staff shifts', 'Shift roster', 'shifts', 'manage'),
  ('catalog.view', 'View Catalog', 'Categories, packages, and catalog health', 'catalog', 'view'),
  ('catalog.create', 'Create Catalog', 'Categories, packages, and catalog health', 'catalog', 'create'),
  ('catalog.update', 'Update Catalog', 'Categories, packages, and catalog health', 'catalog', 'update'),
  ('catalog.delete', 'Delete Catalog', 'Categories, packages, and catalog health', 'catalog', 'delete'),
  ('catalog.manage', 'Manage Catalog', 'Categories, packages, and catalog health', 'catalog', 'manage'),
  ('settings.view', 'View Settings', 'Company settings, activity, and API keys', 'settings', 'view'),
  ('settings.update', 'Update Settings', 'Company settings, activity, and API keys', 'settings', 'update'),
  ('settings.manage', 'Manage Settings', 'Company settings, activity, and API keys', 'settings', 'manage'),
  ('events.view', 'View Events', 'Event records', 'events', 'view'),
  ('events.create', 'Create Events', 'Event records', 'events', 'create'),
  ('events.update', 'Update Events', 'Event records', 'events', 'update'),
  ('events.delete', 'Delete Events', 'Event records', 'events', 'delete'),
  ('events.manage', 'Manage Events', 'Event records', 'events', 'manage'),
  ('customers.view', 'View Customers', 'Clients, messages, and partners', 'customers', 'view'),
  ('customers.create', 'Create Customers', 'Clients, messages, and partners', 'customers', 'create'),
  ('customers.update', 'Update Customers', 'Clients, messages, and partners', 'customers', 'update'),
  ('customers.delete', 'Delete Customers', 'Clients, messages, and partners', 'customers', 'delete'),
  ('customers.manage', 'Manage Customers', 'Clients, messages, and partners', 'customers', 'manage'),
  ('consultations.view', 'View Consultations', 'Leads and consultations', 'consultations', 'view'),
  ('consultations.create', 'Create Consultations', 'Leads and consultations', 'consultations', 'create'),
  ('consultations.update', 'Update Consultations', 'Leads and consultations', 'consultations', 'update'),
  ('consultations.delete', 'Delete Consultations', 'Leads and consultations', 'consultations', 'delete'),
  ('consultations.manage', 'Manage Consultations', 'Leads and consultations', 'consultations', 'manage'),
  ('content.view', 'View Content', 'CMS content', 'content', 'view'),
  ('content.create', 'Create Content', 'CMS content', 'content', 'create'),
  ('content.update', 'Update Content', 'CMS content', 'content', 'update'),
  ('content.delete', 'Delete Content', 'CMS content', 'content', 'delete'),
  ('content.manage', 'Manage Content', 'CMS content', 'content', 'manage'),
  ('users.view', 'View Team', 'Members, roles, and invitations', 'users', 'view'),
  ('users.create', 'Create Team', 'Members, roles, and invitations', 'users', 'create'),
  ('users.update', 'Update Team', 'Members, roles, and invitations', 'users', 'update'),
  ('users.delete', 'Delete Team', 'Members, roles, and invitations', 'users', 'delete'),
  ('users.manage', 'Manage Team', 'Members, roles, and invitations', 'users', 'manage'),
  ('reports.view', 'View Reports', 'Analytics and reports', 'reports', 'view'),
  ('reports.create', 'Create Reports', 'Analytics and reports', 'reports', 'create'),
  ('reports.manage', 'Manage Reports', 'Analytics and reports', 'reports', 'manage'),
  ('tasks.view', 'View Tasks', 'Operational tasks', 'tasks', 'view'),
  ('tasks.create', 'Create Tasks', 'Operational tasks', 'tasks', 'create'),
  ('tasks.update', 'Update Tasks', 'Operational tasks', 'tasks', 'update'),
  ('tasks.delete', 'Delete Tasks', 'Operational tasks', 'tasks', 'delete'),
  ('tasks.manage', 'Manage Tasks', 'Operational tasks', 'tasks', 'manage')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

INSERT INTO roles (name, display_name, description, color, is_system_role) VALUES
  ('super_admin', 'Super Admin', 'Always has full access. This role cannot be deleted or locked out.', '#C9A962', true),
  ('admin', 'Administrator', 'Full access through assigned permissions.', '#ef4444', true),
  ('manager', 'Manager', 'Operational management. Cannot delete users or take over settings and role administration.', '#f59e0b', true),
  ('staff', 'Staff', 'Day-to-day operations for orders, catalog, appointments, and delivery.', '#10b981', true),
  ('viewer', 'Viewer', 'Read-only access. Cannot open the staff portal.', '#6b7280', true),
  ('coordinator', 'Event Coordinator', 'Events, consultations, customers, and orders.', '#3b82f6', false),
  ('driver', 'Delivery Driver', 'Assigned tasks and order visibility.', '#10b981', false),
  ('warehouse', 'Warehouse Staff', 'Product and order updates for the warehouse.', '#8b5cf6', false)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  is_system_role = EXCLUDED.is_system_role;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON true
WHERE r.name IN ('admin', 'super_admin')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name NOT IN ('users.delete', 'users.manage', 'settings.manage')
WHERE r.name = 'manager'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('portal.access', 'events.view', 'events.create', 'events.update', 'orders.view', 'orders.create', 'orders.update', 'products.view', 'products.create', 'products.update', 'customers.view', 'customers.create', 'customers.update', 'consultations.view', 'consultations.create', 'consultations.update', 'appointments.view', 'appointments.create', 'appointments.update', 'content.view', 'content.update', 'reports.view', 'portfolio.view', 'portfolio.create', 'portfolio.update', 'visual_editor.view', 'visual_editor.update', 'discounts.view', 'discounts.create', 'discounts.update', 'innovate.view', 'shifts.view', 'shifts.create', 'shifts.update', 'shifts.delete', 'catalog.view', 'catalog.create', 'catalog.update', 'delivery.view', 'delivery.update', 'invoices.view', 'invoices.create', 'invoices.update')
WHERE r.name = 'staff'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('appointments.view', 'orders.view', 'products.view', 'settings.view', 'events.view', 'customers.view', 'consultations.view', 'content.view', 'users.view', 'reports.view')
WHERE r.name = 'viewer'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('orders.view', 'orders.create', 'orders.update', 'events.view', 'events.create', 'events.update', 'customers.view', 'customers.create', 'customers.update', 'consultations.view', 'consultations.create', 'consultations.update')
WHERE r.name = 'coordinator'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('tasks.view', 'tasks.update', 'orders.view')
WHERE r.name = 'driver'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('products.view', 'products.update', 'orders.view', 'orders.update')
WHERE r.name = 'warehouse'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT DISTINCT rp.role_id, dest.id
FROM role_permissions rp
JOIN permissions src ON src.id = rp.permission_id
JOIN permissions dest ON dest.name = CASE src.name
  WHEN 'products.view' THEN 'catalog.view'
  WHEN 'products.create' THEN 'catalog.create'
  WHEN 'products.update' THEN 'catalog.update'
  WHEN 'products.delete' THEN 'catalog.delete'
  WHEN 'products.manage' THEN 'catalog.manage'
  WHEN 'orders.view' THEN 'delivery.view'
  WHEN 'orders.update' THEN 'delivery.update'
  WHEN 'orders.manage' THEN 'delivery.manage'
  WHEN 'content.view' THEN 'portfolio.view'
  WHEN 'content.create' THEN 'portfolio.create'
  WHEN 'content.update' THEN 'portfolio.update'
  WHEN 'content.delete' THEN 'portfolio.delete'
  WHEN 'content.manage' THEN 'portfolio.manage'
  ELSE NULL
END
WHERE dest.id IS NOT NULL
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT DISTINCT rp.role_id, dest.id
FROM role_permissions rp
JOIN permissions src ON src.id = rp.permission_id
JOIN permissions dest ON (
  (src.name = 'orders.view' AND dest.name = 'invoices.view')
  OR (src.name = 'orders.create' AND dest.name = 'invoices.create')
  OR (src.name = 'orders.update' AND dest.name = 'invoices.update')
  OR (src.name = 'orders.manage' AND dest.name = 'invoices.manage')
  OR (src.name = 'content.view' AND dest.name = 'visual_editor.view')
  OR (src.name = 'content.update' AND dest.name = 'visual_editor.update')
  OR (src.name = 'content.manage' AND dest.name = 'visual_editor.manage')
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT ur.user_id, super_role.id
FROM user_roles ur
JOIN roles admin_role ON admin_role.id = ur.role_id AND admin_role.name = 'admin'
JOIN roles super_role ON super_role.name = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN user_profiles.must_change_password IS
  'When true, the user must set a new password before using the app. Cleared only by the server after a password update.';

CREATE OR REPLACE FUNCTION public.has_permission(requested text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN role_permissions rp ON rp.role_id = ur.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = auth.uid()
        AND (
          p.name = requested
          OR p.name = split_part(requested, '.', 1) || '.manage'
        )
    );
$$;

CREATE OR REPLACE FUNCTION public.permission_catalog_ready()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (SELECT 1 FROM permissions WHERE name = 'portal.access');
$$;

REVOKE ALL ON FUNCTION public.has_permission(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.permission_catalog_ready() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_permission(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.permission_catalog_ready() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT
    public.has_permission('users.manage')
    OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    );
$$;

CREATE OR REPLACE FUNCTION public.protect_super_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.name = 'super_admin' THEN
    RAISE EXCEPTION 'The super_admin role cannot be deleted';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.name = 'super_admin' AND NEW.name IS DISTINCT FROM OLD.name THEN
    RAISE EXCEPTION 'The super_admin role cannot be renamed';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.name = 'super_admin' AND NEW.is_system_role IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'The super_admin role must remain a system role';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS protect_super_admin_role ON roles;
CREATE TRIGGER protect_super_admin_role
  BEFORE UPDATE OR DELETE ON roles
  FOR EACH ROW EXECUTE FUNCTION public.protect_super_admin_role();

CREATE OR REPLACE FUNCTION public.protect_last_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
SET row_security = off
AS $$
DECLARE
  super_id uuid;
  remaining integer;
BEGIN
  SELECT id INTO super_id FROM roles WHERE name = 'super_admin';
  IF super_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' AND NEW.role_id = super_id THEN
    IF auth.uid() IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
    ) AND EXISTS (SELECT 1 FROM user_roles WHERE role_id = super_id) THEN
      RAISE EXCEPTION 'Only a super admin can assign the super_admin role';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' AND OLD.role_id = super_id THEN
    SELECT count(*) INTO remaining
    FROM user_roles
    WHERE role_id = super_id AND user_id <> OLD.user_id;
    IF remaining < 1 THEN
      RAISE EXCEPTION 'Cannot remove the last super admin';
    END IF;
    IF auth.uid() IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
    ) THEN
      RAISE EXCEPTION 'Only a super admin can remove the super_admin role';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS protect_last_super_admin ON user_roles;
CREATE TRIGGER protect_last_super_admin
  BEFORE INSERT OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION public.protect_last_super_admin();

CREATE OR REPLACE FUNCTION public.protect_last_super_admin_profile()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
SET row_security = off
AS $$
DECLARE
  remaining integer;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.is_active = false AND OLD.is_active = true THEN
    IF EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = OLD.id AND r.name = 'super_admin'
    ) THEN
      SELECT count(*) INTO remaining
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      JOIN user_profiles up ON up.id = ur.user_id
      WHERE r.name = 'super_admin'
        AND up.is_active = true
        AND up.id <> OLD.id;
      IF remaining < 1 THEN
        RAISE EXCEPTION 'Cannot deactivate the last super admin';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_last_super_admin_profile ON user_profiles;
CREATE TRIGGER protect_last_super_admin_profile
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_last_super_admin_profile();

CREATE OR REPLACE FUNCTION public.protect_must_change_password()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD.must_change_password IS TRUE
     AND NEW.must_change_password IS FALSE
     AND coalesce(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'The password change requirement can only be cleared by the server';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_must_change_password ON user_profiles;
CREATE TRIGGER protect_must_change_password
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_must_change_password();

DROP TRIGGER IF EXISTS audit_roles ON roles;
CREATE TRIGGER audit_roles
  AFTER INSERT OR UPDATE OR DELETE ON roles
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS audit_role_permissions ON role_permissions;
CREATE TRIGGER audit_role_permissions
  AFTER INSERT OR UPDATE OR DELETE ON role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP TRIGGER IF EXISTS audit_user_roles ON user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_log();

DROP POLICY IF EXISTS "Settings viewers can read audit logs" ON audit_logs;
CREATE POLICY "Settings viewers can read audit logs" ON audit_logs
  FOR SELECT USING (public.has_permission('settings.view'));

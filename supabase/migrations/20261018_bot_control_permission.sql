-- Bot control prompts. View and manage stay with super admin, admin, and manager.
-- Staff do not receive these grants. No secrets are stored here.

INSERT INTO permissions (name, display_name, description, resource, action) VALUES
  ('bot.view', 'View Bot control', 'Copy setup prompts for the external operations assistant', 'bot', 'view'),
  ('bot.manage', 'Manage Bot control', 'Copy setup prompts for the external operations assistant', 'bot', 'manage')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.resource = 'bot'
WHERE r.name IN ('super_admin', 'admin', 'manager')
ON CONFLICT (role_id, permission_id) DO NOTHING;

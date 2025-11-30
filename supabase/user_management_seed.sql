-- Seed data for user management system
-- This file contains default roles, permissions, and initial admin setup

-- Insert default permissions
INSERT INTO permissions (name, display_name, description, resource, action) VALUES
-- Events permissions
('events.view', 'View Events', 'Can view event details and lists', 'events', 'read'),
('events.create', 'Create Events', 'Can create new events', 'events', 'create'),
('events.update', 'Update Events', 'Can edit existing events', 'events', 'update'),
('events.delete', 'Delete Events', 'Can delete events', 'events', 'delete'),
('events.manage', 'Manage Events', 'Full control over events', 'events', 'manage'),

-- Orders permissions
('orders.view', 'View Orders', 'Can view order details and lists', 'orders', 'read'),
('orders.create', 'Create Orders', 'Can create new orders', 'orders', 'create'),
('orders.update', 'Update Orders', 'Can edit existing orders', 'orders', 'update'),
('orders.delete', 'Delete Orders', 'Can delete orders', 'orders', 'delete'),
('orders.manage', 'Manage Orders', 'Full control over orders', 'orders', 'manage'),

-- Products permissions
('products.view', 'View Products', 'Can view product details and lists', 'products', 'read'),
('products.create', 'Create Products', 'Can create new products', 'products', 'create'),
('products.update', 'Update Products', 'Can edit existing products', 'products', 'update'),
('products.delete', 'Delete Products', 'Can delete products', 'products', 'delete'),
('products.manage', 'Manage Products', 'Full control over products', 'products', 'manage'),

-- Customers permissions
('customers.view', 'View Customers', 'Can view customer details and lists', 'customers', 'read'),
('customers.create', 'Create Customers', 'Can create new customer records', 'customers', 'create'),
('customers.update', 'Update Customers', 'Can edit customer information', 'customers', 'update'),
('customers.delete', 'Delete Customers', 'Can delete customer records', 'customers', 'delete'),
('customers.manage', 'Manage Customers', 'Full control over customers', 'customers', 'manage'),

-- Consultations permissions
('consultations.view', 'View Consultations', 'Can view consultation details and lists', 'consultations', 'read'),
('consultations.create', 'Create Consultations', 'Can create new consultations', 'consultations', 'create'),
('consultations.update', 'Update Consultations', 'Can edit existing consultations', 'consultations', 'update'),
('consultations.delete', 'Delete Consultations', 'Can delete consultations', 'consultations', 'delete'),
('consultations.manage', 'Manage Consultations', 'Full control over consultations', 'consultations', 'manage'),

-- Appointments permissions
('appointments.view', 'View Appointments', 'Can view appointment details and lists', 'appointments', 'read'),
('appointments.create', 'Create Appointments', 'Can create new appointments', 'appointments', 'create'),
('appointments.update', 'Update Appointments', 'Can edit existing appointments', 'appointments', 'update'),
('appointments.delete', 'Delete Appointments', 'Can delete appointments', 'appointments', 'delete'),
('appointments.manage', 'Manage Appointments', 'Full control over appointments', 'appointments', 'manage'),

-- Content/CMS permissions
('content.view', 'View Content', 'Can view CMS content', 'content', 'read'),
('content.create', 'Create Content', 'Can create new content', 'content', 'create'),
('content.update', 'Update Content', 'Can edit existing content', 'content', 'update'),
('content.delete', 'Delete Content', 'Can delete content', 'content', 'delete'),
('content.manage', 'Manage Content', 'Full control over content', 'content', 'manage'),

-- Settings permissions
('settings.view', 'View Settings', 'Can view system settings', 'settings', 'read'),
('settings.update', 'Update Settings', 'Can modify system settings', 'settings', 'update'),
('settings.manage', 'Manage Settings', 'Full control over settings', 'settings', 'manage'),

-- User management permissions
('users.view', 'View Users', 'Can view team member details and lists', 'users', 'read'),
('users.create', 'Create Users', 'Can invite new team members', 'users', 'create'),
('users.update', 'Update Users', 'Can edit team member information', 'users', 'update'),
('users.delete', 'Delete Users', 'Can remove team members', 'users', 'delete'),
('users.manage', 'Manage Users', 'Full control over user management', 'users', 'manage'),

-- Reports/Analytics permissions
('reports.view', 'View Reports', 'Can view reports and analytics', 'reports', 'read'),
('reports.create', 'Create Reports', 'Can generate custom reports', 'reports', 'create'),
('reports.manage', 'Manage Reports', 'Full control over reports', 'reports', 'manage')
ON CONFLICT (name) DO NOTHING;

-- Insert default roles
INSERT INTO roles (name, display_name, description, color, is_system_role) VALUES
('admin', 'Administrator', 'Full system access with all permissions', '#ef4444', true),
('manager', 'Manager', 'Management level access to most features', '#f59e0b', true),
('staff', 'Staff', 'Standard staff access to operational features', '#10b981', true),
('viewer', 'Viewer', 'Read-only access to most features', '#6b7280', true)
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles

-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager permissions (most features except user management)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'manager'
  AND p.name NOT IN ('users.manage', 'users.delete', 'settings.manage')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Staff permissions (operational features)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'staff'
  AND p.name IN (
    'events.view', 'events.create', 'events.update',
    'orders.view', 'orders.create', 'orders.update',
    'products.view', 'products.create', 'products.update',
    'customers.view', 'customers.create', 'customers.update',
    'consultations.view', 'consultations.create', 'consultations.update',
    'appointments.view', 'appointments.create', 'appointments.update',
    'content.view', 'content.update',
    'reports.view'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Viewer permissions (read-only)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'viewer'
  AND p.action = 'read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Note: Initial admin user setup will be done separately after account creation
-- The first user to sign up can be manually assigned the admin role

-- Migration: Seed team member data with roles and permissions
-- This creates sample team members with different roles for testing

DO $$
DECLARE
  -- Role IDs
  admin_role_id uuid;
  manager_role_id uuid;
  coordinator_role_id uuid;
  driver_role_id uuid;
  warehouse_role_id uuid;
  
  -- User IDs (we'll create fake profiles for demo)
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user3_id uuid := gen_random_uuid();
  user4_id uuid := gen_random_uuid();
  user5_id uuid := gen_random_uuid();
  user6_id uuid := gen_random_uuid();
  
BEGIN
  
  -- Create additional roles if they don't exist
  INSERT INTO roles (name, display_name, description, color, is_system_role)
  VALUES 
    ('admin', 'Administrator', 'Full system access with all permissions', '#ef4444', true),
    ('manager', 'Manager', 'Can manage events, orders, and team members', '#f59e0b', false),
    ('coordinator', 'Event Coordinator', 'Can create and manage events and consultations', '#3b82f6', false),
    ('driver', 'Delivery Driver', 'Can view and update delivery tasks', '#10b981', false),
    ('warehouse', 'Warehouse Staff', 'Can manage inventory and prepare orders', '#8b5cf6', false)
  ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    color = EXCLUDED.color;
  
  -- Get role IDs
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  SELECT id INTO manager_role_id FROM roles WHERE name = 'manager';
  SELECT id INTO coordinator_role_id FROM roles WHERE name = 'coordinator';
  SELECT id INTO driver_role_id FROM roles WHERE name = 'driver';
  SELECT id INTO warehouse_role_id FROM roles WHERE name = 'warehouse';
  
  -- Create sample user profiles (these won't have auth.users entries, just for display)
  INSERT INTO user_profiles (id, email, full_name, phone, job_title, department, hire_date, is_active)
  VALUES 
    (user1_id, 'sarah.johnson@primelux.com', 'Sarah Johnson', '+1 (555) 234-5678', 'Operations Manager', 'Operations', '2023-01-15', true),
    (user2_id, 'michael.chen@primelux.com', 'Michael Chen', '+1 (555) 345-6789', 'Senior Event Coordinator', 'Events', '2023-03-20', true),
    (user3_id, 'emily.rodriguez@primelux.com', 'Emily Rodriguez', '+1 (555) 456-7890', 'Event Coordinator', 'Events', '2023-06-10', true),
    (user4_id, 'james.wilson@primelux.com', 'James Wilson', '+1 (555) 567-8901', 'Lead Delivery Driver', 'Logistics', '2022-11-05', true),
    (user5_id, 'lisa.martinez@primelux.com', 'Lisa Martinez', '+1 (555) 678-9012', 'Warehouse Supervisor', 'Warehouse', '2023-02-28', true),
    (user6_id, 'david.thompson@primelux.com', 'David Thompson', '+1 (555) 789-0123', 'Delivery Driver', 'Logistics', '2023-08-15', false)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    job_title = EXCLUDED.job_title,
    department = EXCLUDED.department,
    hire_date = EXCLUDED.hire_date,
    is_active = EXCLUDED.is_active;
  
  -- Assign roles to users
  -- Sarah Johnson - Manager
  INSERT INTO user_roles (user_id, role_id)
  VALUES (user1_id, manager_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  -- Michael Chen - Senior Event Coordinator
  INSERT INTO user_roles (user_id, role_id)
  VALUES (user2_id, coordinator_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  -- Emily Rodriguez - Event Coordinator
  INSERT INTO user_roles (user_id, role_id)
  VALUES (user3_id, coordinator_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  -- James Wilson - Lead Delivery Driver (has both driver and warehouse access)
  INSERT INTO user_roles (user_id, role_id)
  VALUES 
    (user4_id, driver_role_id),
    (user4_id, warehouse_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  -- Lisa Martinez - Warehouse Supervisor
  INSERT INTO user_roles (user_id, role_id)
  VALUES (user5_id, warehouse_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  -- David Thompson - Delivery Driver (inactive)
  INSERT INTO user_roles (user_id, role_id)
  VALUES (user6_id, driver_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  -- Create comprehensive permissions if they don't exist
  INSERT INTO permissions (name, display_name, description, resource, action)
  VALUES
    -- Events permissions
    ('events.view', 'View Events', 'Can view event details', 'events', 'view'),
    ('events.create', 'Create Events', 'Can create new events', 'events', 'create'),
    ('events.update', 'Update Events', 'Can update event details', 'events', 'update'),
    ('events.delete', 'Delete Events', 'Can delete events', 'events', 'delete'),
    ('events.manage', 'Manage Events', 'Full event management access', 'events', 'manage'),
    
    -- Orders permissions
    ('orders.view', 'View Orders', 'Can view order details', 'orders', 'view'),
    ('orders.create', 'Create Orders', 'Can create new orders', 'orders', 'create'),
    ('orders.update', 'Update Orders', 'Can update order details', 'orders', 'update'),
    ('orders.delete', 'Delete Orders', 'Can delete orders', 'orders', 'delete'),
    ('orders.manage', 'Manage Orders', 'Full order management access', 'orders', 'manage'),
    
    -- Products permissions
    ('products.view', 'View Products', 'Can view product catalog', 'products', 'view'),
    ('products.create', 'Create Products', 'Can add new products', 'products', 'create'),
    ('products.update', 'Update Products', 'Can update product details', 'products', 'update'),
    ('products.delete', 'Delete Products', 'Can delete products', 'products', 'delete'),
    ('products.manage', 'Manage Products', 'Full product management access', 'products', 'manage'),
    
    -- Customers permissions
    ('customers.view', 'View Customers', 'Can view customer information', 'customers', 'view'),
    ('customers.create', 'Create Customers', 'Can add new customers', 'customers', 'create'),
    ('customers.update', 'Update Customers', 'Can update customer details', 'customers', 'update'),
    ('customers.delete', 'Delete Customers', 'Can delete customers', 'customers', 'delete'),
    ('customers.manage', 'Manage Customers', 'Full customer management access', 'customers', 'manage'),
    
    -- Consultations permissions
    ('consultations.view', 'View Consultations', 'Can view consultations', 'consultations', 'view'),
    ('consultations.create', 'Create Consultations', 'Can create consultations', 'consultations', 'create'),
    ('consultations.update', 'Update Consultations', 'Can update consultations', 'consultations', 'update'),
    ('consultations.delete', 'Delete Consultations', 'Can delete consultations', 'consultations', 'delete'),
    ('consultations.manage', 'Manage Consultations', 'Full consultation management', 'consultations', 'manage'),
    
    -- Tasks permissions
    ('tasks.view', 'View Tasks', 'Can view tasks', 'tasks', 'view'),
    ('tasks.create', 'Create Tasks', 'Can create tasks', 'tasks', 'create'),
    ('tasks.update', 'Update Tasks', 'Can update tasks', 'tasks', 'update'),
    ('tasks.delete', 'Delete Tasks', 'Can delete tasks', 'tasks', 'delete'),
    ('tasks.manage', 'Manage Tasks', 'Full task management', 'tasks', 'manage'),
    
    -- Users permissions
    ('users.view', 'View Users', 'Can view user profiles', 'users', 'view'),
    ('users.create', 'Create Users', 'Can invite new users', 'users', 'create'),
    ('users.update', 'Update Users', 'Can update user profiles', 'users', 'update'),
    ('users.delete', 'Delete Users', 'Can deactivate users', 'users', 'delete'),
    ('users.manage', 'Manage Users', 'Full user management access', 'users', 'manage'),
    
    -- Reports permissions
    ('reports.view', 'View Reports', 'Can view reports', 'reports', 'view'),
    ('reports.create', 'Create Reports', 'Can create custom reports', 'reports', 'create'),
    ('reports.manage', 'Manage Reports', 'Full report management', 'reports', 'manage'),
    
    -- Settings permissions
    ('settings.view', 'View Settings', 'Can view system settings', 'settings', 'view'),
    ('settings.update', 'Update Settings', 'Can update settings', 'settings', 'update'),
    ('settings.manage', 'Manage Settings', 'Full settings access', 'settings', 'manage')
  ON CONFLICT (name) DO NOTHING;
  
  -- Assign permissions to roles
  -- Admin gets all permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT admin_role_id, id FROM permissions
  ON CONFLICT (role_id, permission_id) DO NOTHING;
  
  -- Manager gets most permissions except user management
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT manager_role_id, id FROM permissions 
  WHERE resource IN ('events', 'orders', 'products', 'customers', 'consultations', 'tasks', 'reports')
  ON CONFLICT (role_id, permission_id) DO NOTHING;
  
  -- Coordinator gets event, consultation, and customer permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT coordinator_role_id, id FROM permissions 
  WHERE resource IN ('events', 'consultations', 'customers', 'orders')
    AND action IN ('view', 'create', 'update')
  ON CONFLICT (role_id, permission_id) DO NOTHING;
  
  -- Driver gets task and order view permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT driver_role_id, id FROM permissions 
  WHERE (resource = 'tasks' AND action IN ('view', 'update'))
     OR (resource = 'orders' AND action = 'view')
  ON CONFLICT (role_id, permission_id) DO NOTHING;
  
  -- Warehouse gets product and order permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT warehouse_role_id, id FROM permissions 
  WHERE resource IN ('products', 'orders')
    AND action IN ('view', 'update')
  ON CONFLICT (role_id, permission_id) DO NOTHING;
  
  RAISE NOTICE 'Team member seed data created successfully';
  
END $$;

-- Display summary
SELECT 
  'Roles Created' as summary_type,
  COUNT(*) as count
FROM roles
UNION ALL
SELECT 
  'Permissions Created',
  COUNT(*)
FROM permissions
UNION ALL
SELECT 
  'Team Members Created',
  COUNT(*)
FROM user_profiles
WHERE email LIKE '%@primelux.com'
UNION ALL
SELECT 
  'Role Assignments',
  COUNT(*)
FROM user_roles;

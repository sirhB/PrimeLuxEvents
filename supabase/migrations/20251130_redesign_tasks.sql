-- Migration: Redesign tasks table to be standalone and support delivery planning

-- 1. Create new tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  task_type text DEFAULT 'general' CHECK (task_type IN ('general', 'event', 'delivery', 'warehouse', 'office', 'venue', 'return_trip')),
  
  -- Associations
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES user_profiles(id),
  assigned_to_text text, -- Legacy or external assignment
  created_by uuid REFERENCES user_profiles(id),
  created_by_text text, -- Legacy creator
  
  -- Scheduling
  due_date date,
  due_time time,
  
  -- Completion
  completed_at timestamp with time zone,
  completed_by uuid REFERENCES user_profiles(id),
  completion_image_url text,
  completion_notes text,
  
  -- Delivery specific
  route_order integer,
  delivery_items jsonb DEFAULT '[]'::jsonb,
  
  -- Metadata
  meta_data jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Migrate data from event_tasks
INSERT INTO tasks (
  id, event_id, title, description, status, priority, assigned_to_text, due_date, completed_at, created_by_text, created_at, updated_at, task_type
)
SELECT 
  id, event_id, title, description, status, priority, assigned_to, due_date, completed_at, created_by, created_at, updated_at, 'event'
FROM event_tasks;

-- 3. Drop old table
DROP TABLE event_tasks;

-- 4. Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Allow authenticated users to view all tasks for now (simplifies transition)
CREATE POLICY "Authenticated users can view all tasks" ON tasks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert tasks
CREATE POLICY "Authenticated users can insert tasks" ON tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update tasks
CREATE POLICY "Authenticated users can update tasks" ON tasks
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete tasks
CREATE POLICY "Authenticated users can delete tasks" ON tasks
  FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_order_id ON tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(task_type);

-- Add comments
COMMENT ON TABLE tasks IS 'Comprehensive tasks table for events, deliveries, and general work';

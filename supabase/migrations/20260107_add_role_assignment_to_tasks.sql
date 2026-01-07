-- Migration: Add assigned_role_id to tasks table
-- This allows tasks to be assigned to an entire role instead of a specific user

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_role_id uuid REFERENCES roles(id) ON DELETE SET NULL;

-- Add a comment
COMMENT ON COLUMN tasks.assigned_role_id IS 'ID of the role this task is assigned to (for group tasks)';

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_role_id ON tasks(assigned_role_id);

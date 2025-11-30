-- Migration: Create event_tasks table
-- This table stores tasks/checklist items associated with events

CREATE TABLE IF NOT EXISTS event_tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to text, -- Can be a user name or role
  due_date date,
  completed_at timestamp with time zone,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE event_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all event tasks."
  ON event_tasks FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert event tasks."
  ON event_tasks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update event tasks."
  ON event_tasks FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete event tasks."
  ON event_tasks FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_tasks_event_id ON event_tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tasks_status ON event_tasks(status);
CREATE INDEX IF NOT EXISTS idx_event_tasks_priority ON event_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_event_tasks_due_date ON event_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_event_tasks_created_at ON event_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_tasks_assigned_to ON event_tasks(assigned_to);

-- Add comment
COMMENT ON TABLE event_tasks IS 'Stores tasks and checklist items associated with specific events';

-- Seed some sample tasks for existing events
INSERT INTO event_tasks (event_id, title, description, status, priority, assigned_to, due_date, created_by) VALUES
-- Tasks for Emma & Liam's Wedding (EVT-001)
((SELECT id FROM events WHERE event_id = 'EVT-001'), 'Venue walkthrough and final confirmation', 'Conduct final walkthrough of Seaside Cliffs Resort and confirm all arrangements', 'completed', 'high', 'Maya Brooks', '2025-07-15', 'admin'),
((SELECT id FROM events WHERE event_id = 'EVT-001'), 'Catering menu tasting', 'Schedule and conduct menu tasting with caterer', 'completed', 'high', 'Maya Brooks', '2025-07-20', 'admin'),
((SELECT id FROM events WHERE event_id = 'EVT-001'), 'Floral arrangements design', 'Finalize floral designs and arrangements with florist', 'in_progress', 'medium', 'Maya Brooks', '2025-08-10', 'admin'),
((SELECT id FROM events WHERE event_id = 'EVT-001'), 'Photography contract review', 'Review and finalize photography contract', 'pending', 'medium', 'Maya Brooks', '2025-08-05', 'admin'),
((SELECT id FROM events WHERE event_id = 'EVT-001'), 'Guest list finalization', 'Confirm final headcount and seating arrangements', 'pending', 'high', 'Maya Brooks', '2025-08-15', 'admin'),

-- Tasks for TechStart Annual Gala (EVT-002)
((SELECT id FROM events WHERE event_id = 'EVT-002'), 'AV equipment setup coordination', 'Coordinate with AV company for presentation equipment setup', 'pending', 'high', 'David Chen', '2025-08-20', 'admin'),
((SELECT id FROM events WHERE event_id = 'EVT-002'), 'Speaker lineup confirmation', 'Confirm all keynote speakers and their requirements', 'in_progress', 'high', 'David Chen', '2025-08-25', 'admin'),
((SELECT id FROM events WHERE event_id = 'EVT-002'), 'Silent auction items collection', 'Collect and organize all silent auction items', 'pending', 'medium', 'David Chen', '2025-09-10', 'admin'),

-- Tasks for Sarah''s 30th Birthday (EVT-003)
((SELECT id FROM events WHERE event_id = 'EVT-003'), 'Cake design approval', 'Finalize cake design with bakery', 'completed', 'medium', 'Sarah Jones', '2025-06-20', 'admin'),
((SELECT id FROM events WHERE event_id = 'EVT-003'), 'Party favors assembly', 'Purchase and assemble party favors', 'completed', 'low', 'Sarah Jones', '2025-06-25', 'admin'),
((SELECT id FROM events WHERE event_id = 'EVT-003'), 'Music playlist creation', 'Create and organize music playlist', 'completed', 'low', 'Sarah Jones', '2025-06-28', 'admin')
ON CONFLICT DO NOTHING;

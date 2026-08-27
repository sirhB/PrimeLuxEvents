-- Warehouse operations: extend tasks, templates, staff shifts, notifications

-- Extend tasks table for warehouse scheduling
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS warehouse_category text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scheduled_start time;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_minutes integer;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS checklist jsonb DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id uuid REFERENCES tasks(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_rule text;

-- warehouse_category: pick | pack | put_away | vehicle_load | inventory_maintenance
-- | returns_checkin | location_audit | general

CREATE INDEX IF NOT EXISTS idx_tasks_due_date_warehouse_category ON tasks(due_date, warehouse_category);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_due_date ON tasks(assigned_to, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_role_due_date ON tasks(assigned_role_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);

COMMENT ON COLUMN tasks.warehouse_category IS 'Warehouse task subtype for schedule filtering';
COMMENT ON COLUMN tasks.checklist IS 'JSON array of checklist items with completion state';

-- Recurring warehouse task templates
CREATE TABLE IF NOT EXISTS warehouse_task_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    warehouse_category text NOT NULL,
    description text,
    assigned_role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
    recurrence_rule text NOT NULL,
    checklist jsonb DEFAULT '[]'::jsonb,
    estimated_minutes integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE warehouse_task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view warehouse task templates"
    ON warehouse_task_templates FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage warehouse task templates"
    ON warehouse_task_templates FOR ALL
    USING (auth.role() = 'authenticated');

-- Staff shift scheduling (optional Phase 2)
CREATE TABLE IF NOT EXISTS staff_shifts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    shift_date date NOT NULL,
    start_time time,
    end_time time,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, shift_date)
);

ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view staff shifts"
    ON staff_shifts FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage staff shifts"
    ON staff_shifts FOR ALL
    USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_staff_shifts_shift_date ON staff_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_user_id ON staff_shifts(user_id);

-- Update task assignment notifications to link to warehouse schedule when applicable
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
    task_link text;
BEGIN
    IF NEW.task_type = 'warehouse' OR NEW.warehouse_category IS NOT NULL THEN
        task_link := '/admin/warehouse/schedule';
        IF NEW.due_date IS NOT NULL THEN
            task_link := task_link || '?date=' || NEW.due_date::text;
        END IF;
    ELSE
        task_link := '/admin/tasks';
    END IF;

    IF (TG_OP = 'INSERT' AND NEW.assigned_to IS NOT NULL) OR
       (TG_OP = 'UPDATE' AND NEW.assigned_to IS DISTINCT FROM OLD.assigned_to AND NEW.assigned_to IS NOT NULL) THEN
        INSERT INTO admin_notifications (type, title, message, link)
        VALUES (
            'task_assigned',
            'New Task Assigned',
            'You have been assigned the task: ' || NEW.title,
            task_link
        );
    END IF;

    IF (TG_OP = 'INSERT' AND NEW.assigned_role_id IS NOT NULL) OR
       (TG_OP = 'UPDATE' AND NEW.assigned_role_id IS DISTINCT FROM OLD.assigned_role_id AND NEW.assigned_role_id IS NOT NULL) THEN
        INSERT INTO admin_notifications (type, title, message, link)
        VALUES (
            'role_task_assigned',
            'Team Task Assigned',
            'A new task has been assigned to your role: ' || NEW.title,
            task_link
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notify when warehouse task is due today (on insert)
CREATE OR REPLACE FUNCTION notify_warehouse_task_due()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.task_type = 'warehouse' OR NEW.warehouse_category IS NOT NULL)
       AND NEW.due_date = CURRENT_DATE
       AND NEW.status IN ('pending', 'in_progress') THEN
        INSERT INTO admin_notifications (type, title, message, link)
        VALUES (
            'warehouse_task_due',
            'Warehouse Task Due Today',
            NEW.title || ' is due today.',
            '/admin/warehouse/schedule?date=' || NEW.due_date::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_warehouse_task_due ON tasks;
CREATE TRIGGER on_warehouse_task_due
    AFTER INSERT ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION notify_warehouse_task_due();

-- Low-stock maintenance task (dedupe open tasks per product)
CREATE OR REPLACE FUNCTION create_low_stock_maintenance_task()
RETURNS TRIGGER AS $$
DECLARE
    warehouse_role_id uuid;
    existing_task_id uuid;
BEGIN
    IF NEW.quantity_available IS NULL OR NEW.quantity_available >= 3 THEN
        RETURN NEW;
    END IF;

    SELECT id INTO existing_task_id
    FROM tasks
    WHERE warehouse_category = 'inventory_maintenance'
      AND status IN ('pending', 'in_progress')
      AND meta_data->>'product_id' = NEW.id::text
    LIMIT 1;

    IF existing_task_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    SELECT id INTO warehouse_role_id FROM roles WHERE name = 'warehouse' LIMIT 1;

    INSERT INTO tasks (
        title,
        description,
        status,
        priority,
        task_type,
        warehouse_category,
        assigned_role_id,
        due_date,
        meta_data
    ) VALUES (
        'Restock: ' || COALESCE(NEW.name, 'Product'),
        'Low stock alert — quantity available is ' || NEW.quantity_available,
        'pending',
        'high',
        'warehouse',
        'inventory_maintenance',
        warehouse_role_id,
        CURRENT_DATE,
        jsonb_build_object('product_id', NEW.id)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_low_stock_maintenance ON products;
CREATE TRIGGER on_low_stock_maintenance
    AFTER UPDATE OF quantity_available ON products
    FOR EACH ROW
    WHEN (OLD.quantity_available IS DISTINCT FROM NEW.quantity_available)
    EXECUTE FUNCTION create_low_stock_maintenance_task();

-- Warehouse operations: extend tasks, templates, staff shifts, notifications
-- Idempotent: creates tasks table when missing (e.g. SQL editor run without full migration history)

-- ---------------------------------------------------------------------------
-- Bootstrap: tasks table (required by warehouse schedule features)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    task_type text DEFAULT 'general' CHECK (task_type IN ('general', 'event', 'delivery', 'warehouse', 'office', 'venue', 'return_trip')),
    event_id uuid,
    order_id uuid,
    assigned_to uuid,
    assigned_to_text text,
    assigned_role_id uuid,
    created_by uuid,
    created_by_text text,
    due_date date,
    due_time time,
    scheduled_start time,
    estimated_minutes integer,
    completed_at timestamp with time zone,
    completed_by uuid,
    completion_image_url text,
    completion_notes text,
    route_order integer,
    delivery_items jsonb DEFAULT '[]'::jsonb,
    meta_data jsonb DEFAULT '{}'::jsonb,
    checklist jsonb DEFAULT '[]'::jsonb,
    warehouse_category text,
    parent_task_id uuid,
    is_recurring boolean DEFAULT false,
    recurrence_rule text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add optional FKs when parent tables exist (safe for partial databases)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_order_id_fkey') THEN
        ALTER TABLE public.tasks
            ADD CONSTRAINT tasks_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_assigned_to_fkey') THEN
        ALTER TABLE public.tasks
            ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.user_profiles(id) ON DELETE SET NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_created_by_fkey') THEN
        ALTER TABLE public.tasks
            ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_completed_by_fkey') THEN
        ALTER TABLE public.tasks
            ADD CONSTRAINT tasks_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_assigned_role_id_fkey') THEN
        ALTER TABLE public.tasks
            ADD CONSTRAINT tasks_assigned_role_id_fkey FOREIGN KEY (assigned_role_id) REFERENCES public.roles(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_parent_task_id_fkey') THEN
        ALTER TABLE public.tasks
            ADD CONSTRAINT tasks_parent_task_id_fkey FOREIGN KEY (parent_task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Authenticated users can view all tasks') THEN
        CREATE POLICY "Authenticated users can view all tasks" ON public.tasks
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Authenticated users can insert tasks') THEN
        CREATE POLICY "Authenticated users can insert tasks" ON public.tasks
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Authenticated users can update tasks') THEN
        CREATE POLICY "Authenticated users can update tasks" ON public.tasks
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Authenticated users can delete tasks') THEN
        CREATE POLICY "Authenticated users can delete tasks" ON public.tasks
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tasks_order_id ON public.tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON public.tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_role_id ON public.tasks(assigned_role_id);

-- Extend tasks table for warehouse scheduling (no-op when columns already exist from bootstrap)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS warehouse_category text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS scheduled_start time;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS estimated_minutes integer;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS checklist jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_task_id uuid;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recurrence_rule text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_role_id uuid;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS delivery_items jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS meta_data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS route_order integer;

-- warehouse_category: pick | pack | put_away | vehicle_load | inventory_maintenance
-- | returns_checkin | location_audit | general

CREATE INDEX IF NOT EXISTS idx_tasks_due_date_warehouse_category ON public.tasks(due_date, warehouse_category);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_due_date ON public.tasks(assigned_to, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_role_due_date ON public.tasks(assigned_role_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON public.tasks(parent_task_id);

COMMENT ON TABLE public.tasks IS 'Comprehensive tasks table for deliveries, warehouse work, and general ops';
COMMENT ON COLUMN public.tasks.warehouse_category IS 'Warehouse task subtype for schedule filtering';
COMMENT ON COLUMN public.tasks.checklist IS 'JSON array of checklist items with completion state';

-- Ensure admin_notifications exists for triggers below
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL,
    title text NOT NULL,
    message text,
    link text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_notifications' AND policyname = 'Admins can view notifications') THEN
        CREATE POLICY "Admins can view notifications" ON public.admin_notifications
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Recurring warehouse task templates
CREATE TABLE IF NOT EXISTS public.warehouse_task_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    warehouse_category text NOT NULL,
    description text,
    assigned_role_id uuid,
    recurrence_rule text NOT NULL,
    checklist jsonb DEFAULT '[]'::jsonb,
    estimated_minutes integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_task_templates_assigned_role_id_fkey') THEN
        ALTER TABLE public.warehouse_task_templates
            ADD CONSTRAINT warehouse_task_templates_assigned_role_id_fkey
            FOREIGN KEY (assigned_role_id) REFERENCES public.roles(id) ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE public.warehouse_task_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_task_templates' AND policyname = 'Authenticated users can view warehouse task templates') THEN
        CREATE POLICY "Authenticated users can view warehouse task templates"
            ON public.warehouse_task_templates FOR SELECT
            USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_task_templates' AND policyname = 'Authenticated users can manage warehouse task templates') THEN
        CREATE POLICY "Authenticated users can manage warehouse task templates"
            ON public.warehouse_task_templates FOR ALL
            USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Staff shift scheduling
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    shift_date date NOT NULL,
    start_time time,
    end_time time,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, shift_date)
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_shifts_user_id_fkey') THEN
        ALTER TABLE public.staff_shifts
            ADD CONSTRAINT staff_shifts_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_shifts' AND policyname = 'Authenticated users can view staff shifts') THEN
        CREATE POLICY "Authenticated users can view staff shifts"
            ON public.staff_shifts FOR SELECT
            USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_shifts' AND policyname = 'Authenticated users can manage staff shifts') THEN
        CREATE POLICY "Authenticated users can manage staff shifts"
            ON public.staff_shifts FOR ALL
            USING (auth.role() = 'authenticated');
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_staff_shifts_shift_date ON public.staff_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_user_id ON public.staff_shifts(user_id);

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

DROP TRIGGER IF EXISTS on_task_assigned ON public.tasks;
CREATE TRIGGER on_task_assigned
    AFTER INSERT OR UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_assignment();

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

DROP TRIGGER IF EXISTS on_warehouse_task_due ON public.tasks;
CREATE TRIGGER on_warehouse_task_due
    AFTER INSERT ON public.tasks
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

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        DROP TRIGGER IF EXISTS on_low_stock_maintenance ON public.products;
        CREATE TRIGGER on_low_stock_maintenance
            AFTER UPDATE OF quantity_available ON public.products
            FOR EACH ROW
            WHEN (OLD.quantity_available IS DISTINCT FROM NEW.quantity_available)
            EXECUTE FUNCTION create_low_stock_maintenance_task();
    END IF;
END $$;

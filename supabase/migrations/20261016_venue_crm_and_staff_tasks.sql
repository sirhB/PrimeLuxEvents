-- Full venue CRM and the staff tasks that hang off it.
-- Public inquiries still arrive through the service role. Staff access follows catalog permissions.

CREATE OR REPLACE FUNCTION public.has_named_permission(target text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  IF to_regclass('public.user_roles') IS NULL OR to_regclass('public.roles') IS NULL THEN
    RETURN false;
  END IF;
  IF EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
  ) THEN
    RETURN true;
  END IF;
  IF to_regclass('public.role_permissions') IS NULL OR to_regclass('public.permissions') IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = auth.uid()
      AND (p.name = target OR p.name = split_part(target, '.', 1) || '.manage')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_venue_crm()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_named_permission('crm.view') OR public.has_named_permission('venues.view') THEN
    RETURN true;
  END IF;
  IF to_regclass('public.user_roles') IS NULL OR to_regclass('public.roles') IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin', 'manager', 'staff', 'coordinator')
  );
END;
$$;

CREATE TABLE IF NOT EXISTS public.crm_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  website text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  title text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL;
ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL;
ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS owner_name text;
ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS value_cents integer DEFAULT 0 NOT NULL;
ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS event_type text;

UPDATE public.venue_leads SET stage = 'inquiry' WHERE stage IN ('new', 'contacted');

CREATE TABLE IF NOT EXISTS public.crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.venue_leads(id) ON DELETE CASCADE NOT NULL,
  kind text NOT NULL,
  body text NOT NULL,
  author_name text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.venue_leads(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  status text DEFAULT 'draft' NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_proposal_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES public.crm_proposals(id) ON DELETE CASCADE NOT NULL,
  kind text NOT NULL,
  name text NOT NULL,
  quantity integer DEFAULT 1 NOT NULL,
  unit_cents integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.venue_leads(id) ON DELETE CASCADE NOT NULL,
  proposal_id uuid REFERENCES public.crm_proposals(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' NOT NULL,
  signed_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.venue_leads(id) ON DELETE CASCADE NOT NULL,
  kind text NOT NULL,
  status text DEFAULT 'due' NOT NULL,
  amount_cents integer DEFAULT 0 NOT NULL,
  due_on date,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.venue_leads(id) ON DELETE CASCADE NOT NULL,
  due_on date NOT NULL,
  body text NOT NULL,
  done boolean DEFAULT false NOT NULL,
  owner_name text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_saved_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stage text,
  source text,
  owner_name text,
  query text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger_stage text NOT NULL,
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.task_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.task_templates(id) ON DELETE CASCADE NOT NULL,
  item_key text NOT NULL,
  title text NOT NULL,
  offset_days integer DEFAULT 0 NOT NULL,
  priority text DEFAULT 'medium' NOT NULL,
  checklist text[] DEFAULT '{}',
  UNIQUE (template_id, item_key)
);

CREATE TABLE IF NOT EXISTS public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  body text NOT NULL,
  author_name text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.staff_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  recipient_name text,
  kind text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  href text,
  read_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS lead_id uuid;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS booking_id uuid;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS checklist jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS template_key text;

DO $$
BEGIN
  IF to_regclass('public.tasks') IS NOT NULL AND to_regclass('public.venue_leads') IS NOT NULL THEN
    BEGIN
      ALTER TABLE public.tasks
        ADD CONSTRAINT tasks_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.venue_leads(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
  IF to_regclass('public.tasks') IS NOT NULL AND to_regclass('public.venue_bookings') IS NOT NULL THEN
    BEGIN
      ALTER TABLE public.tasks
        ADD CONSTRAINT tasks_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.venue_bookings(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
  IF to_regclass('public.task_comments') IS NOT NULL AND to_regclass('public.tasks') IS NOT NULL THEN
    BEGIN
      ALTER TABLE public.task_comments
        ADD CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.venue_hold_conflicts(
  p_venue_id uuid,
  p_starts date,
  p_ends date,
  p_exclude uuid DEFAULT NULL
)
RETURNS TABLE (id uuid, lead_id uuid, starts_on date, ends_on date, status text)
LANGUAGE sql
STABLE
AS $$
  SELECT b.id, b.lead_id, b.starts_on, b.ends_on, b.status
  FROM public.venue_bookings b
  WHERE b.venue_id = p_venue_id
    AND b.status NOT IN ('released', 'cancelled')
    AND (p_exclude IS NULL OR b.id <> p_exclude)
    AND b.starts_on <= p_ends
    AND p_starts <= b.ends_on;
$$;

INSERT INTO public.task_templates (id, name, trigger_stage, active) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Tour booked', 'tour', true),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Booking confirmed', 'booked', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.task_template_items (template_id, item_key, title, offset_days, priority, checklist) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'tour-confirm', 'Confirm the tour time', 0, 'high', ARRAY['Call the contact','Send the address']),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'tour-prep', 'Prep the room', -1, 'medium', ARRAY['Lights','Chairs for the walk-through']),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'tour-directions', 'Send directions and parking', -1, 'low', ARRAY['Map link','Door code']),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'book-setup', 'Setup checklist', -2, 'high', ARRAY['Floor plan','Rentals staged','Power']),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'book-teardown', 'Teardown checklist', 1, 'medium', ARRAY['Strike time','Truck','Lost and found']),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'book-vendors', 'Vendor checklist', -7, 'high', ARRAY['Caterer','Florist','Band load-in'])
ON CONFLICT (template_id, item_key) DO NOTHING;

ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_proposal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_saved_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_notifications ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'crm_companies','crm_contacts','crm_activities','crm_proposals','crm_proposal_lines',
    'crm_contracts','crm_payments','crm_reminders','crm_saved_views'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "crm read %1$s" ON public.%1$s', tbl);
    EXECUTE format('CREATE POLICY "crm read %1$s" ON public.%1$s FOR SELECT TO authenticated USING (public.has_named_permission(''crm.view''))', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "crm write %1$s" ON public.%1$s', tbl);
    EXECUTE format('CREATE POLICY "crm write %1$s" ON public.%1$s FOR ALL TO authenticated USING (public.has_named_permission(''crm.update'')) WITH CHECK (public.has_named_permission(''crm.update''))', tbl);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "tasks read templates" ON public.task_templates;
CREATE POLICY "tasks read templates" ON public.task_templates FOR SELECT TO authenticated USING (public.has_named_permission('tasks.view'));
DROP POLICY IF EXISTS "tasks manage templates" ON public.task_templates;
CREATE POLICY "tasks manage templates" ON public.task_templates FOR ALL TO authenticated USING (public.has_named_permission('tasks.manage')) WITH CHECK (public.has_named_permission('tasks.manage'));

DROP POLICY IF EXISTS "tasks read template items" ON public.task_template_items;
CREATE POLICY "tasks read template items" ON public.task_template_items FOR SELECT TO authenticated USING (public.has_named_permission('tasks.view'));
DROP POLICY IF EXISTS "tasks manage template items" ON public.task_template_items;
CREATE POLICY "tasks manage template items" ON public.task_template_items FOR ALL TO authenticated USING (public.has_named_permission('tasks.manage')) WITH CHECK (public.has_named_permission('tasks.manage'));

DROP POLICY IF EXISTS "tasks read comments" ON public.task_comments;
CREATE POLICY "tasks read comments" ON public.task_comments FOR SELECT TO authenticated USING (public.has_named_permission('tasks.view'));
DROP POLICY IF EXISTS "tasks write comments" ON public.task_comments;
CREATE POLICY "tasks write comments" ON public.task_comments FOR ALL TO authenticated USING (public.has_named_permission('tasks.update')) WITH CHECK (public.has_named_permission('tasks.update'));

DROP POLICY IF EXISTS "read own notifications" ON public.staff_notifications;
CREATE POLICY "read own notifications" ON public.staff_notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_named_permission('tasks.manage'));
DROP POLICY IF EXISTS "write notifications" ON public.staff_notifications;
CREATE POLICY "write notifications" ON public.staff_notifications FOR ALL TO authenticated
  USING (public.has_named_permission('tasks.update'))
  WITH CHECK (public.has_named_permission('tasks.update'));

INSERT INTO permissions (name, display_name, description, resource, action) VALUES
  ('crm.view', 'View Venue CRM', 'Contacts, pipeline, proposals, contracts, and reports', 'crm', 'view'),
  ('crm.create', 'Create Venue CRM', 'Contacts, pipeline, proposals, contracts, and reports', 'crm', 'create'),
  ('crm.update', 'Update Venue CRM', 'Contacts, pipeline, proposals, contracts, and reports', 'crm', 'update'),
  ('crm.delete', 'Delete Venue CRM', 'Contacts, pipeline, proposals, contracts, and reports', 'crm', 'delete'),
  ('crm.manage', 'Manage Venue CRM', 'Contacts, pipeline, proposals, contracts, and reports', 'crm', 'manage')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.resource = 'crm'
WHERE r.name IN ('super_admin', 'admin', 'manager')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN ('crm.view', 'crm.create', 'crm.update', 'tasks.view', 'tasks.create', 'tasks.update')
WHERE r.name IN ('staff', 'coordinator')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN ('crm.view', 'tasks.view')
WHERE r.name = 'viewer'
ON CONFLICT (role_id, permission_id) DO NOTHING;

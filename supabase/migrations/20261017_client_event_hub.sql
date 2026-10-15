-- Client event hub. Clients read only their own lead. Writes go through
-- security-definer functions that also log the timeline and open a staff task.
-- Internal notes and staff tasks stay off the client policies.

ALTER TABLE public.venue_leads ADD COLUMN IF NOT EXISTS client_user_id uuid;
ALTER TABLE public.crm_activities ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'internal' NOT NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS audience text DEFAULT 'staff' NOT NULL;

UPDATE public.crm_activities SET visibility = 'client' WHERE kind IN ('client', 'stage') AND visibility = 'internal';

CREATE INDEX IF NOT EXISTS venue_leads_client_user_idx ON public.venue_leads (client_user_id);
CREATE INDEX IF NOT EXISTS tasks_lead_audience_idx ON public.tasks (lead_id, audience);

CREATE TABLE IF NOT EXISTS public.crm_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.venue_leads(id) ON DELETE CASCADE NOT NULL,
  starts_at text NOT NULL,
  title text NOT NULL,
  notes text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_layouts (
  lead_id uuid PRIMARY KEY REFERENCES public.venue_leads(id) ON DELETE CASCADE,
  body text DEFAULT '' NOT NULL,
  floor_plan_label text DEFAULT 'Floor plan' NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.venue_leads(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  kind text DEFAULT 'other' NOT NULL,
  uploaded_by text,
  user_id uuid,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.venue_leads(id) ON DELETE CASCADE NOT NULL,
  author_name text,
  role text DEFAULT 'client' NOT NULL,
  body text NOT NULL,
  user_id uuid,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION public.client_can_read_lead(p_lead uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.venue_leads l
    LEFT JOIN public.crm_contacts c ON c.id = l.contact_id
    WHERE l.id = p_lead
      AND (
        l.client_user_id = auth.uid()
        OR lower(coalesce(c.email, l.contact_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.client_record_change(p_lead uuid, p_body text, p_task_title text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner text;
  v_name text;
BEGIN
  IF NOT public.client_can_read_lead(p_lead) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  SELECT l.owner_name, coalesce(c.name, l.contact_name, 'Client')
    INTO v_owner, v_name
  FROM public.venue_leads l
  LEFT JOIN public.crm_contacts c ON c.id = l.contact_id
  WHERE l.id = p_lead;

  INSERT INTO public.crm_activities (lead_id, kind, body, author_name, visibility)
  VALUES (p_lead, 'client', left(p_body, 4000), v_name, 'client');

  IF p_task_title IS NOT NULL AND length(btrim(p_task_title)) > 0 THEN
    INSERT INTO public.tasks (title, description, status, priority, task_type, lead_id, assigned_to_text, due_date, audience, checklist)
    VALUES (
      left(p_task_title, 200),
      left(p_body, 4000),
      'pending',
      'high',
      'venue',
      p_lead,
      coalesce(nullif(v_owner, ''), 'Unassigned'),
      (timezone('utc', now()))::date + 1,
      'staff',
      '[]'::jsonb
    );
    INSERT INTO public.staff_notifications (recipient_name, kind, title, body, href, user_id)
    VALUES (coalesce(nullif(v_owner, ''), 'Unassigned'), 'assignment', 'Task assigned', left(p_task_title, 200), '/admin/my-tasks', auth.uid());
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.client_update_details(p_lead uuid, p_guests integer, p_details text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_body text;
BEGIN
  IF p_guests IS NULL OR p_guests < 1 OR p_guests > 5000 THEN
    RAISE EXCEPTION 'guest count is out of range';
  END IF;
  IF NOT public.client_can_read_lead(p_lead) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  UPDATE public.venue_leads
  SET guest_count = p_guests, updated_at = timezone('utc', now())
  WHERE id = p_lead;
  SELECT coalesce(c.name, l.contact_name, 'Client') INTO v_name
  FROM public.venue_leads l
  LEFT JOIN public.crm_contacts c ON c.id = l.contact_id
  WHERE l.id = p_lead;
  v_body := 'Updated the guest count to ' || p_guests || '.';
  IF p_details IS NOT NULL AND length(btrim(p_details)) > 0 THEN
    v_body := v_body || ' ' || left(btrim(p_details), 2000);
  END IF;
  PERFORM public.client_record_change(p_lead, v_body, 'Review guest count for ' || v_name);
END;
$$;

CREATE OR REPLACE FUNCTION public.client_send_message(p_lead uuid, p_body text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_body text;
BEGIN
  v_body := left(btrim(coalesce(p_body, '')), 4000);
  IF length(v_body) = 0 THEN
    RAISE EXCEPTION 'message is empty';
  END IF;
  IF NOT public.client_can_read_lead(p_lead) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  SELECT coalesce(c.name, l.contact_name, 'Client') INTO v_name
  FROM public.venue_leads l
  LEFT JOIN public.crm_contacts c ON c.id = l.contact_id
  WHERE l.id = p_lead;
  INSERT INTO public.crm_messages (lead_id, author_name, role, body, user_id)
  VALUES (p_lead, v_name, 'client', v_body, auth.uid());
  PERFORM public.client_record_change(p_lead, v_name || ' wrote: ' || v_body, 'Reply to ' || v_name);
END;
$$;

CREATE OR REPLACE FUNCTION public.client_add_document(p_lead uuid, p_name text, p_kind text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_file text;
  v_kind text;
BEGIN
  v_file := left(btrim(coalesce(p_name, '')), 240);
  IF length(v_file) = 0 THEN
    RAISE EXCEPTION 'document needs a name';
  END IF;
  v_kind := CASE WHEN p_kind IN ('vendor', 'inspiration') THEN p_kind ELSE 'other' END;
  IF NOT public.client_can_read_lead(p_lead) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  SELECT coalesce(c.name, l.contact_name, 'Client') INTO v_name
  FROM public.venue_leads l
  LEFT JOIN public.crm_contacts c ON c.id = l.contact_id
  WHERE l.id = p_lead;
  INSERT INTO public.crm_documents (lead_id, name, kind, uploaded_by, user_id)
  VALUES (p_lead, v_file, v_kind, v_name, auth.uid());
  PERFORM public.client_record_change(p_lead, 'Uploaded ' || v_file || '.', 'Review ' || v_name || '''s upload');
END;
$$;

CREATE OR REPLACE FUNCTION public.client_sign_contract(p_lead uuid, p_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_signed text;
  v_count integer;
BEGIN
  v_signed := left(btrim(coalesce(p_name, '')), 160);
  IF length(v_signed) = 0 THEN
    RAISE EXCEPTION 'signature needs a name';
  END IF;
  IF NOT public.client_can_read_lead(p_lead) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  UPDATE public.crm_contracts
  SET status = 'signed', signed_at = timezone('utc', now())
  WHERE lead_id = p_lead AND status IS DISTINCT FROM 'signed';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count = 0 THEN
    RAISE EXCEPTION 'nothing to sign';
  END IF;
  PERFORM public.client_record_change(p_lead, v_signed || ' signed the contract.', 'File the signed contract');
END;
$$;

CREATE OR REPLACE FUNCTION public.client_complete_task(p_task uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead uuid;
  v_title text;
BEGIN
  SELECT lead_id, title INTO v_lead, v_title
  FROM public.tasks
  WHERE id = p_task AND audience = 'client' AND status <> 'completed';
  IF v_lead IS NULL OR NOT public.client_can_read_lead(v_lead) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  UPDATE public.tasks
  SET status = 'completed', completed_at = timezone('utc', now()), updated_at = timezone('utc', now())
  WHERE id = p_task AND audience = 'client';
  PERFORM public.client_record_change(v_lead, 'Completed "' || v_title || '".', 'Client finished: ' || v_title);
END;
$$;

REVOKE ALL ON FUNCTION public.client_can_read_lead(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.client_record_change(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.client_update_details(uuid, integer, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.client_send_message(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.client_add_document(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.client_sign_contract(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.client_complete_task(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.client_update_details(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.client_send_message(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.client_add_document(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.client_sign_contract(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.client_complete_task(uuid) TO authenticated;

ALTER TABLE public.crm_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm read crm_schedule" ON public.crm_schedule;
CREATE POLICY "crm read crm_schedule" ON public.crm_schedule FOR SELECT TO authenticated USING (public.has_named_permission('crm.view'));
DROP POLICY IF EXISTS "crm write crm_schedule" ON public.crm_schedule;
CREATE POLICY "crm write crm_schedule" ON public.crm_schedule FOR ALL TO authenticated USING (public.has_named_permission('crm.update')) WITH CHECK (public.has_named_permission('crm.update'));
DROP POLICY IF EXISTS "client read schedule" ON public.crm_schedule;
CREATE POLICY "client read schedule" ON public.crm_schedule FOR SELECT TO authenticated USING (public.client_can_read_lead(lead_id));

DROP POLICY IF EXISTS "crm read crm_layouts" ON public.crm_layouts;
CREATE POLICY "crm read crm_layouts" ON public.crm_layouts FOR SELECT TO authenticated USING (public.has_named_permission('crm.view'));
DROP POLICY IF EXISTS "crm write crm_layouts" ON public.crm_layouts;
CREATE POLICY "crm write crm_layouts" ON public.crm_layouts FOR ALL TO authenticated USING (public.has_named_permission('crm.update')) WITH CHECK (public.has_named_permission('crm.update'));
DROP POLICY IF EXISTS "client read layout" ON public.crm_layouts;
CREATE POLICY "client read layout" ON public.crm_layouts FOR SELECT TO authenticated USING (public.client_can_read_lead(lead_id));

DROP POLICY IF EXISTS "crm read crm_documents" ON public.crm_documents;
CREATE POLICY "crm read crm_documents" ON public.crm_documents FOR SELECT TO authenticated USING (public.has_named_permission('crm.view'));
DROP POLICY IF EXISTS "crm write crm_documents" ON public.crm_documents;
CREATE POLICY "crm write crm_documents" ON public.crm_documents FOR ALL TO authenticated USING (public.has_named_permission('crm.update')) WITH CHECK (public.has_named_permission('crm.update'));
DROP POLICY IF EXISTS "client read documents" ON public.crm_documents;
CREATE POLICY "client read documents" ON public.crm_documents FOR SELECT TO authenticated USING (public.client_can_read_lead(lead_id));

DROP POLICY IF EXISTS "crm read crm_messages" ON public.crm_messages;
CREATE POLICY "crm read crm_messages" ON public.crm_messages FOR SELECT TO authenticated USING (public.has_named_permission('crm.view'));
DROP POLICY IF EXISTS "crm write crm_messages" ON public.crm_messages;
CREATE POLICY "crm write crm_messages" ON public.crm_messages FOR ALL TO authenticated USING (public.has_named_permission('crm.update')) WITH CHECK (public.has_named_permission('crm.update'));
DROP POLICY IF EXISTS "client read messages" ON public.crm_messages;
CREATE POLICY "client read messages" ON public.crm_messages FOR SELECT TO authenticated USING (public.client_can_read_lead(lead_id));

DROP POLICY IF EXISTS "Clients read own leads" ON public.venue_leads;
CREATE POLICY "Clients read own leads" ON public.venue_leads FOR SELECT TO authenticated
  USING (public.client_can_read_lead(id));

DROP POLICY IF EXISTS "Clients read shared activities" ON public.crm_activities;
CREATE POLICY "Clients read shared activities" ON public.crm_activities FOR SELECT TO authenticated
  USING (visibility = 'client' AND public.client_can_read_lead(lead_id));

DROP POLICY IF EXISTS "Clients read own tours" ON public.venue_tours;
CREATE POLICY "Clients read own tours" ON public.venue_tours FOR SELECT TO authenticated
  USING (public.client_can_read_lead(lead_id));

DROP POLICY IF EXISTS "Clients read sent proposals" ON public.crm_proposals;
CREATE POLICY "Clients read sent proposals" ON public.crm_proposals FOR SELECT TO authenticated
  USING (status <> 'draft' AND public.client_can_read_lead(lead_id));

DROP POLICY IF EXISTS "Clients read proposal lines" ON public.crm_proposal_lines;
CREATE POLICY "Clients read proposal lines" ON public.crm_proposal_lines FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.crm_proposals p
    WHERE p.id = proposal_id AND p.status <> 'draft' AND public.client_can_read_lead(p.lead_id)
  ));

DROP POLICY IF EXISTS "Clients read own contracts" ON public.crm_contracts;
CREATE POLICY "Clients read own contracts" ON public.crm_contracts FOR SELECT TO authenticated
  USING (public.client_can_read_lead(lead_id));

DROP POLICY IF EXISTS "Clients read own payments" ON public.crm_payments;
CREATE POLICY "Clients read own payments" ON public.crm_payments FOR SELECT TO authenticated
  USING (public.client_can_read_lead(lead_id));

DROP POLICY IF EXISTS "Clients read own contacts" ON public.crm_contacts;
CREATE POLICY "Clients read own contacts" ON public.crm_contacts FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.venue_leads l
    WHERE l.contact_id = crm_contacts.id AND public.client_can_read_lead(l.id)
  ));

DROP POLICY IF EXISTS "Clients see shared tasks" ON public.tasks;
CREATE POLICY "Clients see shared tasks" ON public.tasks FOR SELECT TO authenticated
  USING (audience = 'client' AND public.client_can_read_lead(lead_id));

-- Bot control: roster, hashed keys, activity, approvals, guardrails,
-- prompt versions, staff requests, and signed webhook deliveries.
-- The service role is never stored here and is never granted to a bot.
-- Raw bot tokens are never stored. Only a SHA-256 hash and a display prefix.

CREATE TABLE IF NOT EXISTS public.ops_bots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  role text NOT NULL,
  scopes text[] NOT NULL DEFAULT ARRAY['leads:read','tasks:read']::text[],
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  timezone text NOT NULL DEFAULT 'America/New_York',
  digest_time text NOT NULL DEFAULT '8:00 AM',
  run_days smallint[] NOT NULL DEFAULT ARRAY[1, 2, 3, 4, 5]::smallint[],
  run_start time NOT NULL DEFAULT '08:00',
  run_end time NOT NULL DEFAULT '18:00',
  webhook_url text,
  webhook_secret text,
  webhook_events text[] NOT NULL DEFAULT ARRAY['lead.created','lead.stage_changed','task.overdue']::text[],
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT ops_bots_name_not_blank CHECK (char_length(trim(name)) > 0),
  CONSTRAINT ops_bots_scopes_known CHECK (
    scopes <@ ARRAY['leads:read','leads:write','tasks:read','tasks:write','clients:message','prices:write','records:delete']::text[]
  )
);

CREATE TABLE IF NOT EXISTS public.ops_bot_keys (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id uuid NOT NULL REFERENCES public.ops_bots(id) ON DELETE CASCADE,
  label text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT ops_bot_keys_scopes_known CHECK (
    scopes <@ ARRAY['leads:read','leads:write','tasks:read','tasks:write','clients:message','prices:write','records:delete']::text[]
  ),
  CONSTRAINT ops_bot_keys_scopes_present CHECK (cardinality(scopes) > 0)
);

CREATE TABLE IF NOT EXISTS public.ops_bot_activity (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id uuid REFERENCES public.ops_bots(id) ON DELETE SET NULL,
  key_id uuid REFERENCES public.ops_bot_keys(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text NOT NULL,
  before_data jsonb,
  after_data jsonb,
  reversible boolean NOT NULL DEFAULT false,
  undone_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.ops_bot_approvals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id uuid REFERENCES public.ops_bots(id) ON DELETE SET NULL,
  key_id uuid REFERENCES public.ops_bot_keys(id) ON DELETE SET NULL,
  action text NOT NULL,
  summary text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  amount_cents integer,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.ops_bot_guardrails (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  never_contact_clients boolean NOT NULL DEFAULT true,
  read_only_weekends boolean NOT NULL DEFAULT true,
  approval_threshold_cents integer NOT NULL DEFAULT 50000 CHECK (approval_threshold_cents >= 0),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

INSERT INTO public.ops_bot_guardrails (never_contact_clients)
SELECT true
WHERE NOT EXISTS (SELECT 1 FROM public.ops_bot_guardrails);

CREATE TABLE IF NOT EXISTS public.ops_bot_prompt_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id text NOT NULL CHECK (prompt_id IN ('master', 'ops', 'digest')),
  version integer NOT NULL,
  body text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (prompt_id, version)
);

CREATE TABLE IF NOT EXISTS public.ops_bot_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id uuid REFERENCES public.ops_bots(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'declined')),
  submitted_by uuid,
  submitted_by_name text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.ops_bot_webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id uuid REFERENCES public.ops_bots(id) ON DELETE SET NULL,
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'retrying', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  signature text,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  delivered_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.ops_bot_rate (
  key_id uuid PRIMARY KEY REFERENCES public.ops_bot_keys(id) ON DELETE CASCADE,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 0
);

ALTER TABLE public.ops_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_bot_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_bot_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_bot_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_bot_guardrails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_bot_prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_bot_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_bot_webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_bot_rate ENABLE ROW LEVEL SECURITY;

-- Secrets stay off the authenticated role. key_hash and webhook_secret are not granted.
REVOKE ALL ON public.ops_bots FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.ops_bot_keys FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.ops_bot_rate FROM PUBLIC, anon, authenticated;
GRANT SELECT (
  id, name, role, scopes, status, timezone, digest_time, run_days, run_start, run_end,
  webhook_url, webhook_events, created_at, updated_at
) ON public.ops_bots TO authenticated;
GRANT INSERT (
  name, role, scopes, status, timezone, digest_time, run_days, run_start, run_end, webhook_url, webhook_events
) ON public.ops_bots TO authenticated;
GRANT UPDATE (
  name, role, scopes, status, timezone, digest_time, run_days, run_start, run_end, webhook_url, webhook_events
) ON public.ops_bots TO authenticated;
GRANT SELECT (id, bot_id, label, key_prefix, scopes, revoked_at, last_used_at, created_at)
  ON public.ops_bot_keys TO authenticated;

DROP POLICY IF EXISTS "bot view bots" ON public.ops_bots;
CREATE POLICY "bot view bots" ON public.ops_bots FOR SELECT TO authenticated
  USING (public.has_named_permission('bot.view'));
DROP POLICY IF EXISTS "bot manage bots" ON public.ops_bots;
CREATE POLICY "bot manage bots" ON public.ops_bots FOR ALL TO authenticated
  USING (public.has_named_permission('bot.manage'))
  WITH CHECK (public.has_named_permission('bot.manage'));

DROP POLICY IF EXISTS "bot view keys" ON public.ops_bot_keys;
CREATE POLICY "bot view keys" ON public.ops_bot_keys FOR SELECT TO authenticated
  USING (public.has_named_permission('bot.view'));

DROP POLICY IF EXISTS "bot view activity" ON public.ops_bot_activity;
CREATE POLICY "bot view activity" ON public.ops_bot_activity FOR SELECT TO authenticated
  USING (public.has_named_permission('bot.view'));

DROP POLICY IF EXISTS "bot view approvals" ON public.ops_bot_approvals;
CREATE POLICY "bot view approvals" ON public.ops_bot_approvals FOR SELECT TO authenticated
  USING (public.has_named_permission('bot.view'));

DROP POLICY IF EXISTS "bot view guardrails" ON public.ops_bot_guardrails;
CREATE POLICY "bot view guardrails" ON public.ops_bot_guardrails FOR SELECT TO authenticated
  USING (public.has_named_permission('bot.view'));
DROP POLICY IF EXISTS "bot manage guardrails" ON public.ops_bot_guardrails;
CREATE POLICY "bot manage guardrails" ON public.ops_bot_guardrails FOR UPDATE TO authenticated
  USING (public.has_named_permission('bot.manage'))
  WITH CHECK (public.has_named_permission('bot.manage'));

DROP POLICY IF EXISTS "bot view prompt versions" ON public.ops_bot_prompt_versions;
CREATE POLICY "bot view prompt versions" ON public.ops_bot_prompt_versions FOR SELECT TO authenticated
  USING (public.has_named_permission('bot.view'));
DROP POLICY IF EXISTS "bot manage prompt versions" ON public.ops_bot_prompt_versions;
CREATE POLICY "bot manage prompt versions" ON public.ops_bot_prompt_versions FOR INSERT TO authenticated
  WITH CHECK (public.has_named_permission('bot.manage'));

DROP POLICY IF EXISTS "bot view requests" ON public.ops_bot_requests;
CREATE POLICY "bot view requests" ON public.ops_bot_requests FOR SELECT TO authenticated
  USING (
    public.has_named_permission('bot.view')
    OR public.has_named_permission('bot_inbox.view')
  );
DROP POLICY IF EXISTS "bot create requests" ON public.ops_bot_requests;
CREATE POLICY "bot create requests" ON public.ops_bot_requests FOR INSERT TO authenticated
  WITH CHECK (public.has_named_permission('bot_inbox.create') OR public.has_named_permission('bot.manage'));
DROP POLICY IF EXISTS "bot update requests" ON public.ops_bot_requests;
CREATE POLICY "bot update requests" ON public.ops_bot_requests FOR UPDATE TO authenticated
  USING (public.has_named_permission('bot.manage'))
  WITH CHECK (public.has_named_permission('bot.manage'));

DROP POLICY IF EXISTS "bot view deliveries" ON public.ops_bot_webhook_deliveries;
CREATE POLICY "bot view deliveries" ON public.ops_bot_webhook_deliveries FOR SELECT TO authenticated
  USING (public.has_named_permission('bot.view'));

-- Audit rows drop secret columns before they are written.
CREATE OR REPLACE FUNCTION public.record_bot_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_payload jsonb;
  old_payload jsonb;
BEGIN
  IF to_regclass('public.audit_logs') IS NULL THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    new_payload := to_jsonb(NEW) - 'key_hash' - 'webhook_secret';
    INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, new_payload, auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    new_payload := to_jsonb(NEW) - 'key_hash' - 'webhook_secret';
    old_payload := to_jsonb(OLD) - 'key_hash' - 'webhook_secret';
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, old_payload, new_payload, auth.uid());
    RETURN NEW;
  ELSE
    old_payload := to_jsonb(OLD) - 'key_hash' - 'webhook_secret';
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, old_payload, auth.uid());
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS audit_ops_bots ON public.ops_bots;
CREATE TRIGGER audit_ops_bots AFTER INSERT OR UPDATE OR DELETE ON public.ops_bots
  FOR EACH ROW EXECUTE FUNCTION public.record_bot_audit();
DROP TRIGGER IF EXISTS audit_ops_bot_keys ON public.ops_bot_keys;
CREATE TRIGGER audit_ops_bot_keys AFTER INSERT OR UPDATE OR DELETE ON public.ops_bot_keys
  FOR EACH ROW EXECUTE FUNCTION public.record_bot_audit();
DROP TRIGGER IF EXISTS audit_ops_bot_guardrails ON public.ops_bot_guardrails;
CREATE TRIGGER audit_ops_bot_guardrails AFTER INSERT OR UPDATE OR DELETE ON public.ops_bot_guardrails
  FOR EACH ROW EXECUTE FUNCTION public.record_bot_audit();
DROP TRIGGER IF EXISTS audit_ops_bot_approvals ON public.ops_bot_approvals;
CREATE TRIGGER audit_ops_bot_approvals AFTER INSERT OR UPDATE OR DELETE ON public.ops_bot_approvals
  FOR EACH ROW EXECUTE FUNCTION public.record_bot_audit();

CREATE OR REPLACE FUNCTION public.bot_perform(
  p_key_hash text,
  p_action text,
  p_payload jsonb,
  p_now timestamptz DEFAULT timezone('utc', now())
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key public.ops_bot_keys%ROWTYPE;
  v_bot public.ops_bots%ROWTYPE;
  v_guard public.ops_bot_guardrails%ROWTYPE;
  v_local timestamp;
  v_dow int;
  v_minutes int;
  v_start int;
  v_end int;
  v_needed text;
  v_amount integer;
  v_before jsonb;
  v_after jsonb;
  v_lead uuid;
  v_task uuid;
  v_activity uuid;
  v_approval uuid;
  v_hits integer;
BEGIN
  IF p_key_hash IS NULL OR length(p_key_hash) < 32 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_api_key', 'message', 'API key is invalid or has been revoked.');
  END IF;

  SELECT * INTO v_key FROM public.ops_bot_keys WHERE key_hash = p_key_hash;
  IF NOT FOUND OR v_key.revoked_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_api_key', 'message', 'API key is invalid or has been revoked.');
  END IF;

  SELECT * INTO v_bot FROM public.ops_bots WHERE id = v_key.bot_id;
  IF NOT FOUND OR v_bot.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'bot_paused', 'message', 'This bot is paused.');
  END IF;

  INSERT INTO public.ops_bot_rate (key_id, window_start, hits)
  VALUES (v_key.id, p_now, 1)
  ON CONFLICT (key_id) DO UPDATE
    SET hits = CASE WHEN public.ops_bot_rate.window_start < p_now - interval '1 minute' THEN 1 ELSE public.ops_bot_rate.hits + 1 END,
        window_start = CASE WHEN public.ops_bot_rate.window_start < p_now - interval '1 minute' THEN p_now ELSE public.ops_bot_rate.window_start END
  RETURNING hits INTO v_hits;
  IF v_hits > 60 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'rate_limited', 'message', 'Too many requests. Try again shortly.');
  END IF;

  v_needed := CASE p_action
    WHEN 'leads.list' THEN 'leads:read'
    WHEN 'leads.stage' THEN 'leads:write'
    WHEN 'tasks.list' THEN 'tasks:read'
    WHEN 'tasks.complete' THEN 'tasks:write'
    WHEN 'clients.message' THEN 'clients:message'
    WHEN 'prices.update' THEN 'prices:write'
    WHEN 'records.delete' THEN 'records:delete'
    ELSE NULL
  END;
  IF v_needed IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'unknown_action', 'message', 'That action is not available.');
  END IF;
  IF NOT (v_key.scopes @> ARRAY[v_needed]) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'insufficient_scope', 'message', 'This key cannot run that action.');
  END IF;

  v_local := p_now AT TIME ZONE COALESCE(NULLIF(v_bot.timezone, ''), 'America/New_York');
  v_dow := EXTRACT(DOW FROM v_local)::int;
  v_minutes := EXTRACT(HOUR FROM v_local)::int * 60 + EXTRACT(MINUTE FROM v_local)::int;
  v_start := EXTRACT(HOUR FROM v_bot.run_start)::int * 60 + EXTRACT(MINUTE FROM v_bot.run_start)::int;
  v_end := EXTRACT(HOUR FROM v_bot.run_end)::int * 60 + EXTRACT(MINUTE FROM v_bot.run_end)::int;
  IF NOT (v_dow = ANY (v_bot.run_days)) OR v_minutes < v_start OR v_minutes >= v_end THEN
    RETURN jsonb_build_object('ok', false, 'code', 'outside_schedule', 'message', 'This bot is outside its run window.');
  END IF;

  SELECT * INTO v_guard FROM public.ops_bot_guardrails ORDER BY updated_at DESC LIMIT 1;
  IF NOT FOUND THEN
    v_guard.never_contact_clients := true;
    v_guard.read_only_weekends := true;
    v_guard.approval_threshold_cents := 50000;
  END IF;

  IF v_guard.read_only_weekends AND v_dow IN (0, 6) AND p_action NOT IN ('leads.list', 'tasks.list') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'weekend_read_only', 'message', 'Writes are off on weekends.');
  END IF;

  IF p_action = 'clients.message' AND v_guard.never_contact_clients THEN
    RETURN jsonb_build_object('ok', false, 'code', 'never_contact_clients', 'message', 'This house does not let bots contact clients.');
  END IF;

  IF p_action IN ('clients.message', 'records.delete')
     OR (p_action = 'prices.update' AND COALESCE((p_payload->>'amount_cents')::integer, v_guard.approval_threshold_cents + 1) > v_guard.approval_threshold_cents) THEN
    INSERT INTO public.ops_bot_approvals (bot_id, key_id, action, summary, payload, amount_cents)
    VALUES (
      v_bot.id,
      v_key.id,
      p_action,
      COALESCE(p_payload->>'summary', p_action),
      COALESCE(p_payload, '{}'::jsonb) - 'key_hash' - 'webhook_secret' - 'service_role',
      NULLIF(p_payload->>'amount_cents', '')::integer
    )
    RETURNING id INTO v_approval;
    UPDATE public.ops_bot_keys SET last_used_at = p_now WHERE id = v_key.id;
    RETURN jsonb_build_object('ok', true, 'effect', 'hold', 'approval_id', v_approval);
  END IF;

  IF p_action = 'leads.list' THEN
    UPDATE public.ops_bot_keys SET last_used_at = p_now WHERE id = v_key.id;
    RETURN jsonb_build_object(
      'ok', true,
      'effect', 'allow',
      'leads', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', id, 'stage', stage, 'venue_name', venue_name, 'event_date', event_date, 'contact_name', contact_name
        ))
        FROM (
          SELECT id, stage, venue_name, event_date, contact_name
          FROM public.venue_leads
          ORDER BY updated_at DESC NULLS LAST
          LIMIT 50
        ) recent
      ), '[]'::jsonb)
    );
  END IF;

  IF p_action = 'tasks.list' THEN
    UPDATE public.ops_bot_keys SET last_used_at = p_now WHERE id = v_key.id;
    RETURN jsonb_build_object(
      'ok', true,
      'effect', 'allow',
      'tasks', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('id', id, 'title', title, 'status', status, 'due_date', due_date))
        FROM (
          SELECT id, title, status, due_date FROM public.tasks
          WHERE COALESCE(audience, 'staff') = 'staff'
          ORDER BY due_date NULLS LAST
          LIMIT 50
        ) recent
      ), '[]'::jsonb)
    );
  END IF;

  IF p_action = 'leads.stage' THEN
    v_lead := NULLIF(p_payload->>'lead_id', '')::uuid;
    SELECT jsonb_build_object('stage', stage) INTO v_before FROM public.venue_leads WHERE id = v_lead;
    IF v_before IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'code', 'not_found', 'message', 'That lead was not found.');
    END IF;
    UPDATE public.venue_leads SET stage = p_payload->>'stage', updated_at = p_now WHERE id = v_lead;
    v_after := jsonb_build_object('stage', p_payload->>'stage');
    INSERT INTO public.ops_bot_activity (bot_id, key_id, action, table_name, record_id, before_data, after_data, reversible)
    VALUES (v_bot.id, v_key.id, p_action, 'venue_leads', v_lead::text, v_before, v_after, true)
    RETURNING id INTO v_activity;
  ELSIF p_action = 'tasks.complete' THEN
    v_task := NULLIF(p_payload->>'task_id', '')::uuid;
    SELECT jsonb_build_object('status', status) INTO v_before FROM public.tasks WHERE id = v_task;
    IF v_before IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'code', 'not_found', 'message', 'That task was not found.');
    END IF;
    UPDATE public.tasks SET status = 'completed', completed_at = p_now WHERE id = v_task;
    v_after := jsonb_build_object('status', 'completed');
    INSERT INTO public.ops_bot_activity (bot_id, key_id, action, table_name, record_id, before_data, after_data, reversible)
    VALUES (v_bot.id, v_key.id, p_action, 'tasks', v_task::text, v_before, v_after, true)
    RETURNING id INTO v_activity;
  ELSIF p_action = 'prices.update' THEN
    v_lead := NULLIF(p_payload->>'lead_id', '')::uuid;
    v_amount := (p_payload->>'amount_cents')::integer;
    SELECT jsonb_build_object('value_cents', value_cents) INTO v_before FROM public.venue_leads WHERE id = v_lead;
    IF v_before IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'code', 'not_found', 'message', 'That lead was not found.');
    END IF;
    UPDATE public.venue_leads SET value_cents = v_amount, updated_at = p_now WHERE id = v_lead;
    v_after := jsonb_build_object('value_cents', v_amount);
    INSERT INTO public.ops_bot_activity (bot_id, key_id, action, table_name, record_id, before_data, after_data, reversible)
    VALUES (v_bot.id, v_key.id, p_action, 'venue_leads', v_lead::text, v_before, v_after, true)
    RETURNING id INTO v_activity;
  ELSE
    RETURN jsonb_build_object('ok', false, 'code', 'unknown_action', 'message', 'That action is not available.');
  END IF;

  UPDATE public.ops_bot_keys SET last_used_at = p_now WHERE id = v_key.id;
  RETURN jsonb_build_object('ok', true, 'effect', 'allow', 'activity_id', v_activity);
END;
$$;

REVOKE ALL ON FUNCTION public.bot_perform(text, text, jsonb, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bot_perform(text, text, jsonb, timestamptz) TO service_role;

CREATE OR REPLACE FUNCTION public.bot_decide_approval(p_id uuid, p_status text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.ops_bot_approvals%ROWTYPE;
  v_guard public.ops_bot_guardrails%ROWTYPE;
BEGIN
  IF NOT public.has_named_permission('bot.manage') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'forbidden');
  END IF;
  IF p_status NOT IN ('approved', 'rejected') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_status');
  END IF;
  SELECT * INTO v_row FROM public.ops_bot_approvals WHERE id = p_id AND status = 'pending';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found');
  END IF;
  SELECT * INTO v_guard FROM public.ops_bot_guardrails ORDER BY updated_at DESC LIMIT 1;
  IF v_row.action = 'clients.message' AND COALESCE(v_guard.never_contact_clients, true) THEN
    UPDATE public.ops_bot_approvals SET status = 'rejected', decided_at = timezone('utc', now()) WHERE id = p_id;
    RETURN jsonb_build_object('ok', false, 'code', 'never_contact_clients');
  END IF;
  UPDATE public.ops_bot_approvals SET status = p_status, decided_at = timezone('utc', now()) WHERE id = p_id;
  IF p_status = 'approved' AND v_row.action = 'records.delete' AND to_regclass('public.venue_leads') IS NOT NULL THEN
    UPDATE public.venue_leads
    SET stage = 'lost', updated_at = timezone('utc', now())
    WHERE id = NULLIF(v_row.payload->>'lead_id', '')::uuid;
    INSERT INTO public.ops_bot_activity (bot_id, key_id, action, table_name, record_id, before_data, after_data, reversible)
    VALUES (v_row.bot_id, v_row.key_id, v_row.action, 'venue_leads', COALESCE(v_row.payload->>'lead_id', ''), jsonb_build_object('stage', 'open'), jsonb_build_object('stage', 'lost'), true);
  ELSIF p_status = 'approved' AND v_row.action = 'prices.update' AND to_regclass('public.venue_leads') IS NOT NULL THEN
    UPDATE public.venue_leads
    SET value_cents = NULLIF(v_row.payload->>'amount_cents', '')::integer, updated_at = timezone('utc', now())
    WHERE id = NULLIF(v_row.payload->>'lead_id', '')::uuid;
    INSERT INTO public.ops_bot_activity (bot_id, key_id, action, table_name, record_id, before_data, after_data, reversible)
    VALUES (
      v_row.bot_id, v_row.key_id, v_row.action, 'venue_leads', COALESCE(v_row.payload->>'lead_id', ''),
      jsonb_build_object('value_cents', NULL),
      jsonb_build_object('value_cents', NULLIF(v_row.payload->>'amount_cents', '')::integer),
      true
    );
  ELSIF p_status = 'approved' AND v_row.action = 'clients.message' AND to_regclass('public.crm_messages') IS NOT NULL THEN
    INSERT INTO public.crm_messages (lead_id, author_name, role, body)
    VALUES (NULLIF(v_row.payload->>'lead_id', '')::uuid, 'Bot', 'staff', COALESCE(v_row.payload->>'body', ''));
  END IF;
  RETURN jsonb_build_object('ok', true, 'status', p_status);
END;
$$;

REVOKE ALL ON FUNCTION public.bot_decide_approval(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bot_decide_approval(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.bot_undo_activity(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.ops_bot_activity%ROWTYPE;
BEGIN
  IF NOT public.has_named_permission('bot.manage') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'forbidden');
  END IF;
  SELECT * INTO v_row FROM public.ops_bot_activity WHERE id = p_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found');
  END IF;
  IF NOT v_row.reversible OR v_row.undone_at IS NOT NULL OR v_row.before_data IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_reversible');
  END IF;
  IF v_row.table_name = 'venue_leads' AND to_regclass('public.venue_leads') IS NOT NULL THEN
    UPDATE public.venue_leads
    SET stage = COALESCE(v_row.before_data->>'stage', stage),
        value_cents = COALESCE((v_row.before_data->>'value_cents')::integer, value_cents),
        updated_at = timezone('utc', now())
    WHERE id = NULLIF(v_row.record_id, '')::uuid;
  ELSIF v_row.table_name = 'tasks' AND to_regclass('public.tasks') IS NOT NULL THEN
    UPDATE public.tasks
    SET status = COALESCE(v_row.before_data->>'status', status)
    WHERE id = NULLIF(v_row.record_id, '')::uuid;
  ELSE
    RETURN jsonb_build_object('ok', false, 'code', 'not_reversible');
  END IF;
  UPDATE public.ops_bot_activity SET undone_at = timezone('utc', now()) WHERE id = p_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.bot_undo_activity(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bot_undo_activity(uuid) TO authenticated, service_role;

INSERT INTO permissions (name, display_name, description, resource, action) VALUES
  ('bot_inbox.view', 'View Bot inbox', 'See requests sent to a bot', 'bot_inbox', 'view'),
  ('bot_inbox.create', 'Create Bot inbox', 'Ask a bot to do something', 'bot_inbox', 'create')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.resource = 'bot_inbox'
WHERE r.name IN ('super_admin', 'admin', 'manager')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN ('bot_inbox.view', 'bot_inbox.create')
WHERE r.name IN ('staff', 'coordinator')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name = 'bot_inbox.view'
WHERE r.name = 'viewer'
ON CONFLICT (role_id, permission_id) DO NOTHING;

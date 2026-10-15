-- Voice writes and the voice activity log.
-- The route authenticates a hashed bot key, then this function checks scopes,
-- hours, and weekend guardrails again before it changes a task.
-- Raw tokens and the service role are never written here.

CREATE OR REPLACE FUNCTION public.bot_record_voice(
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
  v_hits integer;
  v_task uuid;
  v_before text;
  v_title text;
  v_activity uuid;
BEGIN
  IF p_key_hash IS NULL OR length(p_key_hash) < 32 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_api_key');
  END IF;

  SELECT * INTO v_key FROM public.ops_bot_keys WHERE key_hash = p_key_hash;
  IF NOT FOUND OR v_key.revoked_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_api_key');
  END IF;

  SELECT * INTO v_bot FROM public.ops_bots WHERE id = v_key.bot_id;
  IF NOT FOUND OR v_bot.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'bot_paused');
  END IF;

  INSERT INTO public.ops_bot_rate (key_id, window_start, hits)
  VALUES (v_key.id, p_now, 1)
  ON CONFLICT (key_id) DO UPDATE
    SET hits = CASE WHEN public.ops_bot_rate.window_start < p_now - interval '1 minute' THEN 1 ELSE public.ops_bot_rate.hits + 1 END,
        window_start = CASE WHEN public.ops_bot_rate.window_start < p_now - interval '1 minute' THEN p_now ELSE public.ops_bot_rate.window_start END
  RETURNING hits INTO v_hits;
  IF v_hits > 20 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'rate_limited');
  END IF;

  v_needed := CASE p_action
    WHEN 'voice.query' THEN NULL
    WHEN 'tasks.create' THEN 'tasks:write'
    WHEN 'tasks.complete' THEN 'tasks:write'
    WHEN 'voice.hold' THEN 'tasks:write'
    ELSE 'invalid'
  END;
  IF v_needed = 'invalid' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'unknown_action');
  END IF;
  IF v_needed IS NOT NULL AND NOT (v_key.scopes @> ARRAY[v_needed]) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'insufficient_scope');
  END IF;

  v_local := p_now AT TIME ZONE COALESCE(NULLIF(v_bot.timezone, ''), 'America/New_York');
  v_dow := EXTRACT(DOW FROM v_local)::int;
  v_minutes := EXTRACT(HOUR FROM v_local)::int * 60 + EXTRACT(MINUTE FROM v_local)::int;
  v_start := EXTRACT(HOUR FROM v_bot.run_start)::int * 60 + EXTRACT(MINUTE FROM v_bot.run_start)::int;
  v_end := EXTRACT(HOUR FROM v_bot.run_end)::int * 60 + EXTRACT(MINUTE FROM v_bot.run_end)::int;

  IF p_action <> 'voice.query' THEN
    IF NOT (v_dow = ANY (v_bot.run_days)) OR v_minutes < v_start OR v_minutes >= v_end THEN
      RETURN jsonb_build_object('ok', false, 'code', 'outside_schedule');
    END IF;
    SELECT * INTO v_guard FROM public.ops_bot_guardrails ORDER BY updated_at DESC LIMIT 1;
    IF NOT FOUND OR v_guard.read_only_weekends IS NULL THEN
      v_guard.read_only_weekends := true;
    END IF;
    IF v_guard.read_only_weekends AND v_dow IN (0, 6) THEN
      RETURN jsonb_build_object('ok', false, 'code', 'weekend_read_only');
    END IF;
  END IF;

  IF p_action = 'voice.hold' THEN
    INSERT INTO public.ops_bot_approvals (bot_id, key_id, action, summary, payload)
    VALUES (
      v_bot.id,
      v_key.id,
      COALESCE(p_payload->>'action', 'voice'),
      COALESCE(p_payload->>'summary', 'Voice request'),
      COALESCE(p_payload, '{}'::jsonb) - 'key_hash' - 'webhook_secret' - 'service_role'
    );
    INSERT INTO public.ops_bot_activity (bot_id, key_id, action, table_name, record_id, before_data, after_data, reversible)
    VALUES (v_bot.id, v_key.id, 'voice.hold', 'ops_bot_approvals', v_bot.id::text, NULL, jsonb_build_object('intent', p_payload->>'intent'), false);
    UPDATE public.ops_bot_keys SET last_used_at = p_now WHERE id = v_key.id;
    RETURN jsonb_build_object('ok', true, 'effect', 'hold');
  END IF;

  IF p_action = 'tasks.create' THEN
    v_title := left(trim(COALESCE(p_payload->>'title', '')), 160);
    IF v_title = '' THEN
      RETURN jsonb_build_object('ok', false, 'code', 'not_found');
    END IF;
    INSERT INTO public.tasks (title, description, status, priority, task_type, due_date, audience, created_by_text)
    VALUES (v_title, 'Added by voice.', 'pending', 'medium', 'general', v_local::date, 'staff', 'Voice')
    RETURNING id INTO v_task;
    INSERT INTO public.ops_bot_activity (bot_id, key_id, action, table_name, record_id, before_data, after_data, reversible)
    VALUES (v_bot.id, v_key.id, 'tasks.create', 'tasks', v_task::text, NULL, jsonb_build_object('title', v_title, 'status', 'pending'), false)
    RETURNING id INTO v_activity;
    UPDATE public.ops_bot_keys SET last_used_at = p_now WHERE id = v_key.id;
    RETURN jsonb_build_object('ok', true, 'effect', 'allow', 'activity_id', v_activity);
  END IF;

  IF p_action = 'tasks.complete' THEN
    v_title := left(trim(COALESCE(p_payload->>'title', '')), 160);
    SELECT id, status INTO v_task, v_before
    FROM public.tasks
    WHERE status NOT IN ('completed', 'cancelled')
      AND title ILIKE '%' || replace(v_title, '%', '') || '%'
    ORDER BY due_date NULLS LAST
    LIMIT 1;
    IF v_task IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'code', 'not_found');
    END IF;
    UPDATE public.tasks SET status = 'completed', completed_at = p_now WHERE id = v_task;
    INSERT INTO public.ops_bot_activity (bot_id, key_id, action, table_name, record_id, before_data, after_data, reversible)
    VALUES (v_bot.id, v_key.id, 'tasks.complete', 'tasks', v_task::text, jsonb_build_object('status', v_before), jsonb_build_object('status', 'completed'), true)
    RETURNING id INTO v_activity;
    UPDATE public.ops_bot_keys SET last_used_at = p_now WHERE id = v_key.id;
    RETURN jsonb_build_object('ok', true, 'effect', 'allow', 'activity_id', v_activity);
  END IF;

  INSERT INTO public.ops_bot_activity (bot_id, key_id, action, table_name, record_id, before_data, after_data, reversible)
  VALUES (v_bot.id, v_key.id, 'voice.query', 'voice', v_bot.id::text, NULL, jsonb_build_object('intent', left(COALESCE(p_payload->>'intent', 'unknown'), 40)), false)
  RETURNING id INTO v_activity;
  UPDATE public.ops_bot_keys SET last_used_at = p_now WHERE id = v_key.id;
  RETURN jsonb_build_object('ok', true, 'effect', 'allow', 'activity_id', v_activity);
END;
$$;

REVOKE ALL ON FUNCTION public.bot_record_voice(text, text, jsonb, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bot_record_voice(text, text, jsonb, timestamptz) TO service_role;

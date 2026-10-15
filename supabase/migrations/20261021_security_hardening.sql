-- Security hardening (Supabase security advisor follow-up). Idempotent.
--
-- 1. Analytics views run with the caller's rights (security_invoker).
-- 2. Security definer functions: EXECUTE revoked from PUBLIC/anon unless a
--    logged-out code path needs it. Trigger / event-trigger functions are
--    revoked from anon AND authenticated (triggers fire regardless of EXECUTE).
-- 3. Fixed search_path on public functions that lacked one.
-- 4. Catalog writes restricted to staff / products+catalog permission holders.
-- 5. Missing permission checks added to authenticated RPCs.

-- ---------------------------------------------------------------------------
-- 1. Views
-- ---------------------------------------------------------------------------
DO $$
DECLARE v text;
BEGIN
  FOREACH v IN ARRAY ARRAY['view_revenue_daily','view_revenue_monthly','view_popular_items',
                           'view_order_status_distribution','view_lead_conversion'] LOOP
    IF to_regclass('public.' || v) IS NOT NULL THEN
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', v);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 5 (first, so later grants apply to the new bodies). Permission checks.
-- ---------------------------------------------------------------------------

-- toggle_conversation_archive used to INSERT a participant row for ANY
-- conversation id, which then granted read access via is_participant_of_conversation.
CREATE OR REPLACE FUNCTION public.toggle_conversation_archive(p_conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_status boolean;
  v_new_status boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT public.is_participant_of_conversation(p_conversation_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT is_archived INTO v_current_status
  FROM conversation_participants
  WHERE conversation_id = p_conversation_id AND user_id = auth.uid();

  IF v_current_status IS NULL THEN
    INSERT INTO conversation_participants (conversation_id, user_id, is_archived)
    VALUES (p_conversation_id, auth.uid(), true)
    RETURNING is_archived INTO v_new_status;
    RETURN v_new_status;
  END IF;

  v_new_status := NOT v_current_status;
  UPDATE conversation_participants
  SET is_archived = v_new_status
  WHERE conversation_id = p_conversation_id AND user_id = auth.uid();
  RETURN v_new_status;
END;
$$;

-- create_new_conversation: require a signed-in caller (auth.uid() was assumed).
DO $$
BEGIN
  IF to_regprocedure('public.create_new_conversation(text,text,text,uuid[])') IS NOT NULL THEN
    EXECUTE $f$
    CREATE OR REPLACE FUNCTION public.create_new_conversation(
      p_type text, p_subject text DEFAULT NULL, p_message text DEFAULT NULL,
      p_participant_ids uuid[] DEFAULT ARRAY[]::uuid[])
    RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $b$
    DECLARE
      v_conversation_id uuid;
      v_participant_id uuid;
    BEGIN
      IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
      END IF;
      INSERT INTO conversations (type, subject, created_by)
      VALUES (p_type, p_subject, auth.uid())
      RETURNING id INTO v_conversation_id;
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES (v_conversation_id, auth.uid());
      IF p_participant_ids IS NOT NULL THEN
        FOREACH v_participant_id IN ARRAY p_participant_ids LOOP
          IF v_participant_id != auth.uid() THEN
            INSERT INTO conversation_participants (conversation_id, user_id)
            VALUES (v_conversation_id, v_participant_id)
            ON CONFLICT DO NOTHING;
          END IF;
        END LOOP;
      END IF;
      IF p_message IS NOT NULL AND length(p_message) > 0 THEN
        INSERT INTO messages (conversation_id, sender_id, content)
        VALUES (v_conversation_id, auth.uid(), p_message);
      END IF;
      RETURN v_conversation_id;
    END;
    $b$;
    $f$;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.create_new_conversation(
  p_type text, p_subject text DEFAULT NULL, p_message text DEFAULT NULL,
  p_participant_ids uuid[] DEFAULT ARRAY[]::uuid[], p_target_role_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_conversation_id uuid;
  v_participant_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  INSERT INTO conversations (type, subject, created_by, target_role_id)
  VALUES (p_type, p_subject, auth.uid(), p_target_role_id)
  RETURNING id INTO v_conversation_id;
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (v_conversation_id, auth.uid());
  IF p_participant_ids IS NOT NULL THEN
    FOREACH v_participant_id IN ARRAY p_participant_ids LOOP
      IF v_participant_id != auth.uid() THEN
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (v_conversation_id, v_participant_id)
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  IF p_message IS NOT NULL AND length(p_message) > 0 THEN
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (v_conversation_id, auth.uid(), p_message);
  END IF;
  RETURN v_conversation_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. EXECUTE grants on security definer functions
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  f text;
  -- Signed-in only: revoke PUBLIC + anon, keep authenticated.
  signed_in text[] := ARRAY[
    'public.client_add_document(uuid,text,text)',
    'public.client_can_read_lead(uuid)',
    'public.client_complete_task(uuid)',
    'public.client_record_change(uuid,text,text)',
    'public.client_send_message(uuid,text)',
    'public.client_sign_contract(uuid,text)',
    'public.client_update_details(uuid,integer,text)',
    'public.create_new_conversation(text,text,text,uuid[])',
    'public.create_new_conversation(text,text,text,uuid[],uuid)',
    'public.customer_claim_orders()',
    'public.customer_sign_order(uuid,text)',
    'public.get_user_by_email(text)',
    'public.search_users(text)',
    'public.toggle_conversation_archive(uuid)',
    'public.is_conversation_participant(uuid,uuid)',
    'public.permission_catalog_ready()',
    'public.bot_decide_approval(uuid,text)',
    'public.bot_undo_activity(uuid)'
  ];
  -- Triggers / event triggers: nobody calls these over the API.
  triggers text[] := ARRAY[
    'public.create_low_stock_maintenance_task()',
    'public.handle_new_user()',
    'public.notify_message_recipients()',
    'public.notify_task_assignment()',
    'public.notify_warehouse_task_due()',
    'public.record_audit_log()',
    'public.record_bot_audit()',
    'public.rls_auto_enable()',
    'public.update_conversation_timestamp()'
  ];
BEGIN
  FOREACH f IN ARRAY signed_in LOOP
    IF to_regprocedure(f) IS NOT NULL THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', f);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', f);
    END IF;
  END LOOP;
  FOREACH f IN ARRAY triggers LOOP
    IF to_regprocedure(f) IS NOT NULL THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    END IF;
  END LOOP;
END $$;
-- Deliberately left callable by anon (RLS helpers referenced by policies that
-- apply to the public role, e.g. "Published venues are public"; they only
-- inspect auth.uid() and return false for logged-out callers):
--   is_admin(), is_staff(), has_permission(text), has_named_permission(text),
--   can_manage_venue_crm(), is_participant_of_conversation(uuid)

-- ---------------------------------------------------------------------------
-- 3. Fixed search_path on functions without one
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND d.objid IS NULL
      AND p.proname IN ('update_updated_at_column','generate_product_slug','check_product_availability',
        'notify_new_order','check_overbooking_on_reservation','check_low_stock',
        'is_participant_of_conversation','record_audit_log','notify_task_assignment','handle_new_user',
        'notify_message_recipients','notify_warehouse_task_due','create_low_stock_maintenance_task',
        'venue_hold_conflicts')
      AND NOT EXISTS (SELECT 1 FROM unnest(coalesce(p.proconfig, '{}')) c WHERE c LIKE 'search_path=%')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', r.sig);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Catalog write policies: staff / permission holders only
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated can write products" ON public.products;
DROP POLICY IF EXISTS "Authenticated can write categories" ON public.categories;
DROP POLICY IF EXISTS "Staff can write products" ON public.products;
DROP POLICY IF EXISTS "Staff can write categories" ON public.categories;

CREATE POLICY "Staff can write products"
  ON public.products FOR ALL TO authenticated
  USING (public.is_staff() OR public.has_named_permission('products.update') OR public.has_named_permission('catalog.update'))
  WITH CHECK (public.is_staff() OR public.has_named_permission('products.update') OR public.has_named_permission('catalog.update'));

CREATE POLICY "Staff can write categories"
  ON public.categories FOR ALL TO authenticated
  USING (public.is_staff() OR public.has_named_permission('catalog.update') OR public.has_named_permission('products.update'))
  WITH CHECK (public.is_staff() OR public.has_named_permission('catalog.update') OR public.has_named_permission('products.update'));

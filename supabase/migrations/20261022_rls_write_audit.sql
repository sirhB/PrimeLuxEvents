-- RLS write-policy audit. Idempotent.
-- Replaces write policies whose check was only auth.role() = 'authenticated' /
-- WITH CHECK (true) with staff / permission checks, and closes the
-- "add yourself to any conversation" hole on conversation_participants.
-- Legit self-service is untouched: own profile, own appointments, favorites,
-- partner applications/carts, and messages in conversations you belong to.

-- Helper: staff or holder of a named permission (super_admin and *.manage via has_named_permission)
CREATE OR REPLACE FUNCTION public.is_staff_or_permitted(target text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT public.is_staff() OR public.is_admin() OR public.has_named_permission(target);
$$;

DO $$
DECLARE
  t record;
BEGIN
  -- table, legacy policies to drop, new policy name, permission
  FOR t IN
    SELECT * FROM (VALUES
      ('content',                     ARRAY['Admins can insert content.','Admins can update content.','Staff can insert content','Staff can update content'], 'Staff can write content', 'content.update'),
      ('categories',                  ARRAY['Admins can insert categories.','Admins can update categories.','Admins can delete categories.'], NULL, NULL),
      ('products',                    ARRAY['Users can insert their own products.','Users can update their own products.','Users can delete their own products.'], NULL, NULL),
      ('packages',                    ARRAY['Admins can insert packages.','Admins can update packages.','Admins can delete packages.'], 'Staff can write packages', 'products.update'),
      ('package_items',               ARRAY['Admins can insert package items.','Admins can update package items.','Admins can delete package items.'], 'Staff can write package items', 'products.update'),
      ('consultation_communications', ARRAY['Admins can insert consultation communications.','Admins can update consultation communications.','Admins can delete consultation communications.'], 'Staff can write consultation communications', 'consultations.update'),
      ('rental_reservations',         ARRAY['Admins can insert reservations.','Admins can update reservations.','Staff can insert rental reservations'], 'Staff can write rental reservations', 'orders.update'),
      ('tiered_discounts',            ARRAY['Admins can manage tiered_discounts'], 'Staff can write tiered discounts', 'discounts.update'),
      ('bag_catalog_items',           ARRAY['Admins can manage bag catalog items'], 'Staff can write bag catalog items', 'products.update')
    ) AS v(tbl, old_policies, new_policy, perm)
  LOOP
    IF to_regclass('public.' || t.tbl) IS NULL THEN
      CONTINUE;
    END IF;
    IF t.new_policy IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t.new_policy, t.tbl);
    END IF;
    FOR i IN 1 .. coalesce(array_length(t.old_policies, 1), 0) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t.old_policies[i], t.tbl);
    END LOOP;
    IF t.new_policy IS NOT NULL THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_staff_or_permitted(%L)) WITH CHECK (public.is_staff_or_permitted(%L))',
        t.new_policy, t.tbl, t.perm, t.perm);
    END IF;
  END LOOP;
END $$;
-- categories / products writes are covered by "Staff can write categories/products"
-- from 20261021_security_hardening.

-- conversation_participants: previously anyone could insert (user_id = auth.uid())
-- into ANY conversation, gaining read access. Now: the conversation creator can add
-- people; a user can add their own row only if they already have access
-- (e.g. via target role); staff can manage.
DO $$
BEGIN
  IF to_regclass('public.conversation_participants') IS NOT NULL THEN
    DROP POLICY IF EXISTS insert_participants ON public.conversation_participants;
    CREATE POLICY insert_participants ON public.conversation_participants
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.conversations c
                WHERE c.id = conversation_participants.conversation_id
                  AND c.created_by = auth.uid())
        OR (user_id = auth.uid() AND public.is_participant_of_conversation(conversation_id))
        OR public.is_staff()
      );
  END IF;
END $$;

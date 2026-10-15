-- Venue suite and plan-your-event intake.
-- Public writes go through service-role server actions. Staff read and update under RLS.

CREATE OR REPLACE FUNCTION public.can_manage_venue_crm()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

CREATE TABLE IF NOT EXISTS public.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  neighborhood text,
  city text,
  capacity integer,
  description text,
  image_url text,
  amenities text[] DEFAULT '{}',
  published boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_date date,
  guest_count integer,
  venue_choice text,
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  venue_name text,
  services text[] DEFAULT '{}',
  rentals text[] DEFAULT '{}',
  budget_range text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  notes text,
  status text DEFAULT 'new' NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.venue_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  venue_name text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  event_date date,
  guest_count integer,
  stage text DEFAULT 'new' NOT NULL,
  source text,
  event_plan_id uuid REFERENCES public.event_plans(id) ON DELETE SET NULL,
  notes_preview text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.venue_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.venue_leads(id) ON DELETE CASCADE NOT NULL,
  body text NOT NULL,
  author_name text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.venue_tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.venue_leads(id) ON DELETE CASCADE NOT NULL,
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  status text DEFAULT 'scheduled' NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.venue_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.venue_leads(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  status text DEFAULT 'hold' NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.venue_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  day date NOT NULL,
  status text DEFAULT 'open' NOT NULL,
  UNIQUE (venue_id, day)
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published venues are public" ON public.venues;
CREATE POLICY "Published venues are public"
  ON public.venues FOR SELECT
  USING (published = true OR public.can_manage_venue_crm());

DROP POLICY IF EXISTS "Staff manage venues" ON public.venues;
CREATE POLICY "Staff manage venues"
  ON public.venues FOR ALL
  TO authenticated
  USING (public.can_manage_venue_crm())
  WITH CHECK (public.can_manage_venue_crm());

DROP POLICY IF EXISTS "Staff read event plans" ON public.event_plans;
CREATE POLICY "Staff read event plans"
  ON public.event_plans FOR SELECT
  TO authenticated
  USING (public.can_manage_venue_crm() OR public.is_staff());

DROP POLICY IF EXISTS "Staff update event plans" ON public.event_plans;
CREATE POLICY "Staff update event plans"
  ON public.event_plans FOR UPDATE
  TO authenticated
  USING (public.can_manage_venue_crm() OR public.is_staff())
  WITH CHECK (public.can_manage_venue_crm() OR public.is_staff());

DROP POLICY IF EXISTS "Staff read venue leads" ON public.venue_leads;
CREATE POLICY "Staff read venue leads"
  ON public.venue_leads FOR SELECT TO authenticated
  USING (public.can_manage_venue_crm());
DROP POLICY IF EXISTS "Staff write venue leads" ON public.venue_leads;
CREATE POLICY "Staff write venue leads"
  ON public.venue_leads FOR ALL TO authenticated
  USING (public.can_manage_venue_crm())
  WITH CHECK (public.can_manage_venue_crm());

DROP POLICY IF EXISTS "Staff manage venue notes" ON public.venue_notes;
CREATE POLICY "Staff manage venue notes"
  ON public.venue_notes FOR ALL TO authenticated
  USING (public.can_manage_venue_crm())
  WITH CHECK (public.can_manage_venue_crm());

DROP POLICY IF EXISTS "Staff manage venue tours" ON public.venue_tours;
CREATE POLICY "Staff manage venue tours"
  ON public.venue_tours FOR ALL TO authenticated
  USING (public.can_manage_venue_crm())
  WITH CHECK (public.can_manage_venue_crm());

DROP POLICY IF EXISTS "Staff manage venue bookings" ON public.venue_bookings;
CREATE POLICY "Staff manage venue bookings"
  ON public.venue_bookings FOR ALL TO authenticated
  USING (public.can_manage_venue_crm())
  WITH CHECK (public.can_manage_venue_crm());

DROP POLICY IF EXISTS "Public read venue availability" ON public.venue_availability;
CREATE POLICY "Public read venue availability"
  ON public.venue_availability FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Staff manage venue availability" ON public.venue_availability;
CREATE POLICY "Staff manage venue availability"
  ON public.venue_availability FOR ALL TO authenticated
  USING (public.can_manage_venue_crm())
  WITH CHECK (public.can_manage_venue_crm());

INSERT INTO public.venues (id, slug, name, neighborhood, city, capacity, description, image_url, amenities, published) VALUES
  ('11111111-1111-4111-8111-111111111111', 'the-conservatory', 'The Conservatory', 'Shelton', 'Connecticut', 180,
   'A glass-roofed room with pale stone underfoot. Daylight does most of the decorating.',
   '/images/suites/venue-conservatory.jpg', ARRAY['Ceremony lawn approach','In-house power','Bridal room','Street parking'], true),
  ('22222222-2222-4222-8222-222222222222', 'the-gallery', 'The Gallery', 'Shelton', 'Connecticut', 90,
   'Tall white walls and one chandelier. Built for dinners and evenings that should feel edited.',
   '/images/suites/venue-gallery.jpg', ARRAY['Dimmer lighting','Gallery walls','Service entrance','Coat room'], true),
  ('33333333-3333-4333-8333-333333333333', 'the-garden-court', 'The Garden Court', 'Shelton', 'Connecticut', 140,
   'A clipped courtyard and a stone terrace, with a covered loggia when the weather turns.',
   '/images/suites/venue-garden.jpg', ARRAY['Terrace','Loggia','Twilight lighting','Guest parking'], true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO permissions (name, display_name, description, resource, action) VALUES
  ('venues.view', 'View Venues', 'Venue listings and the venue CRM', 'venues', 'view'),
  ('venues.create', 'Create Venues', 'Venue listings and the venue CRM', 'venues', 'create'),
  ('venues.update', 'Update Venues', 'Venue listings and the venue CRM', 'venues', 'update'),
  ('venues.delete', 'Delete Venues', 'Venue listings and the venue CRM', 'venues', 'delete'),
  ('venues.manage', 'Manage Venues', 'Venue listings and the venue CRM', 'venues', 'manage')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.resource = 'venues'
WHERE r.name IN ('super_admin', 'admin', 'manager')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('venues.view', 'venues.create', 'venues.update')
WHERE r.name IN ('staff', 'coordinator')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name = 'venues.view'
WHERE r.name = 'viewer'
ON CONFLICT (role_id, permission_id) DO NOTHING;

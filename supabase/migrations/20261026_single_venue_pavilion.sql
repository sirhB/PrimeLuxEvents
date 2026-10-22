-- Single venue: Prime Lux Pavilion replaces the three placeholder rooms.
-- Safe and idempotent: inserts the Pavilion, repoints any references from the
-- old room ids, and unpublishes (does NOT delete) the old rows.
-- Live check on 2026-10-22: zero rows in event_plans, venue_leads, venue_tours,
-- venue_bookings, venue_availability referenced the old rooms.
-- Capacity 344 is from a public listing, pending owner confirmation.

BEGIN;

INSERT INTO public.venues (id, slug, name, neighborhood, city, capacity, description, image_url, amenities, published)
VALUES (
  '44444444-4444-4444-8444-444444444444', 'prime-lux-pavilion', 'Prime Lux Pavilion', 'Shelton', 'Connecticut', 344,
  NULL, '/images/venue/pavilion-hall.jpg', '{}', true
)
ON CONFLICT (slug) DO UPDATE SET published = true;

UPDATE public.event_plans    SET venue_id = '44444444-4444-4444-8444-444444444444', venue_name = 'Prime Lux Pavilion'
  WHERE venue_id IN ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333');
UPDATE public.venue_leads    SET venue_id = '44444444-4444-4444-8444-444444444444', venue_name = 'Prime Lux Pavilion'
  WHERE venue_id IN ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333');
UPDATE public.venue_tours    SET venue_id = '44444444-4444-4444-8444-444444444444', venue_name = 'Prime Lux Pavilion'
  WHERE venue_id IN ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333');
UPDATE public.venue_bookings SET venue_id = '44444444-4444-4444-8444-444444444444', venue_name = 'Prime Lux Pavilion'
  WHERE venue_id IN ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333');

-- Availability is unique per (venue_id, day): move rows only where the Pavilion has no row that day.
-- Any leftover duplicates stay on the unpublished old rooms (not deleted).
UPDATE public.venue_availability a SET venue_id = '44444444-4444-4444-8444-444444444444'
  WHERE a.venue_id IN ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333')
    AND a.id = (SELECT min(b.id::text)::uuid FROM public.venue_availability b
                WHERE b.day = a.day AND b.venue_id IN ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333'))
    AND NOT EXISTS (SELECT 1 FROM public.venue_availability p WHERE p.venue_id = '44444444-4444-4444-8444-444444444444' AND p.day = a.day);

UPDATE public.venues SET published = false
  WHERE id IN ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333');

COMMIT;

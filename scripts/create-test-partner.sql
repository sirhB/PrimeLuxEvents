-- Create an active Preferred Vendor partner for local / staging testing.
-- Run in the Supabase SQL editor (service role / postgres).
--
-- Prerequisites:
--   1. Partner portal migrations applied (20260828_partner_portal.sql + branding).
--   2. An auth user already exists (sign up in the app, or create via Auth dashboard).
--
-- Usage:
--   1. Set v_email below to that user's email.
--   2. Optionally tweak company / tier / payment fields.
--   3. Run the whole script.
--
-- Login as that user afterward to exercise /account/partner and share-cart flows.

DO $$
DECLARE
  -- >>> edit these <<<
  v_email text := 'partner@example.com';
  v_password_hint text := '(use the password you set when creating this auth user)';
  v_company_name text := 'Test Events Co';
  v_business_type text := 'planner'; -- planner | decorator | designer | other
  v_tier text := 'preferred';         -- preferred | elite | house
  v_phone text := '555-0100';
  -- <<< end edit >>>

  v_user_id uuid;
  v_partner_id uuid;
  v_role_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(v_email)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION
      'No auth.users row for %. Create the user in Auth (or sign up), then re-run. %',
      v_email,
      v_password_hint;
  END IF;

  -- Ensure public profile exists (needed for user_roles FK)
  INSERT INTO user_profiles (id, email, full_name, phone, is_active)
  VALUES (v_user_id, v_email, v_company_name, v_phone, true)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(user_profiles.full_name, EXCLUDED.full_name),
        phone = COALESCE(user_profiles.phone, EXCLUDED.phone),
        is_active = true;

  -- Ensure partner role exists
  INSERT INTO roles (name, display_name, description, color, is_system_role)
  VALUES (
    'partner',
    'Preferred Partner',
    'Event planner or decorator in the Preferred Vendor program',
    '#a67c52',
    true
  )
  ON CONFLICT (name) DO NOTHING;

  SELECT id INTO v_role_id FROM roles WHERE name = 'partner';

  -- Partner profile (active so portal gates pass)
  INSERT INTO partner_profiles (
    user_id,
    company_name,
    business_type,
    phone,
    website,
    instagram,
    status,
    tier,
    payment_zelle,
    payment_venmo,
    payment_instructions,
    brand_display_name,
    brand_tagline,
    brand_accent_color,
    business_email,
    business_city,
    business_region,
    invoice_footer_note,
    approved_at
  )
  VALUES (
    v_user_id,
    v_company_name,
    v_business_type,
    v_phone,
    'https://example.com',
    '@testevents',
    'active',
    v_tier,
    'test-events@zelle',
    '@testevents',
    'Pay Test Events Co via Zelle or Venmo. Reference your event date.',
    v_company_name,
    'Preferred vendor test account',
    '#1c1917',
    v_email,
    'Austin',
    'TX',
    'Thank you for choosing Test Events Co.',
    timezone('utc'::text, now())
  )
  ON CONFLICT (user_id) DO UPDATE
    SET company_name = EXCLUDED.company_name,
        business_type = EXCLUDED.business_type,
        phone = EXCLUDED.phone,
        website = EXCLUDED.website,
        instagram = EXCLUDED.instagram,
        status = 'active',
        tier = EXCLUDED.tier,
        payment_zelle = EXCLUDED.payment_zelle,
        payment_venmo = EXCLUDED.payment_venmo,
        payment_instructions = EXCLUDED.payment_instructions,
        brand_display_name = EXCLUDED.brand_display_name,
        brand_tagline = EXCLUDED.brand_tagline,
        brand_accent_color = EXCLUDED.brand_accent_color,
        business_email = EXCLUDED.business_email,
        business_city = EXCLUDED.business_city,
        business_region = EXCLUDED.business_region,
        invoice_footer_note = EXCLUDED.invoice_footer_note,
        approved_at = COALESCE(partner_profiles.approved_at, EXCLUDED.approved_at)
  RETURNING id INTO v_partner_id;

  IF v_partner_id IS NULL THEN
    SELECT id INTO v_partner_id FROM partner_profiles WHERE user_id = v_user_id;
  END IF;

  -- Assign partner role (same as admin approve path)
  INSERT INTO user_roles (user_id, role_id)
  VALUES (v_user_id, v_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RAISE NOTICE 'Active partner ready: partner_id=% user_id=% email=% tier=%',
    v_partner_id, v_user_id, v_email, v_tier;
END $$;

-- Verify (most recently updated partners)
SELECT
  pp.id AS partner_id,
  pp.company_name,
  pp.status,
  pp.tier,
  pp.business_type,
  up.email,
  r.name AS role_name,
  pp.updated_at
FROM partner_profiles pp
JOIN user_profiles up ON up.id = pp.user_id
LEFT JOIN user_roles ur ON ur.user_id = pp.user_id
LEFT JOIN roles r ON r.id = ur.role_id AND r.name = 'partner'
ORDER BY pp.updated_at DESC
LIMIT 5;

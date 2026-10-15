-- White-label invoice branding for Preferred Vendor partners

ALTER TABLE partner_profiles
  ADD COLUMN IF NOT EXISTS brand_display_name text,
  ADD COLUMN IF NOT EXISTS brand_logo_url text,
  ADD COLUMN IF NOT EXISTS brand_accent_color text DEFAULT '#1c1917',
  ADD COLUMN IF NOT EXISTS brand_tagline text,
  ADD COLUMN IF NOT EXISTS business_email text,
  ADD COLUMN IF NOT EXISTS business_address text,
  ADD COLUMN IF NOT EXISTS business_city text,
  ADD COLUMN IF NOT EXISTS business_region text,
  ADD COLUMN IF NOT EXISTS business_postal text,
  ADD COLUMN IF NOT EXISTS invoice_footer_note text;

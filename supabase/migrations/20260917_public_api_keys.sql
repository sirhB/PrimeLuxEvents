-- Public partner API keys (hashed secrets) for read access to catalog data.
-- Raw keys are never stored; only SHA-256 digests + a short display prefix.

CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL DEFAULT ARRAY['catalog:read']::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT api_keys_name_not_blank CHECK (char_length(trim(name)) > 0),
  CONSTRAINT api_keys_prefix_not_blank CHECK (char_length(trim(key_prefix)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_active
  ON public.api_keys (is_active)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_api_keys_prefix
  ON public.api_keys (key_prefix);

DROP TRIGGER IF EXISTS update_api_keys_modtime ON public.api_keys;
CREATE TRIGGER update_api_keys_modtime
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: all access goes through the service-role server.
DROP POLICY IF EXISTS "No direct client access to api_keys" ON public.api_keys;

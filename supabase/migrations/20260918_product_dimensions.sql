-- Add Height & Width to products, then backfill from name/description text.
-- Strip dimension phrases from description only when they appear in description
-- and NOT in the product name.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS height text,
  ADD COLUMN IF NOT EXISTS width text;

COMMENT ON COLUMN products.height IS 'Product height display value (e.g. 6 ft, 52")';
COMMENT ON COLUMN products.width IS 'Product width display value (e.g. 8 ft, 48")';

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._plx_norm_unit(u text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(trim(both FROM coalesce(u, '')))
    WHEN 'feet' THEN 'ft'
    WHEN 'foot' THEN 'ft'
    WHEN 'ft' THEN 'ft'
    WHEN '''' THEN 'ft'
    WHEN 'inches' THEN 'in'
    WHEN 'inch' THEN 'in'
    WHEN 'in' THEN 'in'
    WHEN '"' THEN 'in'
    WHEN 'cm' THEN 'cm'
    WHEN 'mm' THEN 'mm'
    ELSE nullif(trim(both FROM coalesce(u, '')), '')
  END;
$$;

CREATE OR REPLACE FUNCTION public._plx_fmt_dim(n text, u text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE public._plx_norm_unit(u)
    WHEN 'in' THEN n || '"'
    WHEN 'ft' THEN n || ' ft'
    WHEN NULL THEN n
    ELSE n || ' ' || public._plx_norm_unit(u)
  END;
$$;

-- ---------------------------------------------------------------------------
-- Backfill: labeled H / W in name or description (e.g. 84"H X 48"W)
-- ---------------------------------------------------------------------------
UPDATE products p
SET
  height = COALESCE(
    p.height,
    public._plx_fmt_dim(
      (regexp_match(coalesce(p.name, '') || ' ' || coalesce(p.description, ''),
        '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[Hh](?:eight)?',
        'i'))[1],
      (regexp_match(coalesce(p.name, '') || ' ' || coalesce(p.description, ''),
        '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[Hh](?:eight)?',
        'i'))[2]
    )
  ),
  width = COALESCE(
    p.width,
    public._plx_fmt_dim(
      (regexp_match(coalesce(p.name, '') || ' ' || coalesce(p.description, ''),
        '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[Ww](?:idth)?',
        'i'))[1],
      (regexp_match(coalesce(p.name, '') || ' ' || coalesce(p.description, ''),
        '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[Ww](?:idth)?',
        'i'))[2]
    )
  )
WHERE p.height IS NULL OR p.width IS NULL;

-- ---------------------------------------------------------------------------
-- Backfill: verbal wide / tall / high (e.g. 12 ft wide x 10 ft high)
-- ---------------------------------------------------------------------------
UPDATE products p
SET
  width = COALESCE(
    p.width,
    public._plx_fmt_dim(
      (regexp_match(coalesce(p.name, '') || ' ' || coalesce(p.description, ''),
        '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*(?:wide|width)\b',
        'i'))[1],
      (regexp_match(coalesce(p.name, '') || ' ' || coalesce(p.description, ''),
        '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*(?:wide|width)\b',
        'i'))[2]
    )
  ),
  height = COALESCE(
    p.height,
    public._plx_fmt_dim(
      (regexp_match(coalesce(p.name, '') || ' ' || coalesce(p.description, ''),
        '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*(?:tall|high|height)\b',
        'i'))[1],
      (regexp_match(coalesce(p.name, '') || ' ' || coalesce(p.description, ''),
        '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*(?:tall|high|height)\b',
        'i'))[2]
    )
  )
WHERE p.height IS NULL OR p.width IS NULL;

-- ---------------------------------------------------------------------------
-- Backfill: unlabeled A x B → width × height (name preferred)
-- ---------------------------------------------------------------------------
UPDATE products p
SET
  width = COALESCE(
    p.width,
    public._plx_fmt_dim(
      (regexp_match(coalesce(p.name, p.description),
        '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
        'i'))[1],
      COALESCE(
        (regexp_match(coalesce(p.name, p.description),
          '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
          'i'))[2],
        (regexp_match(coalesce(p.name, p.description),
          '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
          'i'))[4]
      )
    )
  ),
  height = COALESCE(
    p.height,
    public._plx_fmt_dim(
      (regexp_match(coalesce(p.name, p.description),
        '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
        'i'))[3],
      COALESCE(
        (regexp_match(coalesce(p.name, p.description),
          '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
          'i'))[4],
        (regexp_match(coalesce(p.name, p.description),
          '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
          'i'))[2]
      )
    )
  )
WHERE (p.height IS NULL OR p.width IS NULL)
  AND coalesce(p.name, p.description) ~* '\d+(?:\.\d+)?\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*\d+';

-- Fall back to description when name has no pair
UPDATE products p
SET
  width = COALESCE(
    p.width,
    public._plx_fmt_dim(
      (regexp_match(p.description,
        '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
        'i'))[1],
      COALESCE(
        (regexp_match(p.description,
          '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
          'i'))[2],
        (regexp_match(p.description,
          '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
          'i'))[4]
      )
    )
  ),
  height = COALESCE(
    p.height,
    public._plx_fmt_dim(
      (regexp_match(p.description,
        '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
        'i'))[3],
      COALESCE(
        (regexp_match(p.description,
          '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
          'i'))[4],
        (regexp_match(p.description,
          '(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
          'i'))[2]
      )
    )
  )
WHERE (p.height IS NULL OR p.width IS NULL)
  AND p.description ~* '\d+(?:\.\d+)?\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*\d+'
  AND coalesce(p.name, '') !~* '\d+(?:\.\d+)?\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*\d+';

-- ---------------------------------------------------------------------------
-- Backfill: single trailing size in name (e.g. Moon 7ft) → height
-- ---------------------------------------------------------------------------
UPDATE products p
SET height = COALESCE(
  p.height,
  public._plx_fmt_dim(
    (regexp_match(p.name, '(\d+(?:\.\d+)?)\s*(ft|feet|foot)\b', 'i'))[1],
    (regexp_match(p.name, '(\d+(?:\.\d+)?)\s*(ft|feet|foot)\b', 'i'))[2]
  )
)
WHERE p.height IS NULL
  AND p.width IS NULL
  AND p.name ~* '\d+(?:\.\d+)?\s*(ft|feet|foot)\b'
  AND p.name !~* '[x×]';

-- ---------------------------------------------------------------------------
-- Strip dimension phrases from description when NOT present in the name
-- ---------------------------------------------------------------------------
UPDATE products p
SET description = nullif(
  trim(both FROM regexp_replace(
    regexp_replace(
      regexp_replace(
        p.description,
        '(?i)(?:Dimensions|Size|Measurements?)\s*:\s*[^\n.]*',
        ' ',
        'g'
      ),
      '(?i)\d+(?:\.\d+)?\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*\d+(?:\.\d+)?\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?',
      ' ',
      'g'
    ),
    '\s{2,}',
    ' ',
    'g'
  )),
  ''
)
WHERE p.description IS NOT NULL
  AND (
    p.description ~* '(?i)(?:Dimensions|Size|Measurements?)\s*:'
    OR p.description ~* '\d+(?:\.\d+)?\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*\d+'
    OR p.description ~* '(?i)\d+(?:\.\d+)?\s*(ft|feet|foot)\s*(?:tall|high)\b'
  )
  -- Only strip when name does not already carry dimension cues
  AND coalesce(p.name, '') !~* '\d+(?:\.\d+)?\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[x×]\s*\d+'
  AND coalesce(p.name, '') !~* '(?i)\d+(?:\.\d+)?\s*(ft|feet|foot|in|inch|inches|cm|mm|["''])?\s*[HhWw]'
  AND coalesce(p.name, '') !~* '(?i)\d+(?:\.\d+)?\s*(ft|feet|foot)\b'
  AND (p.height IS NOT NULL OR p.width IS NOT NULL);

DROP FUNCTION IF EXISTS public._plx_fmt_dim(text, text);
DROP FUNCTION IF EXISTS public._plx_norm_unit(text);

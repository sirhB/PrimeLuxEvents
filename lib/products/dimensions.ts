/**
 * Extract Height & Width from product name/description text.
 *
 * Rules:
 * - Prefer labeled dimensions (H/W, tall/high/wide).
 * - Unlabeled "A x B" → width × height.
 * - Single size like "7ft" / "6ft tall" → height.
 * - Strip dimension text from description only when dims came from
 *   description and were NOT also present in the name.
 */

export type ProductDimensions = {
  height: string | null
  width: string | null
}

export type DimensionExtraction = ProductDimensions & {
  /** Description after removing dimension phrases (when stripping applies) */
  cleanedDescription: string | null
  /** True when description should be replaced with cleanedDescription */
  shouldStripDescription: boolean
  /** Whether any dimension was found in the name */
  foundInName: boolean
  /** Whether any dimension was found in the description */
  foundInDescription: boolean
}

const UNIT = String.raw`(?:ft|feet|foot|in|inch|inches|cm|mm|["''′″])`
const NUM = String.raw`\d+(?:\.\d+)?`

function normalizeUnit(raw: string): string {
  const u = raw.replace(/[′'']/g, "'").replace(/[″"]/g, '"').toLowerCase()
  if (u === 'feet' || u === 'foot' || u === 'ft' || u === "'") return 'ft'
  if (u === 'inches' || u === 'inch' || u === 'in' || u === '"') return 'in'
  if (u === 'cm') return 'cm'
  if (u === 'mm') return 'mm'
  return raw
}

function formatDim(num: string, unitRaw?: string | null): string {
  const n = num.trim()
  if (!unitRaw) return n
  const unit = normalizeUnit(unitRaw)
  if (unit === 'in') return `${n}"`
  if (unit === 'ft') return `${n} ft`
  return `${n} ${unit}`
}

type PartialDims = { height?: string | null; width?: string | null }

function mergeDims(base: PartialDims, next: PartialDims): PartialDims {
  return {
    height: base.height || next.height || null,
    width: base.width || next.width || null,
  }
}

type MatchResult = PartialDims & { matches: string[] }

/** Labeled width / height tokens anywhere in text */
function extractLabeled(text: string): MatchResult {
  const matches: string[] = []
  let height: string | null = null
  let width: string | null = null

  // 84"H / 48"W / 84”H X 48”W  (label may be glued to the next word)
  // Avoid the `i` flag so (?![a-z]) still allows uppercase glue like WArches.
  const hwCompact = new RegExp(
    String.raw`(${NUM})\s*(${UNIT})?\s*([HhWw])(?:eight|idth)?(?![a-z])`,
    'g',
  )
  for (const m of text.matchAll(hwCompact)) {
    matches.push(m[0])
    const dim = formatDim(m[1], m[2])
    const label = m[3].toLowerCase()
    if (label === 'h') height = height || dim
    if (label === 'w') width = width || dim
  }

  // 8ft (W) x 8ft (H)
  const parenLabeled = new RegExp(
    String.raw`(${NUM})\s*(${UNIT})?\s*\(\s*([WwHh])\s*\)`,
    'g',
  )
  for (const m of text.matchAll(parenLabeled)) {
    matches.push(m[0])
    const dim = formatDim(m[1], m[2])
    const label = m[3].toLowerCase()
    if (label === 'h') height = height || dim
    if (label === 'w') width = width || dim
  }

  // 12 ft wide / 10 ft high / 6ft tall (may be glued: highStep)
  const verbal = new RegExp(
    String.raw`(${NUM})\s*(${UNIT})?\s*(?:([Ww]ide|[Ww]idth)|([Tt]all|[Hh]igh|[Hh]eight))(?![a-z])`,
    'g',
  )
  for (const m of text.matchAll(verbal)) {
    matches.push(m[0])
    const dim = formatDim(m[1], m[2])
    if (m[3]) width = width || dim
    if (m[4]) height = height || dim
  }

  return { height, width, matches }
}

/** "Dimensions: …" / "Size: …" blocks */
function extractDimensionBlocks(text: string): MatchResult {
  const matches: string[] = []
  let dims: PartialDims = {}

  // Capture label + following dimension-ish run; stop before a new sentence capital.
  const blockRe =
    /((?:Dimensions|Size|Measurements?)\s*:\s*)([^\n]*?)(?=(?:Materials|Inventory|Inclusions|Delivery|\.|\s+[A-Z][a-z]|$))/gi

  for (const m of text.matchAll(blockRe)) {
    const label = m[1]
    const inner = m[2]
    matches.push(label)

    const labeled = extractLabeled(inner)
    dims = mergeDims(dims, labeled)
    matches.push(...labeled.matches)

    if (!dims.height || !dims.width) {
      const pair = extractPair(inner)
      dims = mergeDims(dims, pair)
      matches.push(...pair.matches)
    }
    if (!dims.height && !dims.width) {
      const single = extractSingleHeight(inner)
      dims = mergeDims(dims, single)
      matches.push(...single.matches)
    }
  }

  return { ...dims, matches }
}

/** Unlabeled A x B → width × height */
function extractPair(text: string): MatchResult {
  const matches: string[] = []
  // 8x8ft / 6ft x 3ft / 8'x 8' / 48 x 79"
  const pairRe = new RegExp(
    String.raw`(${NUM})\s*(${UNIT})?\s*[x×]\s*(${NUM})\s*(${UNIT})?`,
    'i',
  )
  const m = text.match(pairRe)
  if (!m) return { height: null, width: null, matches }

  matches.push(m[0])
  const unitA = m[2] || m[4] || null
  const unitB = m[4] || m[2] || null
  return {
    width: formatDim(m[1], unitA),
    height: formatDim(m[3], unitB),
    matches,
  }
}

/** Single height cue: "7ft", "6ft tall" when no pair */
function extractSingleHeight(text: string): MatchResult {
  const matches: string[] = []
  const tallRe = new RegExp(
    String.raw`(${NUM})\s*(${UNIT})\s*(?:tall|high)?\b`,
    'i',
  )
  const m = text.match(tallRe)
  if (!m) return { height: null, width: null, matches }
  matches.push(m[0])
  return { height: formatDim(m[1], m[2]), width: null, matches }
}

function extractFromText(text: string | null | undefined): MatchResult {
  if (!text || !text.trim()) return { height: null, width: null, matches: [] }

  let dims: PartialDims = {}
  const matches: string[] = []

  const blocks = extractDimensionBlocks(text)
  dims = mergeDims(dims, blocks)
  matches.push(...blocks.matches)

  const labeled = extractLabeled(text)
  dims = mergeDims(dims, labeled)
  matches.push(...labeled.matches)

  if (!dims.height || !dims.width) {
    const pair = extractPair(text)
    dims = mergeDims(dims, pair)
    matches.push(...pair.matches)
  }

  if (!dims.height && !dims.width) {
    const single = extractSingleHeight(text)
    dims = mergeDims(dims, single)
    matches.push(...single.matches)
  }

  return {
    height: dims.height || null,
    width: dims.width || null,
    matches: [...new Set(matches.filter(Boolean))],
  }
}

function stripMatches(text: string, matches: string[]): string {
  let out = text
  const ordered = [...matches].sort((a, b) => b.length - a.length)
  for (const m of ordered) {
    if (!m) continue
    out = out.split(m).join(' ')
  }
  // Clean leftover labels and orphaned depth segments
  out = out
    .replace(/(?:Dimensions|Size|Measurements?)\s*:\s*/gi, ' ')
    .replace(/(?:^|\s)[x×X]\s*\d+(?:\.\d+)?\s*(?:ft|feet|in|inches|["''])?\s*(?:Depth|D)\b/gi, ' ')
    .replace(/\s*[x×X]\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/^[.\s,;:|x×X-]+|[.\s,;:|x×X-]+$/gi, '')
    .trim()
  return out
}

/**
 * Extract height/width from name and description.
 * Strip description only when dims were found in description and not in name.
 */
export function extractProductDimensions(
  name: string | null | undefined,
  description: string | null | undefined,
): DimensionExtraction {
  const fromName = extractFromText(name)
  const fromDesc = extractFromText(description)

  const foundInName = Boolean(fromName.height || fromName.width)
  const foundInDescription = Boolean(fromDesc.height || fromDesc.width)

  // Prefer labeled/name values; fill gaps from description
  const height = fromName.height || fromDesc.height || null
  const width = fromName.width || fromDesc.width || null

  const shouldStripDescription =
    foundInDescription && !foundInName && fromDesc.matches.length > 0

  const cleanedDescription =
    shouldStripDescription && description
      ? stripMatches(description, fromDesc.matches)
      : description ?? null

  return {
    height,
    width,
    cleanedDescription,
    shouldStripDescription,
    foundInName,
    foundInDescription,
  }
}

/** Apply extraction for a DB row update payload */
export function dimensionsUpdatePayload(
  name: string | null | undefined,
  description: string | null | undefined,
  existing?: { height?: string | null; width?: string | null },
): {
  height: string | null
  width: string | null
  description: string | null
  changed: boolean
} {
  const extracted = extractProductDimensions(name, description)
  const height = existing?.height || extracted.height
  const width = existing?.width || extracted.width
  const nextDescription = extracted.shouldStripDescription
    ? extracted.cleanedDescription
    : description ?? null

  const changed =
    height !== (existing?.height ?? null) ||
    width !== (existing?.width ?? null) ||
    nextDescription !== (description ?? null)

  return {
    height: height ?? null,
    width: width ?? null,
    description: nextDescription,
    changed,
  }
}

export function formatDimensionsLabel(dims: ProductDimensions): string | null {
  if (dims.width && dims.height) return `${dims.width} W × ${dims.height} H`
  if (dims.width) return `${dims.width} W`
  if (dims.height) return `${dims.height} H`
  return null
}

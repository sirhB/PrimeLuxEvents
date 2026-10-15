export const SUITE_STORAGE_KEY = 'primelux-suite'

export type SuiteId = 'venue' | 'rentals'

export const SUITES: Array<{ id: SuiteId; label: string; line: string }> = [
  { id: 'venue', label: 'Venue', line: 'Rooms for the celebration' },
  { id: 'rentals', label: 'Rentals', line: 'Furniture, light, and décor' },
]

export function isSuiteId(value: string | null | undefined): value is SuiteId {
  return value === 'venue' || value === 'rentals'
}

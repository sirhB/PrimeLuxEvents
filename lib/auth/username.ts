export const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/
export const SYNTHETIC_ADMIN_DOMAIN = 'admins.primeluxevents.internal'

export function normalizeUsername(raw: string): string {
  return (raw || '').trim().toLowerCase()
}

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username)
}

export function syntheticAdminEmail(username: string): string {
  return `${username}@${SYNTHETIC_ADMIN_DOMAIN}`
}

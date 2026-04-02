// ============================================================
// Input sanitization helpers
// ============================================================

const HTML_TAG_REGEX = /<[^>]*>/g
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /[^0-9+]/g
const SLUG_REGEX = /[^a-zA-Z0-9\-_]/g

/**
 * Sanitize a generic string input.
 * - Trims whitespace
 * - Limits length to 1000 characters
 * - Strips HTML tags
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .slice(0, 1000)
    .replace(HTML_TAG_REGEX, '')
}

/**
 * Sanitize an email address.
 * - Lowercases
 * - Trims whitespace
 * - Validates format (returns empty string if invalid)
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') return ''
  const cleaned = input.trim().toLowerCase()
  if (!EMAIL_REGEX.test(cleaned)) return ''
  return cleaned
}

/**
 * Sanitize a phone number.
 * - Keeps only digits and +
 * - Limits to 20 characters
 */
export function sanitizePhone(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(PHONE_REGEX, '')
    .slice(0, 20)
}

/**
 * Sanitize a slug value.
 * - Keeps only alphanumeric, hyphens, and underscores
 */
export function sanitizeSlug(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .replace(SLUG_REGEX, '')
}

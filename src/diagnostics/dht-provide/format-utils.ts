import i18n from '../../i18n'

/**
 * Placeholder for missing or unavailable values.
 */
export const PLACEHOLDER = '-'

/**
 * Get the current locale from i18n for number formatting.
 */
const getLocale = (): string => i18n.language || 'en'

/**
 * Format nanoseconds as a human-readable duration string.
 * @param ns - Duration in nanoseconds
 * @returns Formatted string like "2d 15h 35m" or "45m 30s", or placeholder if unavailable
 */
export const formatDuration = (ns: number | null | undefined): string => {
  if (ns == null || isNaN(ns)) return PLACEHOLDER
  const totalSecs = Math.floor(ns / 1_000_000_000)
  const days = Math.floor(totalSecs / 86400)
  const hours = Math.floor((totalSecs % 86400) / 3600)
  const mins = Math.floor((totalSecs % 3600) / 60)
  const secs = totalSecs % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (mins > 0) parts.push(`${mins}m`)
  // only show seconds if duration is under 1 minute
  if (parts.length === 0) parts.push(`${secs}s`)

  return parts.join(' ')
}

/**
 * Format an ISO date string as elapsed time since then.
 * @param isoString - ISO 8601 date string
 * @returns Formatted string like "2d 15h" or "45m", or placeholder if unavailable
 */
export const formatElapsed = (isoString: string | null | undefined): string => {
  if (!isoString) return PLACEHOLDER
  try {
    const start = new Date(isoString)
    if (isNaN(start.getTime())) return PLACEHOLDER
    const now = Date.now()
    const elapsedMs = now - start.getTime()
    const elapsedSecs = Math.floor(elapsedMs / 1000)
    const days = Math.floor(elapsedSecs / 86400)
    const hours = Math.floor((elapsedSecs % 86400) / 3600)
    const mins = Math.floor((elapsedSecs % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  } catch {
    return PLACEHOLDER
  }
}

/**
 * Format an ISO date string as relative time (e.g., "2d ago").
 * @param isoString - ISO 8601 date string
 * @param t - Translation function for localized strings
 * @returns Formatted string like "2d ago" or "just now", or empty string if unavailable
 */
export const formatSince = (
  isoString: string | null | undefined,
  t: (key: string, opts?: Record<string, string | number>) => string
): string => {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''
    const now = Date.now()
    const diffMs = now - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHrs = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHrs / 24)

    if (diffDays > 0) return t('dhtProvide.connectivity.sinceAgo', { value: diffDays, unit: 'd' })
    if (diffHrs > 0) return t('dhtProvide.connectivity.sinceAgo', { value: diffHrs, unit: 'h' })
    if (diffMins > 0) return t('dhtProvide.connectivity.sinceAgo', { value: diffMins, unit: 'm' })
    return t('dhtProvide.connectivity.justNow')
  } catch {
    return ''
  }
}

/**
 * Format an ISO date string as local time (HH:MM).
 * @param isoString - ISO 8601 date string
 * @returns Formatted time string like "21:59", or placeholder if unavailable
 */
export const formatTime = (isoString: string | null | undefined): string => {
  if (!isoString) return PLACEHOLDER
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return PLACEHOLDER
    return date.toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return PLACEHOLDER
  }
}

/**
 * Format large numbers with locale-aware compact notation (K, M, etc.).
 * @param n - Number to format
 * @returns Formatted string like "2.8M" or "145", or placeholder if unavailable
 */
export const formatCount = (n: number | null | undefined): string => {
  if (n == null || isNaN(n)) return PLACEHOLDER
  const locale = getLocale()
  if (n >= 1_000) {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(n)
  }
  return n.toLocaleString(locale)
}

/**
 * Safely format a number with locale-aware formatting.
 * @param n - Number to format
 * @param decimals - Number of decimal places (optional)
 * @returns Formatted number string or placeholder
 */
export const formatNumber = (n: number | null | undefined, decimals?: number): string => {
  if (n == null || isNaN(n)) return PLACEHOLDER
  const locale = getLocale()
  if (decimals != null) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(n)
  }
  return n.toLocaleString(locale)
}

/**
 * Format an integer with locale-aware thousand separators.
 * @param n - Number to format
 * @returns Formatted number string or placeholder
 */
export const formatInteger = (n: number | null | undefined): string => {
  if (n == null || isNaN(n)) return PLACEHOLDER
  return n.toLocaleString(getLocale())
}

/**
 * Safely get a number with a default value.
 * @param n - Number that may be undefined
 * @param defaultValue - Default value if n is unavailable
 * @returns The number or default value
 */
export const safeNumber = (n: number | null | undefined, defaultValue = 0): number => {
  if (n == null || isNaN(n)) return defaultValue
  return n
}

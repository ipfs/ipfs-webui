/**
 * Format nanoseconds as a human-readable duration string.
 * @param ns - Duration in nanoseconds
 * @returns Formatted string like "2d 15h 35m" or "45m 30s"
 */
export const formatDuration = (ns: number | null | undefined): string | null => {
  if (ns == null) return null
  const totalSecs = Math.floor(ns / 1_000_000_000)
  const days = Math.floor(totalSecs / 86400)
  const hours = Math.floor((totalSecs % 86400) / 3600)
  const mins = Math.floor((totalSecs % 3600) / 60)
  const secs = totalSecs % 60

  if (days > 0) return `${days}d ${hours}h ${mins}m`
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

/**
 * Format an ISO date string as elapsed time since then.
 * @param isoString - ISO 8601 date string
 * @returns Formatted string like "2d 15h" or "45m"
 */
export const formatElapsed = (isoString: string): string => {
  try {
    const start = new Date(isoString)
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
    return ''
  }
}

/**
 * Format an ISO date string as relative time (e.g., "2d ago").
 * @param isoString - ISO 8601 date string
 * @param t - Translation function for localized strings
 * @returns Formatted string like "2d ago" or "just now"
 */
export const formatSince = (
  isoString: string,
  t: (key: string, opts?: Record<string, string | number>) => string
): string => {
  try {
    const date = new Date(isoString)
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
 * @returns Formatted time string like "21:59"
 */
export const formatTime = (isoString: string): string => {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

/**
 * Format large numbers with abbreviations (K, M).
 * @param n - Number to format
 * @returns Formatted string like "2.8M" or "145"
 */
export const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

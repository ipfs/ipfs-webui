/**
 * Compare two "x.y.z" strings numerically. Returns -1, 0, 1.
 *
 * Implements simplified semantic versioning comparison where:
 * - Numeric segments are compared numerically
 * - Pre-release identifiers (alpha, beta, rc, etc.) are stripped and ignored
 * - Build metadata is ignored in comparison
 * - Non-numeric segments in non-last positions trigger warnings
 *
 * Returns:
 * * -1 if a < b (or error comparing)
 * * 0 if a === b
 * * 1 if a > b
 */
export function cmpVersionStrings (a: string, b: string): -1 | 0 | 1 {
  // Remove build metadata (everything after +) for comparison
  const cleanA = a.split('+')[0]
  const cleanB = b.split('+')[0]

  // Remove pre-release identifiers (everything after -) for comparison
  const versionA = cleanA.split('-')[0]
  const versionB = cleanB.split('-')[0]

  const pa = versionA.split('.')
  const pb = versionB.split('.')

  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const segA = pa[i] ?? ''
    const segB = pb[i] ?? ''

    const numA = Number(segA)
    const numB = Number(segB)

    const isNumA = !Number.isNaN(numA)
    const isNumB = !Number.isNaN(numB)

    if (isNumA && isNumB) {
      if (numA < numB) return -1
      if (numA > numB) return 1
    } else if (i === len - 1) {
      // Last segment: compare lexicographically for non-numeric segments
      if (segA < segB) return -1
      if (segA > segB) return 1
    } else {
      console.warn('Non-numeric segments in version strings:', segA, segB)
      // fallback: lexicographic compare on raw string
      if (segA < segB) return -1
    }
  }
  return 0
}

/**
 * Natural sort comparator for strings.
 *
 * @param {Number} dir - sorting direction, 1 for ascending or -1 for descending
 * @param {Object} opts - localeCompare options (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)
 */
export function sortByName (dir = 1, opts = { numeric: true, sensitivity: 'base' }) {
  return (a, b) => a.localeCompare(b, undefined, opts) * dir
}

/**
 * Numerical sort comparator.
 *
 * @param {Number} dir - sorting direction, 1 for ascending or -1 for descending
 */
export function sortBySize (dir = 1) {
  return (a, b) => (a - b) * dir
}

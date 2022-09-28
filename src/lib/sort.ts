/**
 * Natural sort comparator for strings.
 *
 * @param {Number} dir - sorting direction, 1 for ascending or -1 for descending
 * @param {Intl.CollatorOptions} opts - localeCompare options (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)
 * @returns {(a:string, b:string) => number}
 */
export function sortByName (dir = 1, opts = { numeric: true, sensitivity: 'base' }) {
  return (a: string, b: any) => a.localeCompare(b, undefined, opts) * dir
}

/**
 * Numerical sort comparator.
 *
 * @param {Number} dir - sorting direction, 1 for ascending or -1 for descending
 * @returns {(a:number, b:number) => number}
 */
export function sortBySize (dir = 1) {
  return (a: number, b: number) => (a - b) * dir
}

/**
 * Object sorting by property
 * @template {Object} T
 * @param {keyof T} property - object property to sort by
 * @param {1|-1} dir - sorting direction, 1 for ascending or -1 for descending
 * @returns {(a:T, b:T) => number}
 */
export function sortByProperty <T>(property: keyof T, dir = 1) {
  // @ts-ignore - `a` and `b` may not be numbers
  return ({ [property]: a }, { [property]: b }) => (a == null) - (b == null) || dir * +(a > b) || dir * -(a < b)
}

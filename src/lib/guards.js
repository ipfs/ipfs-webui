/**
 *
 * @param {any} value
 * @param {boolean} [throwOnFalse]
 * @returns {value is Function}
 */
export function isFunction (value, throwOnFalse = true) {
  if (typeof value === 'function') { return true }
  if (throwOnFalse) { throw new TypeError('Expected a function') }
  return false
}

/**
 *
 * @param {any} value
 * @param {boolean} [throwOnFalse]
 * @returns {value is number}
 */
export function isNumber (value, throwOnFalse = true) {
  if (typeof value === 'number') { return true }
  if (throwOnFalse) { throw new TypeError('Expected a number') }
  return false
}

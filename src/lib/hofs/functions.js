/**
 * This method creates a function that invokes func once it’s called n or more times.
 * @see https://youmightnotneed.com/lodash#after
 * @template A
 * @template R
 * @param {number} times
 * @param {(...args: A[]) => R} fn
 * @returns {(...args: A[]) => void | R}
 */
export const after = (times, fn) => {
  let counter = 0
  /**
   * @type {(...args: A[]) => void | R}
   */
  return (...args) => {
    counter++
    if (counter >= times) {
      return fn(...args)
    }
  }
}

/**
 * @see https://youmightnotneed.com/lodash#once
 * @template A
 * @template R
 * @param {(...args: A[]) => R} fn
 * @returns {(...args: A[]) => R}
 */
export const once = (fn) => {
  let called = false
  /**
   * @type {R}
   */
  let result

  /**
   * @type {(...args: A[]) => R}
   */
  return (...args) => {
    if (!called) {
      result = fn(...args)
      called = true
    }
    return result
  }
}

/**
 * Call a function only once on the nth time it was called
 * @template A
 * @template R
 * @param {number} nth
 * @param {(...args: A[]) => R} fn
 * @returns {(...args: A[]) => void | R}
 */
export const onlyOnceAfter = (nth, fn) => {
  return after(nth, once(fn))
}

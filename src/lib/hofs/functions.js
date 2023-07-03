import { isFunction, isNumber } from '../guards.js'

/**
 * This method creates a function that invokes func once it’s called n or more times.
 * @see https://youmightnotneed.com/lodash#after
 * @template A
 * @template R
 * @param {number} times
 * @param {(...args: A[]) => R} fn
 * @returns {(...args: A[]) => void | R}
 */
export const after = (fn, times) => {
  isFunction(fn) && isNumber(times)
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
  isFunction(fn)
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
 * @see https://youmightnotneed.com/lodash#debounce
 *
 * @template A
 * @template R
 * @param {(...args: A[]) => R} fn - The function to debounce.
 * @param {number} delay - The number of milliseconds to delay.
 * @param {Object} options
 * @param {boolean} [options.leading]
 * @returns {(...args: A[]) => void}
 */
export const debounce = (fn, delay, { leading = false } = {}) => {
  isFunction(fn) && isNumber(delay)
  /**
   * @type {NodeJS.Timeout}
   */
  let timerId

  return (...args) => {
    if (!timerId && leading) {
      fn(...args)
    }
    clearTimeout(timerId)

    timerId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Call a function only once on the nth time it was called
 * @template A
 * @template R
 * @param {number} nth - The nth time the function should be called when it is actually invoked.
 * @param {(...args: A[]) => R} fn - The function to call.
 * @returns {(...args: A[]) => void | R}
 */
export const onlyOnceAfter = (fn, nth) => {
  isFunction(fn) && isNumber(nth)
  return after(once(fn), nth)
}

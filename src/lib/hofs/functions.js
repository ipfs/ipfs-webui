/**
 * This method creates a function that invokes func once it’s called n or more times.
 * @see https://youmightnotneed.com/lodash#after
 * @type {<A, R>(times: number, fn: (...args: A[]) => R) => (...args: A[]) => void | R}
 */
export const after = (times, fn) => {
  let counter = 0
  return (...args) => {
    counter++
    if (counter >= times) {
      return fn(...args)
    }
  }
}
/**
 * @see https://youmightnotneed.com/lodash#once
 * @type {<A, R>(fn: (...args: A[]) => R) => (...args: A[]) => R}
 */
export const once = (fn) => {
  let called = false
  let result
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
 * @type {<A, R>(nth: number, fn: (...args: A[]) => R) => (...args: A[]) => void | R}
 */
export const onlyOnceAfter = (nth, fn) => {
  return after(nth, once(fn))
}

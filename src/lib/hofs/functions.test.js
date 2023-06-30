import { jest } from '@jest/globals'

import { after, debounce, once, onlyOnceAfter } from './functions.js'

jest.useFakeTimers()

describe('hofFns', function () {
  describe('after', function () {
    it('should not call the function if the threshold has not been reached', function () {
      const fn = jest.fn()
      const afterFn = after(10, fn)

      afterFn()
      afterFn()
      afterFn()

      expect(fn).toHaveBeenCalledTimes(0)
    })

    it('should call the function if the threshold has been reached', function () {
      const fn = jest.fn()
      const afterFn = after(3, fn)

      afterFn()
      afterFn()
      afterFn()

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('once', function () {
    it('should call the function only once', function () {
      const fn = jest.fn()
      const onceFn = once(fn)

      onceFn()
      onceFn()
      onceFn()

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('debounce', function () {
    it('should call the function only once within the given timeframe', function () {
      const fn = jest.fn()
      const debounceFn = debounce(fn, 100)

      debounceFn()
      debounceFn()
      debounceFn()

      expect(fn).toHaveBeenCalledTimes(0)

      jest.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('onlyOnceAfter', function () {
    it('should not call the function unless n is reached', function () {
      const fn = jest.fn()
      const onlyOnceAfterFn = onlyOnceAfter(5, fn)

      onlyOnceAfterFn()
      onlyOnceAfterFn()
      onlyOnceAfterFn()

      expect(fn).toHaveBeenCalledTimes(0)
    })

    it('should call the function only once after n+m calls', function () {
      const fn = jest.fn()
      const onlyOnceAfterFn = onlyOnceAfter(5, fn)

      onlyOnceAfterFn()
      onlyOnceAfterFn()
      onlyOnceAfterFn()
      onlyOnceAfterFn()
      onlyOnceAfterFn()
      onlyOnceAfterFn()
      onlyOnceAfterFn()
      onlyOnceAfterFn()

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})

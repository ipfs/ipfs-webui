import { jest } from '@jest/globals'

import { after, debounce, once, onlyOnceAfter } from './functions.js'

jest.useFakeTimers()

describe('hofFns', function () {
  describe('after', function () {
    it('should not call the function if the threshold has not been reached', function () {
      const fn = jest.fn()
      const afterFn = after(fn, 10)

      afterFn()
      afterFn()
      afterFn()

      expect(fn).toHaveBeenCalledTimes(0)
    })

    it('should call the function if the threshold has been reached', function () {
      const fn = jest.fn()
      const afterFn = after(fn, 3)

      afterFn()
      afterFn()
      afterFn()

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should throw an error if the passed fn is not a function', function () {
      expect(() => after('not a function', 3)).toThrow(TypeError)
    })

    it('should throw an error if times is not a number', function () {
      expect(() => after(jest.fn(), 'not a number')).toThrow(TypeError)
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

    it('should throw an error if the passed fn is not a function', function () {
      expect(() => once('not a function')).toThrow(TypeError)
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

    it('should throw an error if the passed fn is not a function', function () {
      expect(() => debounce('not a function')).toThrow(TypeError)
    })
  })

  describe('onlyOnceAfter', function () {
    it('should not call the function unless n is reached', function () {
      const fn = jest.fn()
      const onlyOnceAfterFn = onlyOnceAfter(fn, 5)

      onlyOnceAfterFn()
      onlyOnceAfterFn()
      onlyOnceAfterFn()

      expect(fn).toHaveBeenCalledTimes(0)
    })

    it('should call the function only once after n+m calls', function () {
      const fn = jest.fn()
      const onlyOnceAfterFn = onlyOnceAfter(fn, 5)

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

    it('should throw an error if the passed fn is not a function', function () {
      expect(() => onlyOnceAfter('not a function', 2)).toThrow(TypeError)
    })

    it('should throw an error if nth is not a number', function () {
      expect(() => onlyOnceAfter(jest.fn(), 'not a number')).toThrow(TypeError)
    })
  })
})

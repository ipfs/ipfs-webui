import { isFunction, isNumber } from './guards.js'

describe('lib/guards', function () {
  describe('isFunction', function () {
    it('should return true if the passed value is a function', function () {
      expect(isFunction(() => {})).toBe(true)
    })

    it('should throw an error if the passed value is not a function', function () {
      expect(() => isFunction('not a function')).toThrow(TypeError)
    })

    it('should return false if the passed value is not a function and throwOnFalse is false', function () {
      expect(isFunction('not a function', false)).toBe(false)
    })
  })

  describe('isNumber', function () {
    it('should return true if the passed value is a function', function () {
      expect(isNumber(1)).toBe(true)
    })

    it('should throw an error if the passed value is not a function', function () {
      expect(() => isNumber('not a number')).toThrow(TypeError)
    })

    it('should return false if the passed value is not a function and throwOnFalse is false', function () {
      expect(isNumber('not a number', false)).toBe(false)
    })
  })
})

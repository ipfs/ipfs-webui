/* global describe, it, expect, beforeAll, afterAll */
// @ts-check

import { getLanguage } from './i18n.js'
import languages from './languages.json'

describe('i18n', function () {
  describe('getLanguage', function () {
    it('returns unknown when given non-truthy input', () => {
      expect(getLanguage()).toBe('Unknown')
      expect(getLanguage('')).toBe('Unknown')
      expect(getLanguage(null)).toBe('Unknown')
      expect(getLanguage(undefined)).toBe('Unknown')
    })

    describe('returns the correct nativeName for each language', () => {
      Object.keys(languages).forEach((lang) => {
        it(`returns ${languages[lang].nativeName} for ${lang}`, () => {
          expect(getLanguage(lang)).toBe(languages[lang].nativeName)
        })
      })
    })
  })
  describe('getCurrentLanguage', function () {

  })
})

/* global describe, it, expect, beforeAll, afterAll */
// @ts-check
import i18n from '../i18n.js'
import { getLanguage, getCurrentLanguage } from './i18n.js'
import languages from './languages.json'

const testEachLanguage = (fn) => {
  Object.keys(languages).forEach((lang) => fn(lang))
}

describe('i18n', function () {
  describe('getLanguage', function () {
    it('returns unknown when given non-truthy input', () => {
      expect(getLanguage()).toBe('Unknown')
      expect(getLanguage('')).toBe('Unknown')
      expect(getLanguage(null)).toBe('Unknown')
      expect(getLanguage(undefined)).toBe('Unknown')
    })

    describe('returns the correct nativeName for each language', () => {
      testEachLanguage((lang) => {
        it(`returns ${languages[lang].nativeName} for ${lang}`, () => {
          expect(getLanguage(lang)).toBe(languages[lang].nativeName)
        })
      })
    })
  })

  describe('getCurrentLanguage', function () {
    it('returns unknown when i18n isn\'t initialized', () => {
      expect(getCurrentLanguage()).toBe('Unknown')
    })

    describe('returns the correct nativeName for each language', () => {
      beforeAll(async function () {
        await i18n.init()
      })
      testEachLanguage((lang) => {
        it(`returns ${languages[lang].nativeName} for ${lang}`, async () => {
          await i18n.changeLanguage(lang)
          expect(getCurrentLanguage()).toBe(languages[lang].nativeName)
        })
      })
    })
  })
})

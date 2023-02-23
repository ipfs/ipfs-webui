/* global describe, it, expect, beforeAll */
// @ts-check
import i18n, { localesList } from '../i18n.js'
import { getLanguage, getCurrentLanguage } from './i18n.js'
import languages from './languages.json'
import { readdir } from 'node:fs/promises'

const testEachLanguage = (fn) => {
  Object.keys(languages).forEach((lang) => fn(lang))
}

const allLanguages = (await readdir('./public/locales', { withFileTypes: true }))
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)

describe('i18n', function () {
  it('should have a languages.json entry for each folder', function () {
    const namedLocales = localesList.map(({ locale }) => locale)
    expect(namedLocales).toEqual(allLanguages)
  })

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

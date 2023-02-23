/* global describe, it, expect */
// @ts-check
import i18n from '../i18n.js'
import getValidLocaleCode from './i18n-localeParser.js'
import languages from './languages.json'

const fallbackLanguages = /** @type {import('i18next').FallbackLngObjList} */(i18n.options.fallbackLng)

const testEachLanguage = (fn) => {
  Object.keys(languages)
    .concat(Object.keys(fallbackLanguages).filter((lang) => lang !== 'default'))
    .concat([
      // any extra language codes you want to test go here. It will need a corresponding entry in the expectedMap below
    ])
    .forEach((lang) => fn(lang))
}

const expectedMap = new Proxy({
  /**
   * This should ideally be handled by the fallbackLng option in i18n.js, but if it needs overriding, it can be done here.
   * @example
   * 'en-GB': 'en'
   */
}, {
  /**
   *
   * @param {Record<string, string>} target
   * @param {string} prop
   * @returns {string}
   */
  get: (target, prop) => {
    const result = target[prop]
    if (result != null) {
      return result
    }
    const fallbackResult = fallbackLanguages[prop]
    if (fallbackResult != null) {
      return fallbackResult[0]
    }

    return prop
  }
})

describe('i18n-localeParser', function () {
  it('returns en for unsupported locale', () => {
    expect(getValidLocaleCode({ i18n, localeCode: 'xx', languages })).toBe('en') // invalid locale code
    expect(getValidLocaleCode({ i18n, localeCode: 'el-GR', languages })).toBe('en') // Greek is not supported
  })

  // graceful degradation: Use the most specific locale that is supported
  it('returns `lang` only if `lang-COUNTRY` is unsupported', () => {
    // arabic is supported, but arabic-saudi arabia is not
    expect(getValidLocaleCode({ i18n, localeCode: 'ar-SA', languages })).toBe('ar')
    // Catalan is supported, but Catalan-France is not
    expect(getValidLocaleCode({ i18n, localeCode: 'ca-FR', languages })).toBe('ca')
    // Czech is supported, but Czech-Czech is not
    expect(getValidLocaleCode({ i18n, localeCode: 'cs-CZ', languages })).toBe('cs')
    // Danish is supported, but Danish-Denmark is not
    expect(getValidLocaleCode({ i18n, localeCode: 'da-DK', languages })).toBe('da')
    // German is supported, but German-Germany is not
    expect(getValidLocaleCode({ i18n, localeCode: 'de-DE', languages })).toBe('de')
    // Spanish is supported, but Spanish-Spain is not
    expect(getValidLocaleCode({ i18n, localeCode: 'es-ES', languages })).toBe('es')
    // Finnish is supported, but Finnish-Finland is not
    expect(getValidLocaleCode({ i18n, localeCode: 'fi-FI', languages })).toBe('fi')
    // French is supported, but French-France is not
    expect(getValidLocaleCode({ i18n, localeCode: 'fr-FR', languages })).toBe('fr')
  })

  // graceful degradation 2: Use a more specific locale if general locale is not supported
  it('returns `lang-COUNTRY` if `lang` is unsupported', () => {
    // Hindi is not supported, but Hindi-India is
    expect(getValidLocaleCode({ i18n, localeCode: 'hi', languages })).toBe('hi-IN')
    // Japanese is not supported, but Japanese-Japan is
    expect(getValidLocaleCode({ i18n, localeCode: 'ja', languages })).toBe('ja-JP')
    // Korean is not supported, but Korean-Korea is
    expect(getValidLocaleCode({ i18n, localeCode: 'ko', languages })).toBe('ko-KR')
    // Chinese is not supported without country code, but Chinese-China, Chinese-Hong Kong, and Chinese-Taiwan are. We default to Chinese-China
    expect(getValidLocaleCode({ i18n, localeCode: 'zh', languages })).toBe('zh-CN')
  })

  testEachLanguage((lang) => {
    const expectedValue = expectedMap[lang]
    it(`returns ${expectedValue} for ${lang}`, () => {
      const actualValue = getValidLocaleCode({ i18n, localeCode: lang, languages })
      expect(actualValue).toBe(expectedValue)
    })
  })
})

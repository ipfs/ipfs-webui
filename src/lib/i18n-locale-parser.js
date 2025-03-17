/**
 *
 * @param {object} options
 * @param {import('i18next').i18n} options.i18n
 * @param {string} options.localeCode
 * @param {Record<string, { locale: string, nativeName: string, englishName: string }>} options.languages
 *
 * @returns {string}
 */
export default function getValidLocaleCode ({ i18n, localeCode, languages }) {
  const info = languages[localeCode]

  if (info != null) {
    return localeCode
  }

  const fallbackLanguages = i18n.options.fallbackLng[localeCode]
  if (info == null && fallbackLanguages != null) {
    /**
     * check fallback languages before attempting to split a 'lang-COUNTRY' code
     * fixed issue with displaying 'English' when i18nLng is set to 'ko'
     * discovered when looking into https://github.com/ipfs/ipfs-webui/issues/2097
     */
    const fallback = fallbackLanguages
    for (const locale of fallback) {
      const fallbackInfo = languages[locale]

      if (fallbackInfo != null) {
        return fallbackInfo.locale
      }
    }
  }

  // if we haven't got the info in the `languages.json` we split it to get the language
  const langOnly = localeCode.split('-')[0]
  if (languages[langOnly]) {
    return langOnly
  }
  // if the provided localeCode doesn't have country, but we have a supported language for a specific country, we return that
  const langWithCountry = Object.keys(languages).find((key) => key.startsWith(localeCode))
  if (langWithCountry) {
    return langWithCountry
  }

  return 'en'
}

import i18n from '../i18n.js'
// languages.json generated from our locale dir via https://github.com/olizilla/lol
import languages from './languages.json'

export const getCurrentLanguage = () => {
  return getLanguage(i18n.language)
}

export const getLanguage = (localeCode) => {
  if (!localeCode) return 'Unknown'

  let info = languages[localeCode]
  const fallbackLanguages = i18n.options.fallbackLng[localeCode]

  if (info == null && fallbackLanguages != null) {
    /**
     * check fallback languages before attempting to split a 'lang-COUNTRY' code
     * fixed issue with displaying 'English' when i18nLng is set to 'ko'
     * discovered when looking into https://github.com/ipfs/ipfs-webui/issues/2097
     */
    const fallback = fallbackLanguages
    for (const locale of fallback) {
      info = languages[locale]
      if (info != null) {
        return info.nativeName
      }
    }
  }

  if (!info) {
    // if we haven't got the info in the `languages.json` we split it to get the language
    const lang = languages[localeCode.split('-')[0]]
    // if we have the language we add it, else we fallback to english (Web UI default lang)
    return (lang && lang.nativeName) || languages.en.englishName
  }

  return info.nativeName
}

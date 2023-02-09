import i18n from '../i18n.js'
// languages.json generated from our locale dir via https://github.com/olizilla/lol
import languages from './languages.json'

export const getCurrentLanguage = () => {
  return getLanguage(i18n.language)
}

export const getLanguage = (localeCode) => {
  if (!localeCode) return 'Unknown'

  const info = languages[localeCode]

  if (!info) {
    // if we haven't got the info in the `languages.json` we split it to get the language
    const lang = languages[localeCode.split('-')[0]]
    // if we have the language we add it, else we fallback to english (Web UI default lang)
    return (lang && lang.nativeName) || languages.en.englishName
  }

  return info.nativeName
}

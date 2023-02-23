import i18n from '../i18n.js'
// languages.json generated from our locale dir via https://github.com/olizilla/lol
import languages from './languages.json'
import getValidLocaleCode from './i18n-localeParser.js'

export const getCurrentLanguage = () => {
  return getLanguage(i18n.language)
}

export const getLanguage = (localeCode) => {
  if (!localeCode) return 'Unknown'

  const correctLocaleCode = getValidLocaleCode({ i18n, localeCode, languages })

  return languages[correctLocaleCode].nativeName
}

import i18n from '../i18n'
// languages.json generated from our locale dir via https://github.com/olizilla/lol
import languages from './languages.json'

export const getCurrentLanguage = () => {
  return getLanguage(i18n.language)
}

export const getLanguage = (localeCode) => {
  const info = languages[localeCode]
  if (!info) return localeCode
  return info.nativeName
}

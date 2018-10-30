import i18n from '../i18n'
import languages from './languages.json'

export const getCurrentLanguage = () => languages[i18n.language] || i18n.language

export const getLanguage = (lang) => languages[lang] || lang

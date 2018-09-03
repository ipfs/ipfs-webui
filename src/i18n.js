import i18n from 'i18next'
import XHR from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(XHR)
  .use(LanguageDetector)
  .init({
    ns: ['common', 'files', 'settings', 'status', 'peers'],
    defaultNS: 'common',
    fallbackLng: 'en',
    debug: true,
    // react i18next special options (optional)
    react: {
      wait: false,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      nsMode: 'default'
    }
  })

export default i18n

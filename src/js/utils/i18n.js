import i18next from 'i18next'
import XHR from 'i18next-xhr-backend'
import Cache from 'i18next-localstorage-cache'
import LanguageDetector from 'i18next-browser-languagedetector'
import sprintf from 'i18next-sprintf-postprocessor'

i18next
  .use(XHR)
  .use(Cache)
  .use(LanguageDetector)
  .use(sprintf)
  .init({
    lngWhiteList: ['en', 'cs', 'de', 'pl', 'fr'],
    fallbackLng: 'en',
    load: 'languageOnly',
    backend: {
      loadPath: 'locale/webui-{{lng}}.json',
      allowMultiloading: false
    },
    interpolation: {
      escapeValue: false
    },
    keyseparator: '<',
    nsseparator: '>',
    compatibilityJSON: 'v2'
  })

export default i18next

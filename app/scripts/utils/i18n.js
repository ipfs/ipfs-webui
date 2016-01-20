import i18next from 'i18next/lib'
import XHR from 'i18next-xhr-backend/lib'
import Cache from 'i18next-localstorage-cache/lib'
import LanguageDetector from 'i18next-browser-languagedetector/lib'
import sprintf from 'i18next-sprintf-postprocessor/lib'

i18next
  .use(XHR)
  .use(Cache)
  .use(LanguageDetector)
  .use(sprintf)
  .init({
    lngWhiteList: ['en', 'cs', 'de'],
    fallbackLng: 'en',
    load: 'languageOnly',
    backend: {
      loadPath: '/locale/webui-{{lng}}.json',
      allowMultiloading: false
    },
    interpolation: {
      escapeValue: false
    },
    keyseparator: '<',
    nsseparator: '>'
  })

export
default i18next

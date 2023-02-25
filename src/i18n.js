import i18n from 'i18next'
import ICU from 'i18next-icu'
import Backend from 'i18next-chained-backend'
import LocalStorageBackend from 'i18next-localstorage-backend'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import pkgJson from '../package.json'

import locales from './lib/languages.json'
import getValidLocaleCode from './lib/i18n-localeParser.js'

const { version } = pkgJson
export const localesList = Object.values(locales)

i18n
  .use(ICU)
  .use(Backend)
  .use(LanguageDetector)
  .init({
    load: 'currentOnly', // see https://github.com/i18next/i18next-http-backend/issues/61
    backend: {
      backends: [
        LocalStorageBackend,
        HttpBackend
      ],
      backendOptions: [
        { // LocalStorageBackend
          defaultVersion: version,
          expirationTime: (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? 1 : 7 * 24 * 60 * 60 * 1000
        },
        { // HttpBackend
          loadPath: (lngs, namespaces) => {
            const locale = getValidLocaleCode({ i18n, localeCode: lngs[0], languages: locales })
            // ensure a relative path is used to look up the locales, so it works when loaded from /ipfs/<cid>
            return `locales/${locale}/${namespaces}.json`
          }
        }
      ]
    },
    ns: ['app', 'welcome', 'status', 'files', 'explore', 'peers', 'settings', 'notify'],
    defaultNS: 'app',
    fallbackNS: 'app',
    fallbackLng: {
      'zh-Hans': ['zh-CN', 'en'],
      'zh-Hant': ['zh-TW', 'en'],
      zh: ['zh-CN', 'en'],
      ko: ['ko-KR', 'en'],
      default: ['en']
    },
    debug: process.env.DEBUG,
    // react i18next special options (optional)
    react: {
      wait: true,
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      nsMode: 'default'
    }
  })

export default i18n

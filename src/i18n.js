import i18n from 'i18next'
import ICU from 'i18next-icu'
import XHR from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

import cs from 'i18next-icu/locale-data/cs'
import de from 'i18next-icu/locale-data/de'
import en from 'i18next-icu/locale-data/en'
import eo from 'i18next-icu/locale-data/eo'
import es from 'i18next-icu/locale-data/es'
import fr from 'i18next-icu/locale-data/fr'
import it from 'i18next-icu/locale-data/it'
import ko from 'i18next-icu/locale-data/ko'
import nl from 'i18next-icu/locale-data/nl'
import no from 'i18next-icu/locale-data/no'
import pl from 'i18next-icu/locale-data/pl'
import pt from 'i18next-icu/locale-data/pt'
import ru from 'i18next-icu/locale-data/ru'
import sl from 'i18next-icu/locale-data/sl'
import sv from 'i18next-icu/locale-data/sv'
import uk from 'i18next-icu/locale-data/uk'
import zh from 'i18next-icu/locale-data/zh'

i18n
  .use(new ICU({
    localeData: [cs, de, en, eo, es, fr, it, ko, nl, no, pl, pt, ru, sl, sv, uk, zh]
  }))
  .use(XHR)
  .use(LanguageDetector)
  .init({
    ns: ['welcome', 'status', 'files', 'explore', 'peers', 'settings', 'notify'],
    fallbackLng: 'en',
    debug: process.env.NODE_ENV !== 'production',
    backend: {
      // ensure a realtive path is used to look up the locales, so it works when used from /ipfs/<cid>
      loadPath: 'locales/{{lng}}/{{ns}}.json'
    },
    // react i18next special options (optional)
    react: {
      wait: true,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      nsMode: 'default'
    }
  })

export default i18n

import { readFile } from 'node:fs/promises'

import { test, expect } from './setup/coverage.js'

const languageFilePromise = readFile('./src/lib/languages.json', 'utf8')

let languages
const getLanguages = async () => {
  if (languages != null) return languages
  languages = JSON.parse(await languageFilePromise)
  return languages
}

test.describe('Settings screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/settings')
  })

  test('should show config of IPFS node', async ({ page }) => {
    await page.waitForSelector('text=Addresses')
    await page.waitForSelector('text=Bootstrap')
    await page.waitForSelector('text=PeerID')
    // check PeerID in config to confirm it comes from expected instance
    const id = process.env.IPFS_RPC_ID
    await page.waitForSelector(`text=${id}`)
  })

  test('Language selector', async ({ page }) => {
    const languages = await getLanguages()
    for (const lang of Object.values(languages).map((lang) => lang.locale)) {
      // click the 'change language' button
      const changeLanguageBtn = await page.waitForSelector('.e2e-languageSelector-changeBtn')
      await changeLanguageBtn.click()

      // wait for the language modal to appear
      await page.waitForSelector('.e2e-languageModal')

      // create a promise that resolves when the request for the new translation file is made
      const requestForNewTranslationFiles = page.waitForRequest((request) => {
        if (lang === 'en') {
          // english is the fallback language and we can't guarantee the request wasn't already made, so we resolve for 'en' on any request

          return true
        }
        const url = request.url()

        return url.includes(`locales/${lang}`) && url.includes('.json')
      })

      // select the language
      const languageModalButton = await page.waitForSelector(`.e2e-languageModal-lang_${lang}`)
      await languageModalButton.click()

      // wait for the language modal to disappear
      await page.waitForSelector('.e2e-languageModal', { state: 'hidden' })
      await requestForNewTranslationFiles

      // check that the language has changed
      await page.waitForSelector('.e2e-languageSelector-current', { text: languages[lang].nativeName })

      // confirm the localStorage setting was applied
      const i18nLang = await page.evaluate('localStorage.getItem(\'i18nextLng\')')
      expect(i18nLang).toBe(lang)
    }
  })
})

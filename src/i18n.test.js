/* global describe, it, expect, beforeAll, afterAll */
// @ts-check
import { createServer } from 'http-server'
import i18n from './i18n.js'
import { readdir } from 'node:fs/promises'

const allLanguages = (await readdir('./public/locales', { withFileTypes: true }))
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)

describe('i18n', function () {
  /**
   * @type {import('http-server').HTTPServer}
   */
  let httpServer
  beforeAll(async function () {
    httpServer = createServer({
      root: './public'
    })
    await httpServer.listen(80)

    // initialize i18n
    await i18n.init()
  })

  afterAll(async function () {
    await httpServer.close()
  })

  it('should have a default language', function () {
    expect(i18n.language).toBe('en-US')
  })

  allLanguages.concat('ko').forEach((lang) => {
    describe(`lang=${lang}`, function () {
      it(`should be able to switch to ${lang}`, async function () {
        await i18n.changeLanguage(lang)

        expect(i18n.language).toBe(lang)
      })

      it(`should have a key for ${lang}`, async function () {
        // key and namespace that don't exist return the key without the leading namespace
        expect(await i18n.t('someNs:that.doesnt.exist', { lng: lang })).toBe('that.doesnt.exist')
        // missing key on existing namespace returns that key
        expect(await i18n.t('app:that.doesnt.exist', { lng: lang })).toBe('that.doesnt.exist')
        expect(await i18n.t('app:actions.add', { lng: lang })).not.toBe('app:actions.add')
      })
    })
  })

  describe('fallback languages', function () {
    /**
     * @type {import('i18next').FallbackLngObjList}
     */
    const fallbackLanguages = /** @type {import('i18next').FallbackLngObjList} */(i18n.options.fallbackLng)
    for (const lng in fallbackLanguages) {
      if (lng === 'default') {
        continue
      }
      const fallbackArr = fallbackLanguages[lng]
      fallbackArr.forEach((fallbackLang) => {
        it(`fallback '${fallbackLang}' (for '${lng}') is valid`, async function () {
          expect(allLanguages).toContain(fallbackLang)
        })
      })
      it(`language ${lng} should fallback to ${fallbackArr[0]}`, async function () {
        const result = await i18n.t('app:actions.add', { lng })
        const englishResult = await i18n.t('app:actions.add', { lng: 'en' })
        const fallbackResult = await i18n.t('app:actions.add', { lng: fallbackArr[0] })
        expect(result).toBe(fallbackResult)
        expect(result).not.toBe(englishResult)
      })
    }
  })
})

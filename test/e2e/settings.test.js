import { readFile } from 'node:fs/promises'
import { test, expect } from './setup/coverage.js'
import { DEFAULT_PATH_GATEWAY, DEFAULT_SUBDOMAIN_GATEWAY } from '../../src/bundles/gateway.js'

const languageFilePromise = readFile('./src/lib/languages.json', 'utf8')

let languages
const getLanguages = async () => {
  if (languages != null) return languages
  languages = JSON.parse(await languageFilePromise)
  return languages
}

/**
 * Function to check if an element contains a specific class within a maximum wait time.
 * @param {Page} page - The page object.
 * @param {ElementHandle} element - The element to check.
 * @param {string} className - The class name to check for.
 * @param {number} maxWaitTime - Maximum wait time in milliseconds.
 * @param {number} pollInterval - Interval between polls in milliseconds.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the class was found.
 */
async function checkClassWithTimeout (page, element, className, maxWaitTime = 16000, pollInterval = 500) {
  const startTime = Date.now()
  while ((Date.now() - startTime) < maxWaitTime) {
    const hasClass = await element.evaluate((el, className) => el.classList.contains(className), className)
    if (hasClass) return true
    await page.waitForTimeout(pollInterval)
  }
  return false
}

/**
 * Function to submit a gateway and check for success/failure.
 * @param {Page} page - The page object.
 * @param {ElementHandle} inputElement - The input element to fill.
 * @param {ElementHandle} submitButton - The submit button element to click.
 * @param {string} gatewayURL - The gateway URL to fill.
 * @param {string} expectedClass - The expected class after submission.
 */
async function submitGatewayAndCheck (page, inputElement, submitButton, gatewayURL, expectedClass) {
  await inputElement.fill(gatewayURL)
  await submitButton.click()
  const hasExpectedClass = await checkClassWithTimeout(page, inputElement, expectedClass)
  expect(hasExpectedClass).toBe(true)
}

/**
 * Function to reset a gateway and verify the reset.
 * @param {ElementHandle} resetButton - The reset button element to click.
 * @param {ElementHandle} inputElement - The input element to check.
 * @param {string} expectedValue - The expected value after reset.
 */
async function resetGatewayAndCheck (resetButton, inputElement, expectedValue) {
  await resetButton.click()
  const gatewayText = await inputElement.evaluate(element => element.value)
  expect(gatewayText).toContain(expectedValue)
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

  test('Submit/Reset Public Subdomain Gateway', async ({ page }) => {
    // Wait for the necessary elements to be available in the DOM
    const publicSubdomainGatewayElement = await page.waitForSelector('#public-subdomain-gateway')
    const publicSubdomainGatewaySubmitButton = await page.waitForSelector('#public-subdomain-gateway-submit-button')
    const publicSubdomainGatewayResetButton = await page.waitForSelector('#public-subdomain-gateway-reset-button')

    // Check that submitting a wrong Subdomain Gateway triggers a red outline
    await submitGatewayAndCheck(page, publicSubdomainGatewayElement, publicSubdomainGatewaySubmitButton, DEFAULT_PATH_GATEWAY, 'focus-outline-red')

    // Check that submitting a correct Subdomain Gateway triggers a green outline
    await submitGatewayAndCheck(page, publicSubdomainGatewayElement, publicSubdomainGatewaySubmitButton, DEFAULT_SUBDOMAIN_GATEWAY + '/', 'focus-outline-green')

    // Check the Reset button functionality
    await resetGatewayAndCheck(publicSubdomainGatewayResetButton, publicSubdomainGatewayElement, DEFAULT_SUBDOMAIN_GATEWAY)
  })

  test('Submit/Reset Public Path Gateway', async ({ page }) => {
    // Custom timeout for this specific test
    test.setTimeout(32000)

    // Wait for the necessary elements to be available in the DOM
    const publicGatewayElement = await page.waitForSelector('#public-gateway')
    const publicGatewaySubmitButton = await page.waitForSelector('#public-path-gateway-submit-button')
    const publicGatewayResetButton = await page.waitForSelector('#public-path-gateway-reset-button')

    // Check that submitting a wrong Path Gateway triggers a red outline
    await submitGatewayAndCheck(page, publicGatewayElement, publicGatewaySubmitButton, DEFAULT_PATH_GATEWAY + '1999', 'focus-outline-red')

    // Check that submitting a correct Path Gateway triggers a green outline
    await submitGatewayAndCheck(page, publicGatewayElement, publicGatewaySubmitButton, DEFAULT_SUBDOMAIN_GATEWAY, 'focus-outline-green')

    // Check the Reset button functionality
    await resetGatewayAndCheck(publicGatewayResetButton, publicGatewayElement, DEFAULT_PATH_GATEWAY)
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

import { readFile } from 'node:fs/promises'
import { test, expect } from './setup/coverage.js'
import { DEFAULT_PATH_GATEWAY, DEFAULT_SUBDOMAIN_GATEWAY, TEST_PATH_GATEWAY, TEST_SUBDOMAIN_GATEWAY } from '../../src/bundles/gateway.js'

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
    // Increase timeout for this test as validation can be slow
    test.setTimeout(45000)
    // Wait for the necessary elements to be available in the DOM
    const publicSubdomainGatewayElement = await page.waitForSelector('#public-subdomain-gateway')
    const publicSubdomainGatewaySubmitButton = page.locator('#public-subdomain-gateway-submit-button')
    const publicSubdomainGatewayResetButton = page.locator('#public-subdomain-gateway-reset-button')

    // Store initial value (should be DEFAULT_SUBDOMAIN_GATEWAY)
    const initialValue = await publicSubdomainGatewayElement.evaluate(el => el.value)
    expect(initialValue).toBe(DEFAULT_SUBDOMAIN_GATEWAY)

    // First, set an invalid value to verify red border appears
    await publicSubdomainGatewayElement.click({ clickCount: 3 })
    await publicSubdomainGatewayElement.fill('not-a-valid-url')

    // Wait for validation to fail and show red outline
    const hasRedOutline = await checkClassWithTimeout(page, publicSubdomainGatewayElement, 'focus-outline-red', 5000)
    expect(hasRedOutline).toBe(true)

    // Verify submit button is disabled for invalid input
    await expect(publicSubdomainGatewaySubmitButton).toBeDisabled()

    // Now change to valid test gateway (which bypasses validation)
    await publicSubdomainGatewayElement.click({ clickCount: 3 })
    await publicSubdomainGatewayElement.fill(TEST_SUBDOMAIN_GATEWAY)

    // Wait for validation to complete by checking for green outline
    // Since TEST_SUBDOMAIN_GATEWAY bypasses validation, it should pass quickly
    const hasGreenOutline = await checkClassWithTimeout(page, publicSubdomainGatewayElement, 'focus-outline-green', 5000)
    expect(hasGreenOutline).toBe(true)

    // Wait for submit button to become enabled after validation
    await expect(publicSubdomainGatewaySubmitButton).toBeEnabled({ timeout: 5000 })

    // Click submit
    await publicSubdomainGatewaySubmitButton.click()

    // Wait for value to persist
    await page.waitForFunction(
      (expectedValue) => {
        const el = document.querySelector('#public-subdomain-gateway')
        return el && el.value === expectedValue
      },
      TEST_SUBDOMAIN_GATEWAY,
      { timeout: 5000 }
    )

    const newValue = await publicSubdomainGatewayElement.evaluate(el => el.value)
    expect(newValue).toBe(TEST_SUBDOMAIN_GATEWAY)

    // Test reset button
    await publicSubdomainGatewayResetButton.click()

    // Verify reset to default
    const resetValue = await publicSubdomainGatewayElement.evaluate(el => el.value)
    expect(resetValue).toBe(DEFAULT_SUBDOMAIN_GATEWAY)
  })

  test('Submit/Reset Public Path Gateway', async ({ page }) => {
    // Wait for the necessary elements to be available in the DOM
    const publicGatewayElement = await page.waitForSelector('#public-gateway')
    const publicGatewaySubmitButton = page.locator('#public-path-gateway-submit-button')
    const publicGatewayResetButton = page.locator('#public-path-gateway-reset-button')

    // Store initial value (should be DEFAULT_PATH_GATEWAY)
    const initialValue = await publicGatewayElement.evaluate(el => el.value)
    expect(initialValue).toBe(DEFAULT_PATH_GATEWAY)

    // First, set an invalid value to verify red border appears
    await publicGatewayElement.click({ clickCount: 3 })
    await publicGatewayElement.fill('not-a-valid-url')

    // Wait for validation to fail and show red outline
    const hasRedOutline = await checkClassWithTimeout(page, publicGatewayElement, 'focus-outline-red', 5000)
    expect(hasRedOutline).toBe(true)

    // Verify submit button is disabled for invalid input
    await expect(publicGatewaySubmitButton).toBeDisabled()

    // Now change to valid test gateway (which bypasses validation)
    await publicGatewayElement.click({ clickCount: 3 })
    await publicGatewayElement.fill(TEST_PATH_GATEWAY)

    // Wait for validation to complete by checking for green outline
    // Since TEST_PATH_GATEWAY bypasses validation, it should pass quickly
    const hasGreenOutline = await checkClassWithTimeout(page, publicGatewayElement, 'focus-outline-green', 5000)
    expect(hasGreenOutline).toBe(true)

    // Wait for submit button to become enabled after validation
    await expect(publicGatewaySubmitButton).toBeEnabled({ timeout: 5000 })

    // Click submit
    await publicGatewaySubmitButton.click()

    // Wait for value to persist
    await page.waitForFunction(
      (expectedValue) => {
        const el = document.querySelector('#public-gateway')
        return el && el.value === expectedValue
      },
      TEST_PATH_GATEWAY,
      { timeout: 5000 }
    )

    const newValue = await publicGatewayElement.evaluate(el => el.value)
    expect(newValue).toBe(TEST_PATH_GATEWAY)

    // Test reset button
    await publicGatewayResetButton.click()

    // Verify reset to default
    const resetValue = await publicGatewayElement.evaluate(el => el.value)
    expect(resetValue).toBe(DEFAULT_PATH_GATEWAY)
  })

  test('Language selector', async ({ page }) => {
    const languages = await getLanguages()
    // Test with just a few languages to avoid timeout issues
    const testLanguages = ['en', 'es', 'fr'].filter(lang => languages[lang])
    for (const lang of testLanguages) {
      // click the 'change language' button
      const changeLanguageBtn = await page.waitForSelector('.e2e-languageSelector-changeBtn')

      // Ensure the button is in viewport before clicking
      await changeLanguageBtn.scrollIntoViewIfNeeded()
      await changeLanguageBtn.click()

      // wait for the language modal to appear
      await page.waitForSelector('.e2e-languageModal')

      // Use JavaScript to click the element to avoid viewport issues
      await page.evaluate((selector) => {
        const element = document.querySelector(selector)
        if (element) {
          element.click()
        }
      }, `.e2e-languageModal-lang_${lang}`)

      // wait for the language modal to disappear
      await page.waitForSelector('.e2e-languageModal', { state: 'hidden' })

      // check that the language has changed
      await page.waitForSelector('.e2e-languageSelector-current', { text: languages[lang].nativeName })

      // confirm the localStorage setting was applied
      const i18nLang = await page.evaluate('localStorage.getItem(\'i18nextLng\')')
      expect(i18nLang).toBe(lang)
    }
  })
})

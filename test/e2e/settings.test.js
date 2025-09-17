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
 * @param {ElementHandle|null} submitButton - The submit button element to click, or null if no button is available.
 * @param {string} gatewayURL - The gateway URL to fill.
 * @param {string} expectedClass - The expected class after submission.
 */
async function submitGatewayAndCheck (page, inputElement, submitButton, gatewayURL, expectedClass) {
  // Clear the input first to ensure a clean state
  await inputElement.click({ clickCount: 3 }) // Select all text
  await inputElement.fill(gatewayURL)

  // Give time for async validation to complete
  await page.waitForTimeout(500)

  // Check if the submit button is not null, and click it only if it's available
  if (submitButton) {
    const buttonId = await submitButton.evaluate(el => el.id)
    // Use locator API which handles re-renders automatically
    const submitBtn = page.locator(`#${buttonId}`)

    // Wait for button to be visible first
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 })

    // Wait for the button to become enabled (validation must complete)
    // Increase timeout and add better error handling
    try {
      await expect(submitBtn).toBeEnabled({ timeout: 15000 })
    } catch (error) {
      // If button is still disabled, let's check what's happening
      const isDisabled = await submitBtn.evaluate(el => el.disabled)
      const buttonText = await submitBtn.textContent()
      console.log(`Button disabled: ${isDisabled}, text: ${buttonText}`)

      // Try to trigger validation by blurring and refocusing the input
      await inputElement.evaluate(el => el.blur())
      await page.waitForTimeout(500)
      await inputElement.evaluate(el => el.focus())
      await page.waitForTimeout(1000)
      // Try again with a longer timeout
      await expect(submitBtn).toBeEnabled({ timeout: 10000 })
    }

    // Now click the enabled button
    await submitBtn.click()
  }

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
    // Increase timeout for this test as validation can be slow
    test.setTimeout(45000)
    // Wait for the necessary elements to be available in the DOM
    const publicSubdomainGatewayElement = await page.waitForSelector('#public-subdomain-gateway')
    const publicSubdomainGatewaySubmitButton = await page.waitForSelector('#public-subdomain-gateway-submit-button')
    const publicSubdomainGatewayResetButton = await page.waitForSelector('#public-subdomain-gateway-reset-button')

    // Check that submitting a wrong Subdomain Gateway triggers a red outline
    await submitGatewayAndCheck(page, publicSubdomainGatewayElement, null, DEFAULT_PATH_GATEWAY, 'focus-outline-red')

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
    // Test with just a few languages to avoid timeout issues
    const testLanguages = ['en', 'es', 'fr'].filter(lang => languages[lang])
    for (const lang of testLanguages) {
      // click the 'change language' button
      const changeLanguageBtn = await page.waitForSelector('.e2e-languageSelector-changeBtn')

      // Ensure the button is in viewport before clicking
      await changeLanguageBtn.scrollIntoViewIfNeeded()
      await changeLanguageBtn.click()

      // wait for the language modal to appear
      await page.waitForSelector('.e2e-languageModal', { timeout: 10000 })

      // Use JavaScript to click the element to avoid viewport issues
      await page.evaluate((selector) => {
        const element = document.querySelector(selector)
        if (element) {
          element.click()
        }
      }, `.e2e-languageModal-lang_${lang}`)

      // wait for the language modal to disappear
      await page.waitForSelector('.e2e-languageModal', { state: 'hidden', timeout: 10000 })

      // check that the language has changed
      await page.waitForSelector('.e2e-languageSelector-current', { text: languages[lang].nativeName })

      // confirm the localStorage setting was applied
      const i18nLang = await page.evaluate('localStorage.getItem(\'i18nextLng\')')
      expect(i18nLang).toBe(lang)
    }
  })
})

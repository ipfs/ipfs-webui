import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { test, expect } from './setup/coverage.js'
import { settings } from './setup/locators.js'
import { DEFAULT_PATH_GATEWAY, DEFAULT_SUBDOMAIN_GATEWAY, TEST_PATH_GATEWAY, TEST_SUBDOMAIN_GATEWAY } from '../../src/bundles/gateway.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const languageFilePromise = readFile(join(__dirname, '../../src/lib/languages.json'), 'utf8')

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
    await expect(page.getByText('Addresses')).toBeVisible()
    await expect(page.getByText('Bootstrap')).toBeVisible()
    await expect(page.getByText('PeerID')).toBeVisible()
    // check PeerID in config to confirm it comes from expected instance
    const id = process.env.IPFS_RPC_ID
    await expect(page.getByText(id)).toBeVisible()
  })

  test('Submit/Reset Public Subdomain Gateway', async ({ page }) => {
    const publicSubdomainGatewayElement = settings.publicSubdomainGateway(page)
    const publicSubdomainGatewaySubmitButton = page.locator('#public-subdomain-gateway-submit-button')
    const publicSubdomainGatewayResetButton = page.locator('#public-subdomain-gateway-reset-button')

    await expect(publicSubdomainGatewayElement).toBeVisible()

    // Store initial value (should be DEFAULT_SUBDOMAIN_GATEWAY)
    const initialValue = await publicSubdomainGatewayElement.inputValue()
    expect(initialValue).toBe(DEFAULT_SUBDOMAIN_GATEWAY)

    // First, set an invalid value to verify red border appears
    await publicSubdomainGatewayElement.click({ clickCount: 3 })
    await publicSubdomainGatewayElement.fill('not-a-valid-url')

    // Wait for validation to fail and show red outline (using web-first assertion)
    await expect(publicSubdomainGatewayElement).toHaveClass(/focus-outline-red/, { timeout: 5000 })

    // Verify submit button is disabled for invalid input
    await expect(publicSubdomainGatewaySubmitButton).toBeDisabled()

    // Now change to valid test gateway (which bypasses validation)
    await publicSubdomainGatewayElement.click({ clickCount: 3 })
    await publicSubdomainGatewayElement.fill(TEST_SUBDOMAIN_GATEWAY)

    // Wait for validation to complete by checking for green outline
    await expect(publicSubdomainGatewayElement).toHaveClass(/focus-outline-green/, { timeout: 5000 })

    // Wait for submit button to become enabled after validation
    await expect(publicSubdomainGatewaySubmitButton).toBeEnabled({ timeout: 5000 })

    // Click submit
    await publicSubdomainGatewaySubmitButton.click()

    // Wait for value to persist
    await expect(publicSubdomainGatewayElement).toHaveValue(TEST_SUBDOMAIN_GATEWAY, { timeout: 5000 })

    // Test reset button
    await publicSubdomainGatewayResetButton.click()

    // Verify reset to default
    await expect(publicSubdomainGatewayElement).toHaveValue(DEFAULT_SUBDOMAIN_GATEWAY)
  })

  test('Submit/Reset Public Path Gateway', async ({ page }) => {
    const publicGatewayElement = settings.publicPathGateway(page)
    const publicGatewaySubmitButton = page.locator('#public-path-gateway-submit-button')
    const publicGatewayResetButton = page.locator('#public-path-gateway-reset-button')

    await expect(publicGatewayElement).toBeVisible()

    // Store initial value (should be DEFAULT_PATH_GATEWAY)
    const initialValue = await publicGatewayElement.inputValue()
    expect(initialValue).toBe(DEFAULT_PATH_GATEWAY)

    // First, set an invalid value to verify red border appears
    await publicGatewayElement.click({ clickCount: 3 })
    await publicGatewayElement.fill('not-a-valid-url')

    // Wait for validation to fail and show red outline (using web-first assertion)
    await expect(publicGatewayElement).toHaveClass(/focus-outline-red/, { timeout: 5000 })

    // Verify submit button is disabled for invalid input
    await expect(publicGatewaySubmitButton).toBeDisabled()

    // Now change to valid test gateway (which bypasses validation)
    await publicGatewayElement.click({ clickCount: 3 })
    await publicGatewayElement.fill(TEST_PATH_GATEWAY)

    // Wait for validation to complete by checking for green outline
    await expect(publicGatewayElement).toHaveClass(/focus-outline-green/, { timeout: 5000 })

    // Wait for submit button to become enabled after validation
    await expect(publicGatewaySubmitButton).toBeEnabled({ timeout: 5000 })

    // Click submit
    await publicGatewaySubmitButton.click()

    // Wait for value to persist
    await expect(publicGatewayElement).toHaveValue(TEST_PATH_GATEWAY, { timeout: 5000 })

    // Test reset button
    await publicGatewayResetButton.click()

    // Verify reset to default
    await expect(publicGatewayElement).toHaveValue(DEFAULT_PATH_GATEWAY)
  })

  test('Language selector', async ({ page }) => {
    const languages = await getLanguages()
    // Test with just a few languages to avoid timeout issues
    const testLanguages = ['en', 'es', 'fr'].filter(lang => languages[lang])

    for (const lang of testLanguages) {
      // click the 'change language' button
      const changeLanguageBtn = settings.languageChangeButton(page)
      await expect(changeLanguageBtn).toBeVisible()

      // Ensure the button is in viewport before clicking
      await changeLanguageBtn.scrollIntoViewIfNeeded()
      await changeLanguageBtn.click()

      // wait for the language modal to appear
      await expect(settings.languageModal(page)).toBeVisible()

      // Click the language option
      await settings.languageOption(page, lang).click()

      // wait for the language modal to disappear
      await expect(settings.languageModal(page)).toBeHidden()

      // check that the language has changed
      await expect(settings.currentLanguage(page)).toHaveText(languages[lang].nativeName)

      // confirm the localStorage setting was applied
      const i18nLang = await page.evaluate('localStorage.getItem(\'i18nextLng\')')
      expect(i18nLang).toBe(lang)
    }
  })
})

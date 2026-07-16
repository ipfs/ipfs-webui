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
    // Scope to the config editor and match whole JSON keys: these words appear
    // as prose elsewhere on the page, and as substrings of other keys (e.g.
    // "LoopbackAddressesOnLanDHT"), so an unscoped substring match is ambiguous.
    const config = page.locator('.ace_editor')
    await expect(config.getByText('"Addresses"', { exact: true })).toBeVisible()
    await expect(config.getByText('"Bootstrap"', { exact: true })).toBeVisible()
    await expect(config.getByText('"PeerID"', { exact: true })).toBeVisible()
    // check PeerID in config to confirm it comes from expected instance
    const id = process.env.IPFS_RPC_ID
    await expect(config.getByText(id)).toBeVisible()
  })

  test('Submit/Clear Public Subdomain Gateway', async ({ page }) => {
    const publicSubdomainGatewayElement = settings.publicSubdomainGateway(page)
    const publicSubdomainGatewaySubmitButton = page.locator('#public-subdomain-gateway-submit-button')
    const publicSubdomainGatewayClearButton = page.locator('#public-subdomain-gateway-clear-button')

    await expect(publicSubdomainGatewayElement).toBeVisible()

    // Prefilled with the default subdomain gateway; Clear opts out of it.
    await expect(publicSubdomainGatewayElement).toHaveValue(DEFAULT_SUBDOMAIN_GATEWAY)

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

    // Clear empties the field
    await publicSubdomainGatewayClearButton.click()
    await expect(publicSubdomainGatewayElement).toHaveValue('')
  })

  test('Submit/Clear Public Path Gateway', async ({ page }) => {
    const publicGatewayElement = settings.publicPathGateway(page)
    const publicGatewaySubmitButton = page.locator('#public-path-gateway-submit-button')
    const publicGatewayClearButton = page.locator('#public-path-gateway-clear-button')

    await expect(publicGatewayElement).toBeVisible()

    // Prefilled with the default path gateway; Clear opts out of it.
    await expect(publicGatewayElement).toHaveValue(DEFAULT_PATH_GATEWAY)

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

    // Clear empties the field
    await publicGatewayClearButton.click()
    await expect(publicGatewayElement).toHaveValue('')
  })

  test('Submit Local Gateway and confirm it is applied', async ({ page }) => {
    // A distinctive hostname we can spot on the Status page to confirm the
    // override is in use. It resolves to 127.0.0.1, so it still reaches the e2e
    // kubo gateway for previews.
    const localGatewayUrl = `http://custom-gw-test.localhost:${process.env.IPFS_GATEWAY_PORT}`
    const input = page.locator('#local-gateway')
    const submitButton = page.locator('#local-gateway-submit-button')

    await expect(input).toBeVisible()

    // empty by default (falls back to the gateway from Kubo config)
    await expect(input).toHaveValue('')

    await input.fill(localGatewayUrl)

    // valid URL format shows the green outline and enables submit
    await expect(input).toHaveClass(/focus-outline-green/, { timeout: 5000 })
    await expect(submitButton).toBeEnabled()

    // submit saves the override (URL format is validated, no reachability probe)
    await submitButton.click()

    // saved: no pending changes, so submit goes back to disabled, value persists
    await expect(submitButton).toBeDisabled({ timeout: 10000 })
    await expect(input).toHaveValue(localGatewayUrl)

    // confirm the override is applied where it matters: the Status page Advanced
    // panel renders selectGatewayUrl, which now resolves to the override
    await page.goto('/#/')
    const gatewayValue = page.getByText(localGatewayUrl)
    if (!(await gatewayValue.isVisible())) {
      await page.getByText('Advanced').click()
    }
    await expect(gatewayValue).toBeVisible()
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

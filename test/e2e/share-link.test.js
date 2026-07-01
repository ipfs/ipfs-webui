import { test, expect } from './setup/coverage.js'
import { files, dismissImportNotification } from './setup/locators.js'
import { create } from 'kubo-rpc-client'

// "hello world" as an inline (identity-hash) raw CIDv1, so it resolves offline
// and its base32 form is short enough for a subdomain label.
const CID = 'bafkqac3imvwgy3zao5xxe3de'
const FILENAME = 'share-link-e2e.txt'
const KUBO_GATEWAY = `http://127.0.0.1:${process.env.IPFS_GATEWAY_PORT}`

const SETTING_KEYS = {
  type: 'ipfsShareLinkType',
  localGateway: 'ipfsLocalGateway',
  publicGateway: 'ipfsPublicGateway',
  publicSubdomainGateway: 'ipfsPublicSubdomainGateway'
}

// These settings live in localStorage as plain strings and are read on init, so
// set them, then reload for the gateway bundle to pick them up.
const applySettings = async (page, settings) => {
  await page.evaluate(({ map, s }) => {
    Object.values(map).forEach((key) => window.localStorage.removeItem(key))
    for (const prop of Object.keys(map)) {
      if (s[prop] != null) window.localStorage.setItem(map[prop], s[prop])
    }
  }, { map: SETTING_KEYS, s: settings })
}

// Opens the Share modal for the seeded file and returns the readonly link input.
const openShareLinkInput = async (page) => {
  await dismissImportNotification(page)
  const row = page.getByTestId('file-row').filter({ hasText: FILENAME })
  await expect(row).toBeVisible({ timeout: 30000 })
  await files.contextMenuButton(page, FILENAME).click()
  await files.contextMenuItem(page, 'Share link').click()
  return page.locator('div[role="dialog"] input[readonly]')
}

test.describe.serial('Share Link types', () => {
  test.beforeEach(async () => {
    // Seed a known file into MFS so a row is always present to share.
    const ipfs = create(process.env.IPFS_RPC_ADDR)
    await ipfs.files.cp(`/ipfs/${CID}`, `/${FILENAME}`, { flush: true }).catch(() => {})
  })

  test('default is a native ipfs:// URI (base32 CIDv1)', async ({ page }) => {
    await page.goto('/#/files')
    await applySettings(page, {})
    await page.reload()
    const input = await openShareLinkInput(page)
    await expect(input).toHaveValue(`ipfs://${CID}?filename=${FILENAME}`)
  })

  test('local path defaults to the Kubo config gateway', async ({ page }) => {
    await page.goto('/#/')
    await applySettings(page, { type: 'local-path' })
    await page.reload()
    // The Status page Advanced panel renders selectGatewayUrl: this both loads
    // the Kubo config and confirms the default local gateway matches it.
    const gatewayText = page.getByText(KUBO_GATEWAY, { exact: false })
    if (!(await gatewayText.first().isVisible().catch(() => false))) {
      await page.getByText('Advanced').click()
    }
    await expect(gatewayText.first()).toBeVisible({ timeout: 30000 })

    await page.goto('/#/files')
    const input = await openShareLinkInput(page)
    await expect(input).toHaveValue(`${KUBO_GATEWAY}/ipfs/${CID}?filename=${FILENAME}`)
  })

  test('local path honors a custom-port override', async ({ page }) => {
    await page.goto('/#/files')
    await applySettings(page, { type: 'local-path', localGateway: 'http://127.0.0.1:9999' })
    await page.reload()
    const input = await openShareLinkInput(page)
    await expect(input).toHaveValue(`http://127.0.0.1:9999/ipfs/${CID}?filename=${FILENAME}`)
  })

  test('local subdomain uses localhost', async ({ page }) => {
    await page.goto('/#/files')
    await applySettings(page, { type: 'local-subdomain', localGateway: 'http://127.0.0.1:9999' })
    await page.reload()
    const input = await openShareLinkInput(page)
    await expect(input).toHaveValue(`http://${CID}.ipfs.localhost:9999?filename=${FILENAME}`)
  })

  test('public path uses the configured public path gateway', async ({ page }) => {
    await page.goto('/#/files')
    await applySettings(page, { type: 'public-path', publicGateway: 'https://path-gw.example.com' })
    await page.reload()
    const input = await openShareLinkInput(page)
    await expect(input).toHaveValue(`https://path-gw.example.com/ipfs/${CID}?filename=${FILENAME}`)
  })

  test('public subdomain uses the configured public subdomain gateway', async ({ page }) => {
    await page.goto('/#/files')
    await applySettings(page, { type: 'public-subdomain', publicSubdomainGateway: 'https://subdomain-gw.example.net' })
    await page.reload()
    const input = await openShareLinkInput(page)
    await expect(input).toHaveValue(`https://${CID}.ipfs.subdomain-gw.example.net?filename=${FILENAME}`)
  })

  test('selecting a type in Settings persists the choice', async ({ page }) => {
    await page.goto('/#/settings')
    await applySettings(page, {})
    await page.reload()
    // Native is the default; pick the local path option and confirm it is stored.
    await page.getByText('Local gateway, path link', { exact: true }).click()
    await expect
      .poll(() => page.evaluate((k) => {
        const value = window.localStorage.getItem(k)
        try { return JSON.parse(value) } catch { return value }
      }, SETTING_KEYS.type))
      .toBe('local-path')
  })
})

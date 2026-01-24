import { test, expect } from './setup/coverage.js'

test.describe('Navigation menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/blank')
  })

  test('should work for Status page', async ({ page }) => {
    const link = 'a[href="#/"]'
    await page.locator(link).waitFor()
    await page.locator('text=Status').waitFor()
    await page.locator(link).click()
    await expect(page).toHaveTitle('Status | IPFS')
  })

  test('should work for Files page', async ({ page }) => {
    const link = 'a[href="#/files"]'
    await page.locator(link).waitFor()
    await page.locator('text=Files').waitFor()
    await page.locator(link).click()
    await expect(page).toHaveTitle('/ | Files | IPFS')
  })

  test('should work for Explore page', async ({ page }) => {
    const link = 'a[href="#/explore"]'
    await page.locator(link).waitFor()
    await page.locator('text=Explore').waitFor()
    await page.locator(link).click()
    await expect(page).toHaveTitle('Explore | IPLD')
  })

  test('should work for Peers page', async ({ page }) => {
    const link = 'a[href="#/peers"]'
    await page.locator(link).waitFor()
    await page.locator('text=Peers').waitFor()
    await page.locator(link).click()
    await expect(page).toHaveTitle('Peers | IPFS')
  })

  test('should work for Settings page', async ({ page }) => {
    const link = 'a[href="#/settings"]'
    await page.locator(link).waitFor()
    await page.locator('text=Settings').waitFor()
    await page.locator(link).click()
    await expect(page).toHaveTitle('Settings | IPFS')
  })
})

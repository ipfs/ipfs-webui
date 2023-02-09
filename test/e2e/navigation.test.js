import { test, expect } from './setup/coverage.js'

test.describe('Navigation menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/blank')
  })

  test('should work for Status page', async ({ page }) => {
    const link = 'a[href="#/"]'
    await page.waitForSelector(link)
    await page.waitForSelector('text=Status')
    await page.click(link)
    await expect(page).toHaveTitle('Status | IPFS')
  })

  test('should work for Files page', async ({ page }) => {
    const link = 'a[href="#/files"]'
    await page.waitForSelector(link)
    await page.waitForSelector('text=Files')
    await page.click(link)
    await expect(page).toHaveTitle('/ | Files | IPFS')
  })

  test('should work for Explore page', async ({ page }) => {
    const link = 'a[href="#/explore"]'
    await page.waitForSelector(link)
    await page.waitForSelector('text=Explore')
    await page.click(link)
    await expect(page).toHaveTitle('Explore | IPLD')
  })

  test('should work for Peers page', async ({ page }) => {
    const link = 'a[href="#/peers"]'
    await page.waitForSelector(link)
    await page.waitForSelector('text=Peers')
    await page.click(link)
    await expect(page).toHaveTitle('Peers | IPFS')
  })

  test('should work for Settings page', async ({ page }) => {
    const link = 'a[href="#/settings"]'
    await page.waitForSelector(link)
    await page.waitForSelector('text=Settings')
    await page.click(link)
    await expect(page).toHaveTitle('Settings | IPFS')
  })
})

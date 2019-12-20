/* global webuiUrl, waitForTitle, page, describe, it, expect, beforeAll */

describe('Navigation menu', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl)
  })

  it('should work for Status page', async () => {
    await expect(page).toMatch('Status')
    await page.click('a[href="#/"]')
    await waitForTitle('Status - IPFS')
  })

  it('should work for Files page', async () => {
    await expect(page).toMatch('Files')
    await page.click('a[href="#/files"]')
    await waitForTitle('/ - Files - IPFS')
  })

  it('should work for Explore page', async () => {
    await expect(page).toMatch('Explore')
    await page.click('a[href="#/explore"]')
    await waitForTitle('Explore - IPLD')
  })

  it('should work for Peers page', async () => {
    await expect(page).toMatch('Peers')
    await page.click('a[href="#/peers"]')
    await waitForTitle('Peers - IPFS')
  })

  it('should work for Settings page', async () => {
    await expect(page).toMatch('Settings')
    await page.click('a[href="#/settings"]')
    await waitForTitle('Settings - IPFS')
  })
})

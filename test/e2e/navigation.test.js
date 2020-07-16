/* global webuiUrl, waitForTitle, page, describe, it, expect, beforeAll */

const scrollLinkContainer = async () => {
  const linkContainer = '[role="menubar"]'
  await page.waitForSelector(linkContainer)
  await page.evaluate(selector => {
    const scrollableSection = document.querySelector(selector)

    scrollableSection.scrollLeft = scrollableSection.offsetWidth
  }, linkContainer)
}

describe('Navigation menu', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl + '#/blank', { waitUntil: 'networkidle0' })
  })

  it('should work for Status page', async () => {
    const link = 'a[href="#/"]'
    await page.waitForSelector(link)
    await expect(page).toMatch('Status')
    await page.click(link)
    await waitForTitle('Status - IPFS')
  })

  it('should work for Files page', async () => {
    const link = 'a[href="#/files"]'
    await page.waitForSelector(link)
    await expect(page).toMatch('Files')
    await page.click(link)
    await waitForTitle('/ - Files - IPFS')
  })

  it('should work for Explore page', async () => {
    const link = 'a[href="#/explore"]'
    await page.waitForSelector(link)
    await expect(page).toMatch('Explore')
    await scrollLinkContainer()
    await page.click(link)
    await waitForTitle('Explore - IPLD')
  })

  it('should work for Peers page', async () => {
    const link = 'a[href="#/peers"]'
    await page.waitForSelector(link)
    await expect(page).toMatch('Peers')
    await scrollLinkContainer()
    await page.click(link)
    await waitForTitle('Peers - IPFS')
  })

  it('should work for Settings page', async () => {
    const link = 'a[href="#/settings"]'
    await page.waitForSelector(link)
    await expect(page).toMatch('Settings')
    await scrollLinkContainer()
    await page.click(link)
    await waitForTitle('Settings - IPFS')
  })
})

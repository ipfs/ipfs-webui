/* global webuiUrl, waitForTitle, page, describe, it, beforeAll */

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
    await page.goto(webuiUrl + '#/blank', { waitUntil: 'networkidle' })
  })

  it('should work for Status page', async () => {
    const link = 'a[href="#/"]'
    await page.waitForSelector(link)
    await page.waitForSelector('text=Status')
    await page.click(link)
    await waitForTitle('Status | IPFS')
  })

  it('should work for Files page', async () => {
    const link = 'a[href="#/files"]'
    await page.waitForSelector(link)
    await page.waitForSelector('text=Files')
    await page.click(link)
    await waitForTitle('/ | Files | IPFS')
  })

  it('should work for Explore page', async () => {
    const link = 'a[href="#/explore"]'
    await page.waitForSelector(link)
    await page.waitForSelector('text=Explore')
    await scrollLinkContainer()
    await page.click(link)
    await waitForTitle('Explore | IPLD')
  })

  it('should work for Peers page', async () => {
    const link = 'a[href="#/peers"]'
    await page.waitForSelector(link)
    await page.waitForSelector('text=Peers')
    await scrollLinkContainer()
    await page.click(link)
    await waitForTitle('Peers | IPFS')
  })

  it('should work for Settings page', async () => {
    const link = 'a[href="#/settings"]'
    await page.waitForSelector(link)
    await page.waitForSelector('text=Settings')
    await scrollLinkContainer()
    await page.click(link)
    await waitForTitle('Settings | IPFS')
  })
})

/* global webuiUrl, ipfs, page, describe, it, beforeAll, waitForText */

describe('IPNS publishing', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl + '#/settings', { waitUntil: 'networkidle' })
  })

  const keyName = 'pet-name-e2e-ipns-test'

  describe('Settings screen', () => {
    it('should list IPNS keys', async () => {
      await page.goto(webuiUrl + '#/settings', { waitUntil: 'networkidle' })
      // confirm the self key is displayed
      await waitForIPNSKeyList(ipfs, 'self')
    })

    it('should have a clickable "Generate key" button', async () => {
      const genKey = 'Generate Key'
      await waitForText(genKey)
      await page.click(`text=${genKey}`)
      await page.waitForSelector('div[role="dialog"]')
      await waitForText('Enter pet name of key to create')
    })

    it('should list new IPNS key with provided pet name ', async () => {
      // provide key name
      await page.type('div[role="dialog"] input[type="text"]', keyName)
      // hit Enter
      await page.keyboard.type('\n')
      // expect it to be added to key list under provided pet name
      await waitForIPNSKeyList(ipfs, 'self')
    })
  })

  describe('Files screen', () => {
    beforeAll(async () => {
      await page.goto(webuiUrl + '#/files', { waitUntil: 'networkidle' })
    })

    const testFilename = 'ipns-test.txt'
    const testCid = '/ipfs/bafyaaeqkcaeaeeqknfyg44znorsxg5akdafa'

    it('should have "Publish to IPNS" context action', async () => {
      // first: create a test file
      const button = 'button[id="import-button"]'
      await page.waitForSelector(button, { state: 'visible' })
      await page.click(button)
      await page.waitForSelector('#add-by-path', { state: 'visible' })
      page.click('button[id="add-by-path"]')
      await page.waitForSelector('div[role="dialog"] input[name="name"]')
      await page.fill('div[role="dialog"] input[name="path"]', testCid)
      await page.fill('div[role="dialog"] input[name="name"]', testFilename)
      await page.keyboard.type('\n')
      // expect file with matching filename to be added to the file list
      await page.waitForSelector(`.File:has-text("${testFilename}")`)
      // click on the context menu
      await page.click(`.File:has-text('${testFilename}') .file-context-menu`)
      // click on the IPNS action
      await page.waitForSelector(`.File:has-text("${testFilename}")`)
      // expect IPNS action to be present in the context menu
      await page.waitForSelector('button:has-text("Publish to IPNS")')
    })

    it('should allow selecting IPNS keys', async () => {
      // .. continue by clicking on context action
      await page.click('button:has-text("Publish to IPNS")')
      await page.waitForSelector('div[role="dialog"] .publishModalKeys')
      await page.click(`div[role="dialog"] .publishModalKeys button:has-text("${keyName}")`)
      await page.click('div[role="dialog"] button:has-text("Publish")')
    })

    /* TODO
    it('should execute IPNS publish and reflect that on Settings screen', async () => {
      await page.goto(webuiUrl + '#/settings', { waitUntil: 'networkidle' })
      await waitForIPNSKeyList(ipfs, keyName)
      // inspect link behind key id -- it should point at CID we used for publishing
      const { id } = await ipns.key.list().filter(k => k.name === keyName)[0]
      const keyIdCell = `a:has-text("${id}")`
      await page.waitForSelector(keyIdCell)
      const href = await page.getAttribute(keyIdCell, 'href')
      expect(href.includes(testCid)).toBeTruthy()
    })
    */
  })
})

// Confirm contents of IPNS Publishing Keys table on Settings screen
// are in sync with ipfs.key.list
async function waitForIPNSKeyList (ipfs, specificKey) {
  await waitForText('IPNS Publishing Keys')
  if (specificKey) await waitForText(specificKey)
  for (const { id, name } of await ipfs.key.list()) {
    await waitForText(id)
    await waitForText(name)
  }
}

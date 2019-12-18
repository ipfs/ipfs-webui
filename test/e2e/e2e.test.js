const fs = require('fs')

const landingPage = 'http://localhost:3001'
const waitForTitle = title => page.waitForFunction(`document.title === '${title}'`, { timeout: 8000 })

describe('Status page', () => {
  beforeAll(async () => {
    await page.goto(landingPage)
    // get multiaddr of http api
    const { apiHost, apiPort } = global.ipfs
    const apiMultiaddr = `/ip4/${apiHost}/tcp/${apiPort}`
    // point webui at real api
    await page.evaluate((apiMultiaddr) => localStorage.setItem('ipfsApi', apiMultiaddr), apiMultiaddr)
    // apply settings
    await page.goto(landingPage)
  })

  it('should have Status menu item', async () => {
    // this is just a basic smoke-test to tell if page loads at all
    await expect(page).toMatch('Status')
  })

  it('should inform it is sucessfully connected to IPFS', async () => {
    // confirm webui thinks it is connected to node
    await expect(page).toMatch('Connected to IPFS')
  })

  it('should display Peer ID of real IPFS node', async () => {
    // confirm webui is actually connected to expected node :^)
    const { id } = await ipfs.id()
    await expect(page).toMatch(id)
  })
})

describe('Navigation menu', () => {
  beforeAll(async () => {
    await page.goto(landingPage)
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

describe('Files screen', () => {
  beforeAll(async () => {
    await page.goto(landingPage + '#/files')
  })

  const button = 'button[id="add-button"]'

  it('should have the active Add menu', async () => {
    await page.waitForSelector(button, { visible: true })
    await page.click(button)
    await page.waitForSelector('#add-file', { visible: true })
    await expect(page).toMatch('File')
    await expect(page).toMatch('Folder')
    await expect(page).toMatch('From IPFS')
    await expect(page).toMatch('New folder')
    await page.click(button)
  })

  it('should allow for a successful import of a single file', async () => {
    await page.waitForSelector(button, { visible: true })
    await page.click(button)
    await page.waitForSelector('#add-file', { visible: true })

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('a[id="add-file"]'), // menu button that triggers file selection
    ])

    // lets add a static text file from the root of this repo
    const filename = 'LICENSE'
    await fileChooser.accept([filename])

    // expect file with matching filename to be added to the file list
    await page.waitForSelector('.File')
    await expect(page).toMatch(filename)

    // add file manually to get expected CID (with default params)
    const expectedData = fs.readFileSync(filename, 'utf8')
    const [result] = await ipfs.add(expectedData)

    // expect CID to be present on the page
    await expect(page).toMatch(result.hash)
  })
})


describe('Explore screen', () => {
  beforeAll(async () => {
    await page.goto(landingPage + '#/explore')
  })

  it('should have Project Apollo Archive as one of examples', async () => {
    await page.waitForSelector('a[href="#/explore/QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D"]')
    await expect(page).toMatch('Project Apollo Archive')
    await expect(page).toMatch('QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D')

  })

  it('should open arbitrary CID', async () => {
    // add a local file to repo so test is fast and works in offline mode
    const cid = 'bafkreicgkmwhdunxgdqwqveecdo3wqmgulb4azm6sfnrtvd7g47mnrixji'
    const expectedData = fs.readFileSync('LICENSE', 'utf8')
    const [result] = await ipfs.add(expectedData, { cidVersion: 1 })
    await expect(result.hash).toStrictEqual(cid)

    // open inspector
    await page.goto(landingPage + `#/explore/${cid}`)
    // expect node type
    await expect(page).toMatch('DAG Node')
    // expect cid details
    await expect(page).toMatch('base32 - cidv1 - raw - sha2-256-256-46532c71d1b730e168548410ddbb4186a2c3c0659e915b19d47f373ec6c5174a')
  })

})

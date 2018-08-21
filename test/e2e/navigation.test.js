/* global it expect beforeAll afterAll */
import ms from 'milliseconds'
import { launch, appUrl } from './puppeteer'
import IPFS from 'ipfs'

let browser
let node

beforeAll(done => {
  node = new IPFS()

  node.on('ready', async () => {
    browser = await launch()
    done()
  })
})

afterAll(async () => {
  browser.close()
  await node.stop()
})

it('Navigation test: node not running', async () => {
  const page = (await browser.pages())[0]
  await page.goto(appUrl)
  page.waitForFunction(`document.title === 'Welcome to IPFS'`, {timeout: 5000})
}, ms.minutes(1))

it('Navigation test: node running', async () => {
  // Save 3s per run by using the initial page rather than creating a new one!
  // const page = await browser.newPage()
  const page = (await browser.pages())[0]

  await page.evaluate(() => {
    window.ipfs = node
  })

  const waitForTitle = title => page.waitForFunction(`document.title === '${title}'`, {timeout: 5000})

  await page.goto(appUrl)
  await waitForTitle('Status - IPFS')

  await page.click('nav a[href="#/files/"]')
  await waitForTitle('Files - IPFS')

  await page.click('nav a[href="#/explore"]')
  await waitForTitle('Explore - IPFS')

  await page.click('nav a[href="#/peers"]')
  await waitForTitle('Peers - IPFS')

  // No settings tab if IPFS is not available.
  const settingsLink = await page.$('nav a[href="#/settings"]')
  expect(settingsLink).toBeNull()

  await page.click('nav a[href="#/"]')
  await waitForTitle('Status - IPFS')
})

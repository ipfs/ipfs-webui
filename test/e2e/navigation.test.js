/* global it expect beforeAll afterAll */
import ms from 'milliseconds'
import { launch, appUrl } from './puppeteer'

let browser

beforeAll(async () => { browser = await launch() })
afterAll(() => browser.close())

it('Navigation test: node not running', async () => {
  const page = await browser.newPage()
  await page.goto(appUrl)
  page.waitForFunction(`document.title === 'Welcome to IPFS'`, {timeout: 5000})
}, ms.minutes(1))

it('Navigation test: node running', async () => {
  const page = await browser.newPage()

  await page.evaluateOnNewDocument(() => {
    window.ipfs = {
      id: () => {},
      files: {
        ls: () => [],
        stat: () => {}
      }
    }
  })

  const waitForTitle = title => page.waitForFunction(`document.title === '${title}'`, {timeout: 5000})

  await page.goto(appUrl)
  await waitForTitle('Status - IPFS')

  await page.click('nav a[href="#/explore"]')
  await waitForTitle('Explore - IPFS')

  await page.click('nav a[href="#/peers"]')
  await waitForTitle('Peers - IPFS')

  await page.click('nav a[href="#/files/"]')
  await waitForTitle('Files - IPFS') // fails here?

  // No settings tab if IPFS is not available.
  const settingsLink = await page.$('nav a[href="#/settings"]')
  expect(settingsLink).toBeNull()

  await page.click('nav a[href="#/"]')
  await waitForTitle('Status - IPFS')
}, ms.minutes(1))

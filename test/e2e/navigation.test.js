/* global it expect beforeAll afterAll */
import ms from 'milliseconds'
import { launch, appUrl } from './puppeteer'

let browser

beforeAll(async () => { browser = await launch() })
afterAll(() => browser.close())

it('Navigation test', async () => {
  // Save 3s per run by using the initial page rather than creating a new one!
  // const page = await browser.newPage()
  const page = (await browser.pages())[0]

  const waitForTitle = title => page.waitForFunction(`document.title === '${title}'`, {timeout: 60000})

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
}, ms.minutes(1))

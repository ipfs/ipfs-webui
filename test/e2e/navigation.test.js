/* global it beforeAll afterAll, expect */
import ms from 'milliseconds'
import { launch, appUrl } from './puppeteer'

let browser

beforeAll(async () => { browser = await launch() })
afterAll(() => browser.close())

it('example test', async () => {
  const page = await browser.newPage()
  await page.goto(appUrl)

  await page.waitForSelector('[data-id=StatusPage]')
  let title = await page.title()
  expect(title).toBe('Status - IPFS')

  await page.click('nav a[href="#/files/"]')
  await page.waitForSelector('[data-id=FilesPage]')
  title = await page.title()
  expect(title).toBe('Files - IPFS')

  await page.click('nav a[href="#/explore"]')
  await page.waitForSelector('[data-id=ExplorePage]')
  title = await page.title()
  expect(title).toBe('Explore - IPFS')

  await page.click('nav a[href="#/peers"]')
  await page.waitForSelector('[data-id=PeersPage]')
  title = await page.title()
  expect(title).toBe('Peers - IPFS')

  await page.click('nav a[href="#/settings"]')
  await page.waitForSelector('[data-id=SettingsPage]')
  title = await page.title()
  expect(title).toBe('Settings - IPFS')

  await page.click('nav a[href="#/"]')
  await page.waitForSelector('[data-id=StatusPage]')
  title = await page.title()
  expect(title).toBe('Status - IPFS')
}, ms.minutes(1))

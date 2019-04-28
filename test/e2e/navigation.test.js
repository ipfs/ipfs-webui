/* global it expect beforeAll afterAll */
import ms from 'milliseconds'
import { launch, appUrl } from './puppeteer'

let browser

beforeAll(async () => { browser = await launch() })
afterAll(() => browser.close())

it('Navigation test: node not running', async () => {
  // Save 3s per run by using the initial page rather than creating a new one!
  // const page = await browser.newPage()
  const page = (await browser.pages())[0]
  await page.goto(appUrl)
  await page.waitForFunction(`document.title === 'Welcome to IPFS'`, { timeout: 8000 })
}, ms.minutes(1))

it('Navigation test: node running', async () => {
  const page = await browser.newPage()

  await addMockIpfs(page)

  const waitForTitle = title => page.waitForFunction(`document.title === '${title}'`, { timeout: 8000 })

  await page.goto(appUrl)
  await waitForTitle('Status - IPFS')

  await page.click('nav a[href="#/files/"]')
  await waitForTitle('Files - IPFS')

  await page.click('nav a[href="#/explore"]')
  await waitForTitle('Explore - IPLD')

  await page.click('nav a[href="#/peers"]')
  await waitForTitle('Peers - IPFS')

  await page.click('nav a[href="#/settings"]')
  await waitForTitle('Settings - IPFS')

  await page.click('nav a[href="#/"]')
  await waitForTitle('Status - IPFS')
}, ms.minutes(1))

// Pretend to be IPFS companion so we can mock out ipfs responses
// NOTE: this can get fancier as we test more nuances.
// returns a promise.
function addMockIpfs (page) {
  return page.evaluateOnNewDocument(mock => {
    const mockIpfs = {
      id: () => Promise.resolve({}),
      get: () => Promise.resolve({}),
      files: {
        get: () => Promise.resolve({}),
        ls: () => Promise.resolve([]),
        stat: () => Promise.resolve({})
      },
      stats: {
        bw: () => Promise.resolve({ totalIn: 10, totalOut: 11, rateIn: 12, rateOut: 13 }),
        repo: () => Promise.resolve({}),
        bitswap: () => Promise.resolve({})
      },
      swarm: {
        peers: () => Promise.resolve([])
      },
      config: {
        get: () => Promise.resolve({
          Addresses: {
            Gateway: '/ip4/127.0.0.1/tcp/8080',
            API: '/ip4/127.0.0.1/tcp/5001'
          }
        })
      }
    }
    if (!window.chrome) {
      // window.chrome seems not to be defined when tests are run headless.
      window.chrome = {}
    }
    window.chrome.extension = {
      getBackgroundPage () {
        return {
          ipfsCompanion: {
            ipfs: mockIpfs
          }
        }
      }
    }
  })
}

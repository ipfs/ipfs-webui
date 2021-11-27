// custom environment with IPFS API in global scope
const { getPlaywrightEnv } = require('jest-playwright-preset')
const PlaywrightEnvironment = getPlaywrightEnv()
const { expect } = require('@playwright/test')
const { matchers } = require('expect-playwright')

expect.extend(matchers)

class WebuiTestEnvironment extends PlaywrightEnvironment {
  async setup () {
    await super.setup()

    // define globals that should be available in tests
    this.global.ipfs = global.__IPFS__
    this.global.webuiUrl = global.__WEBUI_URL__
    this.global.waitForTitle = title => page.waitForFunction(`document.title === '${title}'`)

    const { ipfs, webuiUrl, page } = this.global

    page.setDefaultTimeout(30 * 1000)

    // point WebUI at the HTTP API URL
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto(webuiUrl)
    const { apiHost, apiPort } = ipfs
    const apiMultiaddr = `/ip4/${apiHost}/tcp/${apiPort}`
    // on initial page load webui checks page's localStorage for `ipfsApi` value
    // and uses the address if present. below sets it to the address of HTTP API
    await page.evaluate((apiMultiaddr) =>
      localStorage.setItem('ipfsApi', apiMultiaddr), apiMultiaddr)
    await page.waitForFunction(`localStorage.getItem('ipfsApi') === '${apiMultiaddr}'`)
    await page.reload({ waitUntil: 'networkidle' })

    // open Status page, confirm working connection to API
    await page.goto(webuiUrl + '#/', { waitUntil: 'networkidle' })
    const { id } = await ipfs.id()
    await page.waitForSelector(`text=${id}`)
  }
}

module.exports = WebuiTestEnvironment

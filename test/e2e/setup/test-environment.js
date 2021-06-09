// custom environment with IPFS API in global scope
const { getPlaywrightEnv } = require('jest-playwright-preset')
const PlaywrightEnvironment = getPlaywrightEnv()
const { expect } = require('@playwright/test')
const { matchers } = require('expect-playwright')
const { Date, console, Promise, setTimeout } = require('window-or-global')

expect.extend(matchers)

function waitForTextFn (page) {
  const waitForText = async (text, { timeout, selector } = { timeout: 30000, selector: 'body' }) => {
    timeout = timeout || 30000
    selector = selector || 'body'
    const start = new Date()
    const retryInterval = 500
    try {
      return await expect(page).toHaveText(selector, text, { timeout })
    } catch (e) {
      console.log(`waiting for text "${text}" to appear on page. retrying in ${retryInterval}ms`)
      const elapsed = (new Date()) - start
      if (elapsed < timeout) {
        await new Promise(resolve => setTimeout(resolve, retryInterval))
        return await waitForText(text, { timeout: timeout - elapsed - retryInterval })
      }
    }
  }
  return waitForText
}

class WebuiTestEnvironment extends PlaywrightEnvironment {
  async setup () {
    await super.setup()

    // define globals that should be available in tests
    this.global.ipfs = global.__IPFS__
    this.global.webuiUrl = global.__WEBUI_URL__
    this.global.waitForTitle = title => page.waitForFunction(`document.title === '${title}'`)
    this.global.waitForText = waitForTextFn(this.global.page)

    const { ipfs, webuiUrl, page, waitForText } = this.global

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
    await waitForText(id)
  }
}

module.exports = WebuiTestEnvironment

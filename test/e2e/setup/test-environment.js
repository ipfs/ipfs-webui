// custom environment with IPFS API in global scope
const PuppeteerEnvironment = require('jest-environment-puppeteer')
const expect = require('expect-puppeteer')

class WebuiTestEnvironment extends PuppeteerEnvironment {
  async setup () {
    await super.setup()

    // define globals that should be available in tests
    this.global.ipfs = global.__IPFS__
    this.global.webuiUrl = global.__WEBUI_URL__
    this.global.waitForTitle = title => page.waitForFunction(`document.title === '${title}'`, { timeout: 8000 })

    const { ipfs, webuiUrl, page } = this.global

    // point WebUI at the HTTP API URL
    await page.setViewport({ width: 1366, height: 768 })
    await page.goto(webuiUrl)
    const { apiHost, apiPort } = ipfs
    const apiMultiaddr = `/ip4/${apiHost}/tcp/${apiPort}`
    // on initial page load webui checks page's localStorage for `ipfsApi` value
    // and uses the address if present. below sets it to the address of HTTP API
    await page.evaluate((apiMultiaddr) =>
      localStorage.setItem('ipfsApi', apiMultiaddr), apiMultiaddr)
    await page.reload()

    // open Status page, confirm working connection to API
    await page.goto(webuiUrl + '#/')
    const { id } = await ipfs.id()
    await expect(page).toMatch(id, { timeout: 30000 }) // initial load can be slow on CI
  }
}

module.exports = WebuiTestEnvironment

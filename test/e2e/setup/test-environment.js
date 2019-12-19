// custom environment with IPFS API in global scope
const PuppeteerEnvironment = require('jest-environment-puppeteer')

class WebuiTestEnvironment extends PuppeteerEnvironment {
  async setup() {
    await super.setup()

    // expose IPFS API object as a global
    this.global.ipfs = global.__IPFS__
  }
}

module.exports = WebuiTestEnvironment

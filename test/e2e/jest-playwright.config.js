const debug = process.env.DEBUG === 'true'
const ci = process.env.TRAVIS === 'true' || process.env.CI === 'true'

// TODO: figure out what options to use
module.exports = {
  launchOptions: {
    devtools: debug,
    headless: (!debug || ci) // show browser window when in debug mode
  }
}

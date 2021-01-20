const debug = process.env.DEBUG === 'true'
const ci = process.env.TRAVIS === 'true' || process.env.CI === 'true'
module.exports = {
  launch: {
    dumpio: debug, // print all IO to the console
    headless: (!debug || ci), // show browser window when in debug mode
    slowMo: debug ? 50 : 5 // slow down scripted tests when debugging in non-headless mode
  }
}

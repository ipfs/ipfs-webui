const debug = process.env.DEBUG === 'true'
const travis = process.env.TRAVIS === 'true'
module.exports = {
  launch: {
    dumpio: debug, // print all IO to the console
    headless: (!debug || travis), // show browser window when in debug mode
    slowMo: debug ? 50 : undefined // slow down scripted tests when debugging in non-headless mode
  }
}

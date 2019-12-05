const debug = process.env.DEBUG === 'true'
module.exports = {
  launch: {
    dumpio: debug, // print all IO to the console
    headless: !debug, // show browser window when in debug mode
    slowMo: debug ? 50 : undefined // slow down scripted tests when debugging in non-headless mode
  },
}

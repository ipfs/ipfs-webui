import puppeteer from 'puppeteer'

const debug = process.env.DEBUG === 'true'

// puppeteer.launch opts
// see: https://github.com/GoogleChrome/puppeteer/blob/v1.3.0/docs/api.md#puppeteerlaunchoptions
const defaults = {
  headless: !debug,
  slowMo: debug ? 50 : undefined,
  args: process.env.NO_SANDBOX === 'true' ? ['--no-sandbox'] : undefined
}

export function launch (spec) {
  const opts = Object.assign({}, defaults, spec)
  return puppeteer.launch(opts)
}

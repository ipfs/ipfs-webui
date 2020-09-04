const expect = require('expect-puppeteer')

// increase timeouts for CI
const timeout = 60 * 1000
jest.setTimeout(timeout)
expect.setDefaultOptions({ timeout })

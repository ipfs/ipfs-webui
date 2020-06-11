const expect = require('expect-puppeteer')

// increase timeouts for CI
const timeout = 30 * 1000
jest.setTimeout(timeout)
expect.setDefaultOptions({ timeout })

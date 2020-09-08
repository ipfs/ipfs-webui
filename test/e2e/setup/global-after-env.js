const expect = require('expect-puppeteer')

// increase timeouts for CI
jest.setTimeout(45 * 1000)
expect.setDefaultOptions({ timeout: (30 * 1000) })

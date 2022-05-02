// increase timeouts for CI
jest.setTimeout(45 * 1000)

const { expect } = require('@playwright/test')
const { matchers } = require('expect-playwright')
expect.extend(matchers)

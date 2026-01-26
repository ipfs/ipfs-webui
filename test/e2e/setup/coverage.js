/**
 * Istanbul code coverage fixture for Playwright tests.
 *
 * This module re-exports from fixtures.js for backward compatibility.
 * Existing tests import { test, expect } from './setup/coverage.js'
 *
 * @see https://github.com/mxschmitt/playwright-test-coverage
 * @see https://github.com/mxschmitt/playwright-test-coverage/blob/main/e2e/baseFixtures.ts
 */
export { test, expect, generateUUID } from './fixtures.js'

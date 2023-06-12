/**
 * @see https://github.com/mxschmitt/playwright-test-coverage
 * @see https://github.com/mxschmitt/playwright-test-coverage/blob/main/e2e/baseFixtures.ts
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'crypto'
import { test as baseTest } from '@playwright/test'

const istanbulCLIOutput = path.join(process.cwd(), '.nyc_output')

export function generateUUID () {
  return crypto.randomBytes(16).toString('hex')
}

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() =>
      window.addEventListener('beforeunload', () =>
        window.collectIstanbulCoverage(JSON.stringify(window.__coverage__))
      )
    )
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true })
    await context.exposeFunction('collectIstanbulCoverage', async (coverageJSON) => {
      if (coverageJSON) {
        try {
          await fs.promises.writeFile(path.join(istanbulCLIOutput, `playwright_coverage_${generateUUID()}.json`), coverageJSON)
        } catch (err) {
          console.error('Error writing playwright coverage file', err)
        }
      } else {
        // throw new Error('No coverage data')
        console.warn('No coverage data')
      }
    })
    await use(context)
    for (const page of context.pages()) {
      await page.evaluate(() => window.collectIstanbulCoverage(JSON.stringify(window.__coverage__)))
    }
  }
})

export const expect = test.expect

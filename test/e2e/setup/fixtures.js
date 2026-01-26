/**
 * Centralized Playwright test fixtures for IPFS WebUI E2E tests.
 *
 * This module provides:
 * - Coverage collection (Istanbul)
 * - Worker-scoped fixtures for expensive operations (peer nodes)
 * - Test-scoped fixtures for page navigation and IPFS client
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'crypto'
import { test as baseTest, expect } from '@playwright/test'
import { createNode } from 'ipfsd-ctl'
import { create } from 'kubo-rpc-client'
import { path as kuboPath } from 'kubo'

const istanbulCLIOutput = path.join(process.cwd(), '.nyc_output')

export function generateUUID () {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Extended test fixture with coverage collection and shared utilities.
 */
export const test = baseTest.extend({
  // Coverage collection context (same as original coverage.js)
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
        console.warn('No coverage data')
      }
    })
    await use(context)
    for (const page of context.pages()) {
      await page.evaluate(() => window.collectIstanbulCoverage(JSON.stringify(window.__coverage__)))
    }
  },

  /**
   * IPFS RPC client connected to the test daemon.
   * Test-scoped: fresh client per test.
   */
  // eslint-disable-next-line no-empty-pattern
  ipfs: async ({}, use) => {
    const client = create(process.env.IPFS_RPC_ADDR)
    await use(client)
  },

  /**
   * Worker-scoped peer node for tests that need a second IPFS node.
   * Spawned once per worker, shared across tests in that worker.
   * Automatically cleaned up when the worker finishes.
   */
  // eslint-disable-next-line no-empty-pattern
  peerNode: [async ({}, use) => {
    const node = await createNode({
      type: 'kubo',
      bin: process.env.IPFS_GO_EXEC || kuboPath(),
      rpc: create,
      test: true,
      disposable: true
    })
    await use(node)
    await node.stop()
  }, { scope: 'worker' }],

  /**
   * Get a multiaddr for the peer node (local loopback).
   * Depends on peerNode fixture.
   */
  peerAddr: async ({ peerNode }, use) => {
    const { addresses } = await peerNode.api.id()
    const addr = addresses.find((ma) => ma.toString().startsWith('/ip4/127.0.0.1'))
    await use(addr?.toString() || addresses[0]?.toString())
  },

  /**
   * Files page fixture: navigates to /#/files and waits for file list.
   */
  filesPage: async ({ page }, use) => {
    await page.goto('/#/files')
    await expect(page.locator('.FilesList, .files-grid')).toBeVisible()
    await use(page)
  },

  /**
   * Status page fixture: navigates to /#/ and waits for connection.
   */
  statusPage: async ({ page }, use) => {
    await page.goto('/#/')
    await expect(page.getByText('Connected to IPFS')).toBeVisible()
    await use(page)
  },

  /**
   * Settings page fixture: navigates to /#/settings.
   */
  settingsPage: async ({ page }, use) => {
    await page.goto('/#/settings')
    await expect(page.getByText('Addresses')).toBeVisible()
    await use(page)
  },

  /**
   * Peers page fixture: navigates to /#/peers.
   */
  peersPage: async ({ page }, use) => {
    await page.goto('/#/peers')
    await expect(page.getByText('Add connection')).toBeVisible()
    await use(page)
  },

  /**
   * Explore page fixture: navigates to /#/explore.
   */
  explorePage: async ({ page }, use) => {
    await page.goto('/#/explore')
    // wait for connection indicator (teal = connected)
    await expect(page.locator('.joyride-app-status .teal')).toBeVisible()
    await use(page)
  }
})

export { expect }

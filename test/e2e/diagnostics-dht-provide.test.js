import { test, expect } from './setup/coverage.js'

test.describe('DHT Provide diagnostics page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/diagnostics/dht-provide')
    // wait for the stats grid to appear (indicates data has loaded)
    await page.waitForSelector('.dht-provide__grid', { timeout: 15000 })
  })

  test('should display all stat cards', async ({ page }) => {
    await expect(page.getByText('Connectivity', { exact: true })).toBeVisible()
    await expect(page.getByText('Queues', { exact: true })).toBeVisible()
    await expect(page.getByText('Schedule', { exact: true })).toBeVisible()
    await expect(page.getByText('Operations', { exact: true })).toBeVisible()
    await expect(page.getByText('Network', { exact: true })).toBeVisible()
    await expect(page.getByText('Workers', { exact: true })).toBeVisible()
  })

  test('should display connectivity status', async ({ page }) => {
    // status should be either Online or Offline
    const statusText = page.locator('.dht-provide__grid').getByText(/Online|Offline/)
    await expect(statusText).toBeVisible()
  })

  test('should display uptime', async ({ page }) => {
    // uptime appears after "Uptime" label, format is like "1s", "5m", "2h"
    await expect(page.getByText('Uptime', { exact: true })).toBeVisible()
  })

  test('should display reprovide interval', async ({ page }) => {
    // default reprovide interval is 22h
    await expect(page.getByText('Reprovide interval')).toBeVisible()
    await expect(page.getByText(/22h/)).toBeVisible()
  })

  test('should display worker counts', async ({ page }) => {
    // workers card shows "X / Y" format for active workers
    const workersSection = page.locator('.dht-provide__grid')
    await expect(workersSection.getByText('Active')).toBeVisible()
    await expect(workersSection.getByText(/\d+\s*\/\s*\d+/)).toBeVisible()
  })

  test('should show last updated timestamp', async ({ page }) => {
    await expect(page.getByText(/Last updated at/)).toBeVisible()
  })
})

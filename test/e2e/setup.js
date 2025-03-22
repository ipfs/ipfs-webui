import { expect } from '@playwright/test'

// Base URL of the WebUI
globalThis.webuiUrl = process.env.E2E_URL || 'http://localhost:3000'

// Function to wait for IPFS to be ready
globalThis.waitForIpfsStats = async () => {
  await expect(async () => {
    const response = await fetch(`${globalThis.webuiUrl}/api/v0/stats/bw`)
    expect(response.status).toBe(200)
  }).toPass({
    timeout: 60000,
    intervals: [1000, 2000, 5000]
  })
}

// Used to verify if we're connected to IPFS before a test run
export const checkIpfsIsRunning = async () => {
  try {
    const response = await fetch(`${globalThis.webuiUrl}/api/v0/id`)
    const data = await response.json()
    return !!data.ID
  } catch (err) {
    return false
  }
}

// Make sure globals are defined before tests run
export default async () => {
  console.log('Setting up globals for tests...')
  console.log(`WebUI URL: ${globalThis.webuiUrl}`)
}

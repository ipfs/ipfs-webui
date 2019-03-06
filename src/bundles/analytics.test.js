/* global it, expect, beforeEach, afterEach, jest */
import { composeBundlesRaw } from 'redux-bundler'
import createAnalyticsBundle from './analytics'
import sleep from '../../test/helpers/sleep'

beforeEach(() => {
  global.Countly = {
    opt_out: jest.fn(),
    opt_in: jest.fn(),
    init: jest.fn()
  }
})

afterEach(() => {
  delete global.Countly
})

function createStore (analyticsOpts = {}) {
  return composeBundlesRaw(
    {
      name: 'mockRoutesBundle',
      selectRouteInfo: () => ({})
    },
    createAnalyticsBundle(analyticsOpts)
  )()
}

it('should enable analytics if user has explicitly enabled it', () => {
  const store = createStore()
  store.doEnableAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(true)
})

it('should disable analytics if user has explicitly disabled it', () => {
  const store = createStore()
  store.doDisableAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(false)
})

// see: https://github.com/ipfs-shipyard/ipfs-webui/issues/980#issuecomment-467806732
it.skip('should enable selectAnalyticsAskToEnable if user has not explicity enabled or disabled it', () => {
  const store = createStore()
  expect(store.selectAnalyticsAskToEnable()).toBe(true)
})

it('should disable selectAnalyticsAskToEnable if user has explicity disabled it', () => {
  const store = createStore()
  store.doDisableAnalytics()
  expect(store.selectAnalyticsAskToEnable()).toBe(false)
})

it('should disable selectAnalyticsAskToEnable if user has explicity enabled it', () => {
  const store = createStore()
  store.doEnableAnalytics()
  expect(store.selectAnalyticsAskToEnable()).toBe(false)
})

it('should disable selectAnalyticsAskToEnable if analytics are enabled', () => {
  const store = createStore()
  store.doEnableAnalytics()
  expect(store.selectAnalyticsAskToEnable()).toBe(false)
})

it('should toggle analytics', async (done) => {
  const store = createStore()
  expect(store.selectAnalyticsEnabled()).toBe(false)

  store.doToggleAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(true)

  // we calc enabled state from time diff between lastEnabledAt and lastDisabledAt, so need a pause
  await sleep()

  store.doToggleAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(false)

  done()
})

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
  if (global.navigator && global.navigator.hasOwnProperty('doNotTrack')) {
    delete global.navigator.doNotTrack
  }
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

it('should normalise the doNotTrack state from the navigator.doNotTrack value', () => {
  let store = createStore()
  // false if not set.
  expect(store.selectAnalytics().doNotTrack).toBe(false)
  global.navigator = { doNotTrack: '1' }
  store = createStore()
  expect(store.selectAnalytics().doNotTrack).toBe(true)

  global.navigator.doNotTrack = '0'
  store = createStore()
  expect(store.selectAnalytics().doNotTrack).toBe(false)
})

it('should enable analytics if doNotTrack is falsey', () => {
  const store = createStore()
  expect(store.selectAnalyticsEnabled()).toBe(true)
})

it('should disable analytics if doNotTrack is true', () => {
  const store = createStore({ doNotTrack: true })
  expect(store.selectAnalyticsEnabled()).toBe(false)
})

it('should enable analytics if doNotTrack is true but user has explicitly enabled it', () => {
  const store = createStore({ doNotTrack: true })
  store.doEnableAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(true)
})

it('should disable analytics if doNotTrack is falsey but user has explicitly disabled it', () => {
  const store = createStore({ doNotTrack: false })
  store.doDisableAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(false)
})

it('should enable selectAnalyticsAskToEnable if doNotTrack is true and user has not explicity enabled or disabled it', () => {
  const store = createStore({ doNotTrack: true })
  expect(store.selectAnalyticsAskToEnable()).toBe(true)
})

it('should disable selectAnalyticsAskToEnable if doNotTrack is true and user has explicity disabled it', () => {
  const store = createStore({ doNotTrack: true })
  store.doDisableAnalytics()
  expect(store.selectAnalyticsAskToEnable()).toBe(false)
})

it('should disable selectAnalyticsAskToEnable if doNotTrack is true and user has explicity enabled it', () => {
  const store = createStore({ doNotTrack: true })
  store.doEnableAnalytics()
  expect(store.selectAnalyticsAskToEnable()).toBe(false)
})

it('should disable selectAnalyticsAskToEnable if analytics are enabled', () => {
  const store = createStore({ doNotTrack: false })
  expect(store.selectAnalyticsAskToEnable()).toBe(false)
})

it('should toggle analytics', async (done) => {
  const store = createStore({ doNotTrack: false })
  expect(store.selectAnalyticsEnabled()).toBe(true)

  store.doToggleAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(false)

  // we calc enabled state from time diff between lastEnabledAt and lastDisabledAt, so need a pause
  await sleep()

  store.doToggleAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(true)

  done()
})

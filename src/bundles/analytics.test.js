/* global it, expect, beforeEach, afterEach, jest */
import { composeBundlesRaw } from 'redux-bundler'
import createAnalyticsBundle from './analytics'

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

it('should disable analytics by default', () => {
  const store = createStore()
  expect(store.selectAnalyticsEnabled()).toBe(false)
  expect(store.selectAnalyticsConsent()).toEqual([])
})

it('should enable analytics if user has explicitly enabled it', () => {
  const store = createStore()
  store.doEnableAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['sessions', 'events', 'views', 'location'])
})

it('should disable analytics if user has explicitly disabled it', () => {
  const store = createStore()
  store.doDisableAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(false)
  expect(store.selectAnalyticsConsent()).toEqual([])
})

it('should enable selectAnalyticsAskToEnable if user has not explicity enabled or disabled it', () => {
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

it('should toggle analytics', () => {
  const store = createStore()

  store.doToggleAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['sessions', 'events', 'views', 'location'])

  store.doToggleAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(false)
  expect(store.selectAnalyticsConsent()).toEqual([])
})

it('should toggle consent', () => {
  const store = createStore()

  store.doToggleConsent('crashes')
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['crashes'])

  store.doToggleAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(false)
  expect(store.selectAnalyticsConsent()).toEqual([])

  store.doToggleAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['sessions', 'events', 'views', 'location'])

  store.doToggleConsent('sessions')
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['events', 'views', 'location'])

  store.doToggleConsent('location')
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['events', 'views'])

  store.doToggleConsent('views')
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['events'])

  // Removing all consent is equivalent to disabling the analytics.
  store.doToggleConsent('events')
  expect(store.selectAnalyticsEnabled()).toBe(false)
  expect(store.selectAnalyticsConsent()).toEqual([])
})

/* global describe, it, expect, beforeEach, afterEach */
import { jest } from '@jest/globals'
import { composeBundlesRaw } from 'redux-bundler'
import createAnalyticsBundle from './analytics.js'

beforeEach(() => {
  global.Countly = {
    q: [],
    opt_out: jest.fn(),
    opt_in: jest.fn(),
    init: jest.fn()
  }
})

afterEach(() => {
  delete global.Countly
})

function createStore (analyticsOpts = {}, mockAnalyticsCachedState) {
  return composeBundlesRaw(
    {
      name: 'mockRoutesBundle',
      selectRouteInfo: () => ({})
    },
    {
      name: 'mockIpfsDesktopBundle',
      selectIsIpfsDesktop: () => false,
      selectDesktopCountlyActions: () => ([])
    },
    createAnalyticsBundle(analyticsOpts)
  )({
    // tests using mockAnalyticsCachedState are mimicking the createCacheBundle that sets initial state
    analytics: mockAnalyticsCachedState
  })
}

describe('new/returning user default behavior', () => {
  it('should enable analytics by default for new user who has not opted in or out', () => {
    const store = createStore()
    expect(global.Countly.opt_in).toHaveBeenCalled()
    expect(global.Countly.opt_in.mock.calls.length).toBe(1)
    // events will be sent as consents have been given by default
    expect(store.selectAnalyticsConsent()).toEqual(['sessions', 'events', 'views', 'location'])
  })
  it('should enable existing analytics by default for returning user who was opted_in', () => {
    const mockDefaultState = {
      lastEnabledAt: (new Date('2022-01-02')).getTime(),
      lastDisabledAt: 0,
      showAnalyticsBanner: false,
      optedOut: false,
      consent: ['sessions', 'events', 'views']
    }
    const store = createStore({}, mockDefaultState)
    expect(store.selectAnalyticsEnabled()).toBe(true)
    expect(store.selectAnalyticsConsent()).toEqual(['sessions', 'events', 'views'])
    // should not show analytics banner for these users
    expect(store.selectShowAnalyticsBanner()).toBe(false)
  })
  it('should enable analytics for returning user who opted_out prior to new opt-in by default updates', () => {
    const mockDefaultState = {
      lastEnabledAt: 0,
      lastDisabledAt: (new Date('2022-01-02')).getTime(),
      showAnalyticsBanner: false,
      optedOut: false,
      consent: []
    }
    const store = createStore({}, mockDefaultState)
    expect(global.Countly.opt_in).toHaveBeenCalled()
    expect(global.Countly.opt_in.mock.calls.length).toBe(1)
    expect(store.selectAnalyticsConsent()).toEqual(['sessions', 'events', 'views', 'location'])
    // should show analytics banner for these users
    expect(store.selectShowAnalyticsBanner()).toBe(true)
  })
  it('should hide analytics banner if user has closed the banner', () => {
    const mockDefaultState = {
      lastEnabledAt: 0,
      lastDisabledAt: (new Date('2022-01-01')).getTime(),
      showAnalyticsBanner: false,
      optedOut: false,
      consent: []
    }
    const store = createStore({}, mockDefaultState)
    expect(store.selectShowAnalyticsBanner()).toBe(true)
    expect(store.selectAnalyticsConsent()).toEqual(['sessions', 'events', 'views', 'location'])
    store.doToggleShowAnalyticsBanner(false)
    expect(store.selectShowAnalyticsBanner()).toBe(false)
    expect(store.selectAnalyticsOptedOutPriorToDefaultOptIn()).toBe(false)
  })
})

describe('user enables and disables analytics', () => {
  it('should enable analytics if user who has opted out explicitly enables it', () => {
    const mockDefaultState = {
      lastEnabledAt: 0,
      lastDisabledAt: (new Date('2022-01-01')).getTime(),
      showAnalyticsBanner: false,
      optedOut: true,
      consent: []
    }
    const store = createStore({}, mockDefaultState)
    store.doEnableAnalytics()
    expect(store.selectAnalyticsEnabled()).toBe(true)
    expect(store.selectAnalyticsConsent()).toEqual(['sessions', 'events', 'views', 'location'])
    expect(global.Countly.opt_in).toHaveBeenCalled()
    expect(global.Countly.opt_out).not.toHaveBeenCalled()
    expect(global.Countly.opt_in.mock.calls.length).toBe(1)
  })

  it('should disable analytics if user explicitly disables it', () => {
    const store = createStore()
    store.doDisableAnalytics()
    expect(store.selectAnalyticsEnabled()).toBe(false)
    expect(store.selectAnalyticsConsent()).toEqual([])
    expect(global.Countly.opt_out).toHaveBeenCalled()
    expect(global.Countly.opt_out.mock.calls.length).toBe(1)
  })
})

describe('user manages all analytics consent with settings page toggle', () => {
  it('should toggle analytics consent off for user with consent enabled', () => {
    const mockDefaultState = {
      lastEnabledAt: (new Date('2022-01-02')).getTime(),
      lastDisabledAt: 0,
      consent: ['sessions', 'events', 'views'],
      optedOut: false
    }
    const store = createStore({}, mockDefaultState)
    store.doToggleAnalytics()
    expect(store.selectAnalyticsEnabled()).toBe(false)
    expect(store.selectAnalyticsConsent()).toEqual([])
    expect(store.selectAnalyticsOptedOut()).toBe(true)
    expect(global.Countly.opt_in).not.toHaveBeenCalled()
    expect(global.Countly.opt_out).toHaveBeenCalled()
    expect(global.Countly.opt_out.mock.calls.length).toBe(1)
  })
  it('should toggle analytics consent on for user with consent disabled', () => {
    const mockDefaultState = {
      lastEnabledAt: (new Date('2022-01-01')).getTime(),
      lastDisabledAt: (new Date('2022-01-02')).getTime(),
      consent: [],
      optedOut: true
    }
    const store = createStore({}, mockDefaultState)
    expect(store.selectAnalyticsEnabled()).toBe(false)
    store.doToggleAnalytics()
    expect(store.selectAnalyticsEnabled()).toBe(true)
    expect(store.selectAnalyticsConsent()).toEqual(['sessions', 'events', 'views', 'location'])
    expect(store.selectAnalyticsOptedOut()).toBe(false)
    expect(global.Countly.opt_in).toHaveBeenCalled()
    expect(global.Countly.opt_out).not.toHaveBeenCalled()
    expect(global.Countly.opt_in.mock.calls.length).toBe(1)
  })
})

describe('user manages analytics consent with individual settings toggles', () => {
  it('should toggle consent on for "crashes"', () => {
    const mockDefaultState = {
      lastEnabledAt: (new Date('2022-01-02')).getTime(),
      lastDisabledAt: (new Date('2022-01-01')).getTime(),
      consent: ['sessions', 'events', 'views', 'location'],
      optedOut: false
    }
    const store = createStore({}, mockDefaultState)
    store.doToggleConsent('crashes')
    expect(store.selectAnalyticsEnabled()).toBe(true)
    expect(store.selectAnalyticsConsent()).toEqual(['sessions', 'events', 'views', 'location', 'crashes'])
  })
  it('should toggle consent off for one ("sessions")', () => {
    const mockDefaultState = {
      lastEnabledAt: (new Date('2022-01-02')).getTime(),
      lastDisabledAt: (new Date('2022-01-01')).getTime(),
      consent: ['sessions', 'events', 'views', 'location'],
      optedOut: false
    }
    const store = createStore({}, mockDefaultState)
    store.doToggleConsent('sessions')
    expect(store.selectAnalyticsEnabled()).toBe(true)
    expect(store.selectAnalyticsConsent()).toEqual(['events', 'views', 'location'])
  })
  it('should opt_out if consent is toggled off for all existing consents', () => {
    const mockDefaultState = {
      lastEnabledAt: (new Date('2022-01-02')).getTime(),
      lastDisabledAt: (new Date('2022-01-01')).getTime(),
      consent: ['views', 'location'],
      optedOut: false
    }
    const store = createStore({}, mockDefaultState)
    store.doToggleConsent('views')
    store.doToggleConsent('location')
    expect(store.selectAnalyticsEnabled()).toBe(false)
    expect(store.selectAnalyticsOptedOut()).toBe(true)
    expect(store.selectAnalyticsConsent()).toEqual([])
    expect(global.Countly.opt_out).toHaveBeenCalled()
    expect(global.Countly.opt_out.mock.calls.length).toBe(1)
  })
})

/* global it, expect, beforeEach, afterEach, jest */
import { composeBundlesRaw } from 'redux-bundler'
import createAnalyticsBundle from './analytics'
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
function createStore (analyticsOpts = {}) {
  return composeBundlesRaw({
    name: 'mockRoutesBundle',
    selectRouteInfo: () => ({})
  }, {
    name: 'mockIpfsDesktopBundle',
    selectIsIpfsDesktop: () => false,
    selectDesktopCountlyActions: () => ([])
  }, createAnalyticsBundle(analyticsOpts))()
}
it('should disable analytics by default', () => {
  const store = createStore()
  expect(store.selectAnalyticsEnabled()).toBe(false)
  // no events will be sent as no consents have been given
  expect(store.selectAnalyticsConsent()).toEqual([])
  // user has not explicitly opted in or out yet
  expect(global.Countly.opt_in).not.toHaveBeenCalled()
  expect(global.Countly.opt_out).not.toHaveBeenCalled()
})
it('should enable analytics if user has explicitly enabled it', () => {
  const store = createStore()
  store.doEnableAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['sessions', 'events', 'views', 'location'])
  expect(global.Countly.opt_in).toHaveBeenCalled()
  expect(global.Countly.opt_out).not.toHaveBeenCalled()
  expect(global.Countly.opt_in.mock.calls.length).toBe(1)
})
it('should disable analytics if user has explicitly disabled it', () => {
  const store = createStore()
  store.doDisableAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(false)
  expect(store.selectAnalyticsConsent()).toEqual([])
  expect(global.Countly.opt_in).not.toHaveBeenCalled()
  expect(global.Countly.opt_out).toHaveBeenCalled()
  expect(global.Countly.opt_out.mock.calls.length).toBe(1)
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
  expect(global.Countly.opt_in).toHaveBeenCalled()
  expect(global.Countly.opt_out).not.toHaveBeenCalled()
  expect(global.Countly.opt_in.mock.calls.length).toBe(1)
  // reset the mocks here to simplify the following assetions
  global.Countly.opt_in.mockClear()
  global.Countly.opt_out.mockClear()
  store.doToggleAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(false)
  expect(store.selectAnalyticsConsent()).toEqual([])
  expect(global.Countly.opt_in).not.toHaveBeenCalled()
  expect(global.Countly.opt_out).toHaveBeenCalled()
  expect(global.Countly.opt_out.mock.calls.length).toBe(1)
})
it('should toggle consent', () => {
  const store = createStore()
  store.doToggleConsent('crashes')
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['crashes'])
  expect(global.Countly.opt_in).toHaveBeenCalled()
  expect(global.Countly.opt_out).not.toHaveBeenCalled()
  expect(global.Countly.opt_in.mock.calls.length).toBe(1)
  // reset the mocks here to simplify the following assetions
  global.Countly.opt_in.mockClear()
  global.Countly.opt_out.mockClear()
  store.doToggleAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(false)
  expect(store.selectAnalyticsConsent()).toEqual([])
  expect(global.Countly.opt_in).not.toHaveBeenCalled()
  expect(global.Countly.opt_out).toHaveBeenCalled()
  expect(global.Countly.opt_out.mock.calls.length).toBe(1)
  global.Countly.opt_in.mockClear()
  global.Countly.opt_out.mockClear()
  store.doToggleAnalytics()
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['sessions', 'events', 'views', 'location'])
  expect(global.Countly.opt_in).toHaveBeenCalled()
  expect(global.Countly.opt_out).not.toHaveBeenCalled()
  expect(global.Countly.opt_in.mock.calls.length).toBe(1)
  global.Countly.opt_in.mockClear()
  global.Countly.opt_out.mockClear()
  store.doToggleConsent('sessions')
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['events', 'views', 'location'])
  // changing the consents should not opt/in or out
  expect(global.Countly.opt_in).not.toHaveBeenCalled()
  expect(global.Countly.opt_out).not.toHaveBeenCalled()
  // reset the mocks here to simplify the following assetions
  global.Countly.opt_in.mockClear()
  global.Countly.opt_out.mockClear()
  store.doToggleConsent('location')
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['events', 'views'])
  // changing the consents should not opt/in or out
  expect(global.Countly.opt_in).not.toHaveBeenCalled()
  expect(global.Countly.opt_out).not.toHaveBeenCalled()
  // reset the mocks here to simplify the following assetions
  global.Countly.opt_in.mockClear()
  global.Countly.opt_out.mockClear()
  store.doToggleConsent('views')
  expect(store.selectAnalyticsEnabled()).toBe(true)
  expect(store.selectAnalyticsConsent()).toEqual(['events'])
  // changing the consents should not opt/in or out
  expect(global.Countly.opt_in).not.toHaveBeenCalled()
  expect(global.Countly.opt_out).not.toHaveBeenCalled()
  // reset the mocks here to simplify the following assetions
  global.Countly.opt_in.mockClear()
  global.Countly.opt_out.mockClear()
  // Removing all consent is equivalent to disabling the analytics.
  store.doToggleConsent('events')
  expect(store.selectAnalyticsEnabled()).toBe(false)
  expect(store.selectAnalyticsConsent()).toEqual([])
  expect(global.Countly.opt_in).not.toHaveBeenCalled()
  expect(global.Countly.opt_out).toHaveBeenCalled()
  expect(global.Countly.opt_out.mock.calls.length).toBe(1)
  global.Countly.opt_in.mockClear()
  global.Countly.opt_out.mockClear()
})

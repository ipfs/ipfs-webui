import root from 'window-or-global'

const IGNORE_ACTIONS = /^(FILES_FETCH_|FILES_WRITE_UPDATED)/
const USER_ACTIONS = /^(CONFIG_SAVE_|FILES_|DESKTOP_)/
const ASYNC_ACTIONS = /^(.+)_(STARTED|FINISHED|FAILED)$/

const createAnalyticsBundle = ({
  countlyUrl = 'https://countly.ipfs.io',
  countlyAppKey,
  appVersion,
  appGitRevision,
  debug = false
}) => {
  return {
    name: 'analytics',

    persistActions: ['ANALYTICS_ENABLED', 'ANALYTICS_DISABLED'],

    init: async (store) => {
      if (!root.Countly) {
        // lazy-load to simplify testing.
        root.Countly = await import('countly-sdk-web')
      }
      const Countly = root.Countly
      Countly.q = Countly.q || []

      Countly.url = countlyUrl
      Countly.app_key = countlyAppKey
      Countly.app_version = appVersion
      Countly.debug = debug

      // Don't track clicks as it can include full url.
      // Countly.q.push(['track_clicks']);
      // Countly.q.push(['track_links'])
      Countly.q.push(['track_sessions'])
      Countly.q.push(['track_pageview'])
      Countly.q.push(['track_errors'])

      if (!store.selectAnalyticsEnabled()) {
        Countly.q.push(['opt_out'])
        Countly.ignore_visitor = true
      }

      Countly.init()

      store.subscribeToSelectors(['selectRouteInfo'], ({ routeInfo }) => {
        /*
        By tracking the pattern rather than the window.location, we limit the info
        we collect to just the app sections that are viewed, and avoid recording
        specific CIDs or local repo paths that would contain personal information.
        */
        if (root.Countly) {
          root.Countly.q.push(['track_pageview', routeInfo.pattern])
        }
      })
    },

    // Record durations for user actions
    getMiddleware: () => (store) => {
      const EventMap = new Map()
      return next => action => {
        const res = next(action)
        if (store.selectAnalyticsEnabled() && !IGNORE_ACTIONS.test(action.type) && USER_ACTIONS.test(action.type)) {
          if (ASYNC_ACTIONS.test(action.type)) {
            const [_, name, state] = ASYNC_ACTIONS.exec(action.type) // eslint-disable-line no-unused-vars
            if (state === 'STARTED') {
              EventMap.set(name, root.performance.now())
            } else {
              const start = EventMap.get(name)
              if (!start) {
                EventMap.delete(name)
                return
              }
              const durationInSeconds = (root.performance.now() - start) / 1000
              root.Countly.q.push(['add_event', {
                key: state === 'FAILED' ? action.type : name,
                count: 1,
                dur: durationInSeconds
              }])
            }
          } else {
            root.Countly.q.push(['add_event', {
              key: action.type,
              count: 1
            }])
          }
        }
        return res
      }
    },

    reducer: (state = { lastEnabledAt: 0, lastDisabledAt: 0 }, action) => {
      if (action.type === 'ANALYTICS_ENABLED') {
        return { ...state, lastEnabledAt: Date.now() }
      }
      if (action.type === 'ANALYTICS_DISABLED') {
        return { ...state, lastDisabledAt: Date.now() }
      }
      return state
    },

    selectAnalytics: (state) => state.analytics,

    /*
      Use the users preference.
    */
    selectAnalyticsEnabled: (state) => {
      const { lastEnabledAt, lastDisabledAt } = state.analytics
      // where never opted in or out, analytics are disabled by default
      if (!lastEnabledAt && !lastDisabledAt) {
        return false
      }
      // otherwise return their most recent choice.
      return lastEnabledAt > lastDisabledAt
    },

    /*
      Ask the user if we may enable analytics.
    */
    selectAnalyticsAskToEnable: (state) => {
      const { lastEnabledAt, lastDisabledAt } = state.analytics
      // user has not explicitly chosen
      if (!lastEnabledAt && !lastDisabledAt) {
        // ask to enable.
        return true
      }
      // user has already made an explicit choice; dont ask again.
      return false
    },

    doToggleAnalytics: () => async ({ dispatch, store }) => {
      const enable = !store.selectAnalyticsEnabled()
      if (enable) {
        store.doEnableAnalytics()
      } else {
        store.doDisableAnalytics()
      }
    },

    doDisableAnalytics: () => async ({ dispatch, store }) => {
      root.Countly.opt_out()
      dispatch({ type: 'ANALYTICS_DISABLED' })
    },

    doEnableAnalytics: () => async ({ dispatch, store }) => {
      root.Countly.opt_in()
      dispatch({ type: 'ANALYTICS_ENABLED' })
    }
  }
}

export default createAnalyticsBundle

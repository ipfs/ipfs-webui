import root from 'window-or-global'

const IGNORE_ACTIONS = /^(FILES_FETCH_|FILES_WRITE_UPDATED)/
const USER_ACTIONS = /^(CONFIG_SAVE_|FILES_|DESKTOP_)/
const ASYNC_ACTIONS = /^(.+)_(STARTED|FINISHED|FAILED)$/

const createAnalyticsBundle = ({
  countlyUrl = 'https://countly.ipfs.io',
  countlyAppKey,
  appVersion,
  appGitRevision,
  debug = true
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

      Countly.require_consent = true
      Countly.url = countlyUrl
      Countly.app_key = countlyAppKey
      Countly.app_version = appVersion
      Countly.debug = debug

      Countly.q.push(['group_features', {
        activity: ['sessions', 'events', 'views']
      }])

      Countly.q.push(['track_sessions'])
      Countly.q.push(['track_pageview'])

      // Don't track clicks or links as it can include full url.
      // Countly.q.push(['track_clicks']);
      // Countly.q.push(['track_links'])

      // Dont track errors as we can't gurantee they wont include CIDs or other personal info
      // Countly.q.push(['track_errors'])

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

      if (!store.selectAnalyticsEnabled()) {
        console.log('ANAL OFF', root.Countly)
      } else {
        console.log('ANAL ON')
        Countly.q.push(['add_consent', 'activity'])
      }

      Countly.init()
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
        console.log('ANALYTICS_ENABLED')
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
        // return true
        // see: https://github.com/ipfs-shipyard/ipfs-webui/issues/980#issuecomment-467806732
        return false
      }
      // user has already made an explicit choice; dont ask again.
      return false
    },

    doToggleAnalytics: () => async ({ dispatch, store }) => {
      const enable = !store.selectAnalyticsEnabled()
      console.log('doToggleAnalytics', enable)
      if (enable) {
        store.doEnableAnalytics()
      } else {
        store.doDisableAnalytics()
      }
    },

    doDisableAnalytics: () => async ({ dispatch, store }) => {
      root.Countly.q.push(['remove_consent', 'activity'])
      dispatch({ type: 'ANALYTICS_DISABLED' })
    },

    doEnableAnalytics: () => async ({ dispatch, store }) => {
      root.Countly.q.push(['add_consent', 'activity'])
      dispatch({ type: 'ANALYTICS_ENABLED' })
    }
  }
}

export default createAnalyticsBundle

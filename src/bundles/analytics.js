import root from 'window-or-global'

function getDoNotTrack () {
  if (!root.navigator) return false
  return !!root.navigator.doNotTrack
}

const createAnalyticsBundle = ({
  doNotTrack = getDoNotTrack(),
  countlyUrl = 'http://165.227.180.165',
  appKey = '6b0d302cdd68172cb8810a1845cb9118917efe59',
  appVersion,
  appGitRevision,
  debug = false
}) => {
  return {
    name: 'analytics',

    persistActions: ['ANALYTICS_ENABLED', 'ANALYTICS_DISABLED'],

    init: async (store) => {
      if (!root.Countly) {
        // lasy-load to simplify testing.
        root.Countly = await import('countly-sdk-web')
      }
      const Countly = root.Countly
      Countly.q = Countly.q || []

      Countly.url = countlyUrl
      Countly.app_key = appKey
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

    reducer: (state = { doNotTrack, lastEnabledAt: 0, lastDisabledAt: 0 }, action) => {
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
      Use the users preference or their global doNotTrack setting.
    */
    selectAnalyticsEnabled: (state) => {
      const { lastEnabledAt, lastDisabledAt, doNotTrack } = state.analytics
      // where never opted in or out, use their global tracking preference
      if (!lastEnabledAt && !lastDisabledAt) {
        return !doNotTrack
      }
      // otherwise return their most recent choice.
      return lastEnabledAt > lastDisabledAt
    },

    /*
      Ask the user if we may enable analytics if they have doNotTrack set
    */
    selectAnalyticsAskToEnable: (state) => {
      const { lastEnabledAt, lastDisabledAt, doNotTrack } = state.analytics
      // user has not explicity chosen
      if (!lastEnabledAt && !lastDisabledAt) {
        // ask to enable if doNotTrack is true.
        return doNotTrack
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

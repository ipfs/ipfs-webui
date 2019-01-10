import Countly from 'countly-sdk-web'
import root from 'window-or-global'

const createAnalyticsBundle = ({
  countlyUrl = 'http://165.227.180.165',
  appKey = '6b0d302cdd68172cb8810a1845cb9118917efe59',
  appVersion,
  appGitRevision,
  debug = true
}) => {
  return {
    name: 'analytics',

    persistActions: ['ANALYTICS_ENABLED', 'ANALYTICS_DISABLED'],

    init: (store) => {
      // const Countly = root.Countly || {}
      Countly.q = Countly.q || []
      root.Countly = Countly

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

      // Do not track until the user opts in.
      if (!store.selectAnalyticsEnabled()) {
        console.log('Analytics OFF!')
        Countly.q.push(['opt_out'])
        Countly.ignore_visitor = true
      } else {
        console.log('Analytics ON!')
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

    reducer: (state = { enabled: false }, action) => {
      if (action.type === 'ANALYTICS_ENABLED') {
        return { ...state, enabled: true }
      }
      if (action.type === 'ANALYTICS_DISABLED') {
        return { ...state, enabled: false }
      }
      return state
    },

    selectAnalyticsEnabled: (state) => state.analytics.enabled,

    doToggleAnalytics: () => async ({ dispatch, store }) => {
      const enable = !store.selectAnalyticsEnabled()
      if (enable) {
        console.log('Analytics ON')
        root.Countly.opt_in()
        dispatch({ type: 'ANALYTICS_ENABLED' })
      } else {
        console.log('Analytics OFF')
        root.Countly.opt_out()
        dispatch({ type: 'ANALYTICS_DISABLED' })
      }
    }
  }
}

export default createAnalyticsBundle

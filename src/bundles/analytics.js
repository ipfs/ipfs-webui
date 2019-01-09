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
    init: (store) => {
      // const Countly = root.Countly || {}
      Countly.q = Countly.q || []
      root.Countly = Countly

      Countly.url = countlyUrl
      Countly.app_key = appKey
      Countly.app_version = appVersion
      Countly.debug = debug

      // Do not track until we have users consent.
      Countly.require_consent = true

      // Don't track clicks as it can include full url.
      // Countly.q.push(['track_clicks']);
      // Countly.q.push(['track_links'])
      Countly.q.push(['track_sessions'])
      Countly.q.push(['track_pageview'])
      Countly.q.push(['track_errors'])
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
    }
  }
}

export default createAnalyticsBundle

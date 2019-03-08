import root from 'window-or-global'

const ASYNC_ACTIONS_TO_RECORD = [
  'CONFIG_SAVE',
  'FILES_MAKEDIR',
  'FILES_WRITE',
  'FILES_ADDBYPATH',
  'FILES_MOVE',
  'FILES_DELETE',
  'FILES_DOWNLOADLINK'
]

const ASYNC_ACTION_RE = new RegExp(`^${ASYNC_ACTIONS_TO_RECORD.join('_|')}`)
const ASYNC_ACTION_STATE_RE = /^(.+)_(STARTED|FINISHED|FAILED)$/

const COUNTLY_KEY_WEBUI = '8fa213e6049bff23b08e5f5fbac89e7c27397612'
const COUNTLY_KEY_WEBUI_TEST = '700fd825c3b257e021bd9dbc6cbf044d33477531'
const COUNTLY_KEY_DESKTOP = '47fbb3db3426d2ae32b3b65fe40c564063d8b55d'
const COUNTLY_KEY_DESKTOP_TEST = '6b00e04fa5370b1ce361d2f24a09c74254eee382'

function pickAppKey () {
  const isProd = process.env.NODE_ENV === 'production'
  const isDesktop = !!root.ipfsDesktop
  if (isDesktop) {
    return isProd ? COUNTLY_KEY_DESKTOP : COUNTLY_KEY_DESKTOP_TEST
  } else {
    return isProd ? COUNTLY_KEY_WEBUI : COUNTLY_KEY_WEBUI_TEST
  }
}

const createAnalyticsBundle = ({
  countlyUrl = 'https://countly.ipfs.io',
  countlyAppKey = pickAppKey(),
  appVersion = process.env.REACT_APP_VERSION,
  appGitRevision = process.env.REACT_APP_GIT_REV,
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

      if (store.selectAnalyticsEnabled()) {
        Countly.q.push(['add_consent', 'activity'])
      }

      Countly.init()
    },

    // Listen to redux actions
    getMiddleware: () => (store) => {
      const EventMap = new Map()
      return next => action => {
        // Record durations for async actions
        if (ASYNC_ACTION_RE.test(action.type)) {
          const [_, name, state] = ASYNC_ACTION_STATE_RE.exec(action.type) // eslint-disable-line no-unused-vars
          if (state === 'STARTED') {
            EventMap.set(name, root.performance.now())
          } else {
            const start = EventMap.get(name)
            if (!start) {
              EventMap.delete(name)
            } else {
              const durationInSeconds = (root.performance.now() - start) / 1000
              root.Countly.q.push(['add_event', {
                key: state === 'FAILED' ? action.type : name,
                count: 1,
                dur: durationInSeconds
              }])
            }
          }
        }

        // Record errors
        const error = action.error || (action.payload && action.payload.error)
        if (error) {
          root.Countly.q.push(['add_log', action.type])
          root.Countly.q.push(['log_error', error])
        }
        return next(action)
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
        // return true
        // see: https://github.com/ipfs-shipyard/ipfs-webui/issues/980#issuecomment-467806732
        return false
      }
      // user has already made an explicit choice; dont ask again.
      return false
    },

    selectAnalyticsActionsToRecord: () => {
      return Array.from(ASYNC_ACTIONS_TO_RECORD)
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

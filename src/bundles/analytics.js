import root from 'window-or-global'
import changeCase from 'change-case'
import { createSelector } from 'redux-bundler'

// Only record specific actions listed here.
const ASYNC_ACTIONS_TO_RECORD = [
  'IPFS_INIT',
  'CONFIG_SAVE',
  'FILES_MAKEDIR',
  'FILES_WRITE',
  'FILES_ADDBYPATH',
  'FILES_MOVE',
  'FILES_DELETE',
  'FILES_DOWNLOADLINK',
  'EXPERIMENTS_TOGGLE',
  'DESKTOP_SETTING_TOGGLE'
]

const ASYNC_ACTION_RE = new RegExp(`^${ASYNC_ACTIONS_TO_RECORD.join('_|')}`)
const ASYNC_ACTION_STATE_RE = /^(.+)_(STARTED|FINISHED|FAILED)$/

const COUNTLY_KEY_WEBUI = '8fa213e6049bff23b08e5f5fbac89e7c27397612'
const COUNTLY_KEY_WEBUI_TEST = '700fd825c3b257e021bd9dbc6cbf044d33477531'

function pickAppKey () {
  const isProd = process.env.NODE_ENV === 'production'

  if (root.ipfsDesktop && root.ipfsDesktop.countlyAppKey) {
    return root.ipfsDesktop.countlyAppKey
  } else {
    return isProd ? COUNTLY_KEY_WEBUI : COUNTLY_KEY_WEBUI_TEST
  }
}

const consentGroups = {
  all: ['sessions', 'events', 'views', 'location', 'crashes'],
  safe: ['sessions', 'events', 'views', 'location']
}

function addConsent (consent, store) {
  root.Countly.q.push(['add_consent', consent])

  if (store.selectIsIpfsDesktop()) {
    store.doDesktopAddConsent(consent)
  }
}

function removeConsent (consent, store) {
  root.Countly.q.push(['remove_consent', consent])

  if (store.selectIsIpfsDesktop()) {
    store.doDesktopRemoveConsent(consent)
  }
}

const createAnalyticsBundle = ({
  countlyUrl = 'https://countly.ipfs.io',
  countlyAppKey = pickAppKey(),
  appVersion = process.env.REACT_APP_VERSION,
  appGitRevision = process.env.REACT_APP_GIT_REV,
  debug = false
}) => {
  return {
    name: 'analytics',

    persistActions: ['ANALYTICS_ENABLED', 'ANALYTICS_DISABLED', 'ANALYTICS_ADD_CONSENT', 'ANALYTICS_REMOVE_CONSENT'],

    init: async (store) => {
      // test code sets a mock Counly instance on the global.
      if (!root.Countly) {
        root.Countly = {}
        root.Countly.q = []
        await import('countly-sdk-web')
      }
      const Countly = root.Countly

      Countly.require_consent = true
      Countly.url = countlyUrl
      Countly.app_key = countlyAppKey
      Countly.app_version = appVersion
      Countly.debug = debug

      if (store.selectIsIpfsDesktop()) {
        Countly.app_version = store.selectDesktopVersion()
        Countly.q.push(['change_id', store.selectDesktopCountlyDeviceId()])
      }
      
      // Configure what to track. Nothing is sent without user consent.
      Countly.q.push(['track_sessions'])
      Countly.q.push(['track_errors'])

      // Don't track clicks or links as it can include full url.
      // Countly.q.push(['track_clicks'])
      // Countly.q.push(['track_links'])

      if (store.selectAnalyticsEnabled()) {
        const consent = store.selectAnalyticsConsent()
        addConsent(consent, store)
      }

      store.subscribeToSelectors(['selectRouteInfo'], ({ routeInfo }) => {
        // skip routes with no hash, as we'll be immediately redirected to `/#`
        if (!root.location || !root.location.hash) return
        /*
        By tracking the pattern rather than the window.location, we limit the info
        we collect to just the app sections that are viewed, and avoid recording
        specific CIDs or local repo paths that would contain personal information.
        */
        root.Countly.q.push(['track_pageview', routeInfo.pattern])
      })

      Countly.init()
    },

    // Listen to redux actions
    getMiddleware: () => (store) => {
      const EventMap = new Map()
      return next => action => {
        // Record durations for async actions
        if (ASYNC_ACTION_RE.test(action.type) && ASYNC_ACTION_STATE_RE.test(action.type)) {
          const [_, name, state] = ASYNC_ACTION_STATE_RE.exec(action.type) // eslint-disable-line no-unused-vars
          if (state === 'STARTED') {
            EventMap.set(name, root.performance.now())
          } else {
            const start = EventMap.get(name)
            if (!start) {
              EventMap.delete(name)
            } else {
              const durationInSeconds = (root.performance.now() - start) / 1000
              let key = state === 'FAILED' ? action.type : name

              // Costum code for experiments toggle and desktop settings toggle.
              // This way we can detect if we're enabling or disabling an option.
              if (name === 'EXPERIMENTS_TOGGLE' || name === 'DESKTOP_SETTING_TOGGLE') {
                key = name === 'EXPERIMENTS_TOGGLE'
                  ? 'EXPERIMENTS_'
                  : 'DESKTOP_SETTING_'

                key += changeCase.constantCase(action.payload.key)

                if (state === 'FAILED') {
                  key += '_FAILED'
                } else {
                  key += action.payload.value
                    ? '_ENABLED'
                    : '_DISABLED'
                }
              }

              root.Countly.q.push(['add_event', {
                key: key,
                count: 1,
                dur: durationInSeconds
              }])
            }
          }

          // Record errors. Only from explicitly selected actions.
          const error = action.error || (action.payload && action.payload.error)
          if (error) {
            root.Countly.q.push(['add_log', action.type])
            root.Countly.q.push(['log_error', error])
          }
        }
        // We're middleware. Don't forget to pass control back to the next.
        return next(action)
      }
    },

    reducer: (state = {
      lastEnabledAt: 0,
      lastDisabledAt: 0,
      consent: []
    }, action) => {
      if (action.type === 'ANALYTICS_ENABLED') {
        return { ...state, lastEnabledAt: Date.now(), consent: action.payload.consent }
      }
      if (action.type === 'ANALYTICS_DISABLED') {
        return { ...state, lastDisabledAt: Date.now(), consent: action.payload.consent }
      }
      if (action.type === 'ANALYTICS_ADD_CONSENT') {
        const consent = state.consent.filter(item => item !== action.payload.name).concat(action.payload.name)
        return { ...state, lastEnabledAt: Date.now(), consent }
      }
      if (action.type === 'ANALYTICS_REMOVE_CONSENT') {
        const consent = state.consent.filter(item => item !== action.payload.name)
        const lastDisabledAt = (consent.length === 0) ? Date.now() : state.lastDisabledAt
        return { ...state, lastDisabledAt, consent }
      }

      // deal with missing consent state from 2.4.0 release.
      if (!state.consent) {
        if (state.lastEnabledAt > state.lastDisabledAt) {
          return { ...state, consent: consentGroups.safe }
        } else {
          return { ...state, consent: [] }
        }
      }

      return state
    },

    selectAnalytics: (state) => state.analytics,

    selectAnalyticsConsent: (state) => state.analytics.consent,

    selectAnalyticsEnabled: (state) => state.analytics.consent.length > 0,

    /*
      Ask the user if we may enable analytics.
    */
    selectAnalyticsAskToEnable: (state) => {
      const { lastEnabledAt, lastDisabledAt, consent } = state.analytics
      // user has not explicitly chosen
      if (!lastEnabledAt && !lastDisabledAt && consent.length === 0) {
        // ask to enable.
        return true
      }
      // user has already made an explicit choice; dont ask again.
      return false
    },

    selectAnalyticsActionsToRecord: createSelector(
      'selectIsIpfsDesktop',
      'selectDesktopCountlyActions',
      (isDesktop, desktopActions) => {
        return isDesktop
          ? desktopActions.concat(ASYNC_ACTIONS_TO_RECORD).sort()
          : Array.from(ASYNC_ACTIONS_TO_RECORD).sort()
      }
    ),

    doToggleAnalytics: () => ({ dispatch, store }) => {
      const enable = !store.selectAnalyticsEnabled()
      if (enable) {
        store.doEnableAnalytics()
      } else {
        store.doDisableAnalytics()
      }
    },

    doDisableAnalytics: () => ({ dispatch, store }) => {
      removeConsent(consentGroups.all, store)
      dispatch({ type: 'ANALYTICS_DISABLED', payload: { consent: [] } })
    },

    doEnableAnalytics: () => ({ dispatch, store }) => {
      removeConsent(consentGroups.all, store)
      addConsent(consentGroups.safe, store)
      dispatch({ type: 'ANALYTICS_ENABLED', payload: { consent: consentGroups.safe } })
    },

    doToggleConsent: (name) => ({ dispatch, store }) => {
      const isEnabled = store.selectAnalyticsConsent().includes(name)
      if (isEnabled) {
        store.doRemoveConsent(name)
      } else {
        store.doAddConsent(name)
      }
    },

    doRemoveConsent: (name) => ({ dispatch, store }) => {
      removeConsent(name, store)
      dispatch({ type: 'ANALYTICS_REMOVE_CONSENT', payload: { name } })
    },

    doAddConsent: (name) => ({ dispatch, store }) => {
      addConsent(name, store)
      dispatch({ type: 'ANALYTICS_ADD_CONSENT', payload: { name } })
    }
  }
}

export default createAnalyticsBundle

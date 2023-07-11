// @ts-check

// @ts-ignore
import root from 'window-or-global'
import changeCase from 'change-case'
import * as Enum from './enum.js'
import { createSelector } from 'redux-bundler'
import { ACTIONS as FILES } from './files/consts.js'
import { ACTIONS as CONIFG } from './config-save.js'
import { ACTIONS as INIT } from './ipfs-provider.js'
import { ACTIONS as EXP } from './experiments.js'
import { getDeploymentEnv } from '../env.js'
import { onlyOnceAfter } from '../lib/hofs/functions.js'

/**
 * @typedef {import('./ipfs-provider').Init} Init
 * @typedef {import('./files/protocol').MakeDir} MakeDir
 * @typedef {import('./files/protocol').Write} Write
 * @typedef {import('./files/protocol').AddByPath} AddByPath
 * @typedef {import('./files/protocol').Move} Move
 * @typedef {import('./files/protocol').Delete} Delete
 * @typedef {import('./files/protocol').DownloadLink} DownloadLink
 * @typedef {import('./config-save').Message} ConfigSave
 * @typedef {import('./experiments').Toggle} ExperimentsToggle
 *
 * @typedef {Object} DesktopSettingToggleStarted
 * @property {'DESKTOP_SETTING_TOGGLE_STARTED'} type
 * @typedef {Object} DesktopSettingToggleFinished
 * @property {'DESKTOP_SETTING_TOGGLE_FINISHED'} type
 * @typedef {Object} DesktopSettingToggleFailed
 * @property {'DESKTOP_SETTING_TOGGLE_FAILED'} type
 *
 * @typedef {import('./experiments').Fail} FailToggle
 * @typedef {import('./experiments').Succeed} SucceedToggle
 * @typedef {import('./experiments').Init} InitToggle
 * @typedef {import('./task').Perform<'DESKTOP_SETTING_TOGGLE', FailToggle, SucceedToggle, InitToggle>} DesktopSettingToggle
 *
 * @typedef {Object} AnalyticsEnabled
 * @property {'ANALYTICS_ENABLED'} type
 * @property {{consent:string[]}} payload
 *
 * @typedef {Object} AnalyticsDisabled
 * @property {'ANALYTICS_DISABLED'} type
 * @property {{consent:string[]}} payload
 *
 * @typedef {Object} RemoveConsent
 * @property {'ANALYTICS_REMOVE_CONSENT'} type
 * @property {{name:string}} payload
 *
 * @typedef {Object} AddConsent
 * @property {'ANALYTICS_ADD_CONSENT'} type
 * @property {{name:string}} payload
 *
 * @typedef {Object} ToggleShowAnalyticsBanner
 * @property {'SET_SHOW_ANALYTICS_BANNER'} type
 * @property {{shouldShow:boolean?}} payload
 *
 * @typedef {ExperimentsToggle|DesktopSettingToggle} Toggle
 * @typedef {MakeDir|Write|AddByPath|Move|Delete|DownloadLink} FilesMessage
 * @typedef {AnalyticsEnabled|AnalyticsDisabled|RemoveConsent|AddConsent|ToggleShowAnalyticsBanner} AnalyticsMessage
 * @typedef {Init|ConfigSave|Toggle|FilesMessage|AnalyticsMessage} Message
 *
 * @typedef {Object} Model
 * @property {number} lastEnabledAt
 * @property {number} lastDisabledAt
 * @property {string[]} consent
 * @property {boolean?} showAnalyticsBanner
 * @property {boolean?} optedOut
 *
 * @typedef {Object} State
 * @property {Model} analytics
 */

// Unknown actions (can't seem to see anything
// dispatching those).
const DESKTOP = Enum.from(['DESKTOP_SETTING_TOGGLE'])

// Local action types
const ACTIONS = Enum.from([
  'ANALYTICS_ENABLED',
  'ANALYTICS_DISABLED',
  'ANALYTICS_ADD_CONSENT',
  'ANALYTICS_REMOVE_CONSENT',
  'SET_SHOW_ANALYTICS_BANNER'
])

// Only record specific actions listed here.
const ASYNC_ACTIONS_TO_RECORD = [
  INIT.IPFS_INIT,
  CONIFG.CONFIG_SAVE,
  FILES.MAKE_DIR,
  FILES.WRITE,
  FILES.ADD_BY_PATH,
  FILES.MOVE,
  FILES.DELETE,
  FILES.DOWNLOAD_LINK,
  EXP.EXPERIMENTS_TOGGLE,
  DESKTOP.DESKTOP_SETTING_TOGGLE
]

const COUNTLY_KEY_WEBUI = '8fa213e6049bff23b08e5f5fbac89e7c27397612'
const COUNTLY_KEY_WEBUI_TEST = '700fd825c3b257e021bd9dbc6cbf044d33477531'
const COUNTLY_KEY_WEBUI_KUBO = 'c4524cc93fed92a5838d4ea27c5a65526b4e7558'

/**
 * @see https://github.com/ipfs/ipfs-webui/issues/2078
 * @returns {Promise<string>}
 */
async function pickAppKey () {
  const isProd = process.env.NODE_ENV === 'production'

  if (root.ipfsDesktop?.countlyAppKey) {
    return root.ipfsDesktop.countlyAppKey
  }

  const env = await getDeploymentEnv()
  if (env === 'kubo') {
    return COUNTLY_KEY_WEBUI_KUBO
  }
  return isProd ? COUNTLY_KEY_WEBUI : COUNTLY_KEY_WEBUI_TEST
}

const consentGroups = {
  all: ['sessions', 'events', 'views', 'location', 'crashes'],
  safe: ['sessions', 'events', 'views', 'location']
}

/**
 * @param {string|string[]} consent
 * @param {Store} store
 */
function addConsent (consent, store) {
  root.Countly.q.push(['add_consent', consent])

  if (store.selectIsIpfsDesktop()) {
    store.doDesktopAddConsent(consent)
  }
}

/**
 * @param {string|string[]} consent
 * @param {Store} store
 */
function removeConsent (consent, store) {
  root.Countly.q.push(['remove_consent', consent])

  if (store.selectIsIpfsDesktop()) {
    store.doDesktopRemoveConsent(consent)
  }
}

/**
 * Add an event to countly.
 *
 * @param {Object} param0
 * @param {string} param0.id
 * @param {number} param0.duration
 */
function addEvent ({ id, duration }) {
  root.Countly.q.push(['add_event', {
    key: id,
    count: 1,
    dur: duration
  }])
}

/**
 * You can limit how many times an event is recorded by adding them here.
 */
const addEventLimitedFns = new Map([
  ['IPFS_INIT_FAILED', onlyOnceAfter(addEvent, 5)]
])

/**
 * Add an event to by using a limited addEvent fn if one is defined, or calling
 * `addEvent` directly.
 *
 * @param {Object} param0
 * @param {string} param0.id
 * @param {number} param0.duration
 */
function addEventWrapped ({ id, duration }) {
  const fn = addEventLimitedFns.get(id)
  if (fn) {
    fn({ id, duration })
  } else {
    addEvent({ id, duration })
  }
}

/**
 * @typedef {import('redux-bundler').Selectors<typeof selectors>} Selectors
 */

const selectors = {
  /**
   * @param {State} state
   */
  selectAnalytics: (state) => state.analytics,
  /**
   * @param {State} state
   */
  selectAnalyticsConsent: (state) => state.analytics.consent,
  /**
   * @param {State} state
   */
  selectAnalyticsEnabled: (state) => state.analytics.consent.length > 0,
  /**
   * @param {State} state
   */
  selectAnalyticsOptedOutPriorToDefaultOptIn: (state) => !state.analytics.optedOut && state.analytics.consent.length === 0 && state.analytics.lastDisabledAt > state.analytics.lastEnabledAt,
  /**
   * @param {State} state
   */
  selectAnalyticsOptedOut: (state) => state.analytics.optedOut,
  /**
   * Show or hide the analytics banner.
   * @param {State} state
   */
  selectShowAnalyticsBanner: (state) => state.analytics.showAnalyticsBanner,

  selectAnalyticsActionsToRecord: createSelector(
    'selectIsIpfsDesktop',
    'selectDesktopCountlyActions',
    /**
     * @param {boolean} isDesktop
     * @param {string[]} desktopActions
     * @returns {string[]}
     */
    (isDesktop, desktopActions) => {
      return isDesktop
        ? desktopActions.concat(ASYNC_ACTIONS_TO_RECORD).sort()
        : Array.from(ASYNC_ACTIONS_TO_RECORD).sort()
    }
  )
}

/**
 * @typedef {import('./ipfs-desktop').Ext} DesktopExt
 * @typedef {import('redux-bundler').Actions<typeof actions>} Actions
 * @typedef {Selectors & Actions & DesktopExt} Ext
 * @typedef {import('redux-bundler').Store<State, Message, Ext>} Store
 * @typedef {import('redux-bundler').Context<State, Message, Ext>} Context
 */

const actions = {
  /**
   * @returns {function(Context):void}
   */
  doToggleAnalytics: () => ({ store }) => {
    const enable = !store.selectAnalyticsEnabled()
    if (enable) {
      store.doEnableAnalytics()
    } else {
      store.doDisableAnalytics()
    }
  },
  /**
   * @returns {function(Context):void}
   */
  doDisableAnalytics: () => ({ dispatch, store }) => {
    root.Countly.opt_out()
    removeConsent(consentGroups.all, store)
    dispatch({ type: 'ANALYTICS_DISABLED', payload: { consent: [] } })
  },
  /**
   * @returns {function(Context):void}
   */
  doEnableAnalytics: () => ({ dispatch, store }) => {
    removeConsent(consentGroups.all, store)
    root.Countly.opt_in()
    addConsent(consentGroups.safe, store)
    dispatch({ type: 'ANALYTICS_ENABLED', payload: { consent: consentGroups.safe } })
  },
  /**
   * @param {string} name
   * @returns {function(Context):void}
   */
  doToggleConsent: (name) => ({ store }) => {
    const isEnabled = store.selectAnalyticsConsent().includes(name)
    if (isEnabled) {
      store.doRemoveConsent(name)
    } else {
      store.doAddConsent(name)
    }
  },
  /**
   * @param {string} name
   * @returns {function(Context):void}
   */
  doRemoveConsent: (name) => ({ dispatch, store }) => {
    const existingConsents = store.selectAnalyticsConsent()
    const remainingConsents = existingConsents.filter(item => item !== name)
    // Ensure the users is fully opted out of analytics if they remove all consents.
    // This means the consent removal event is not sent to countly, which is good.
    // If a user tells us to send nothing, we send nothing.
    // see: https://github.com/ipfs/ipfs-webui/issues/1041
    if (remainingConsents.length === 0) {
      root.Countly.opt_out()
    }
    removeConsent(name, store)
    dispatch({ type: 'ANALYTICS_REMOVE_CONSENT', payload: { name } })
  },
  /**
   * @param {string} name
   * @returns {function(Context):void}
   */
  doAddConsent: (name) => ({ dispatch, store }) => {
    const existingConsents = store.selectAnalyticsConsent()
    if (existingConsents.length === 0) {
      // Going from 0 to 1 consents opts you in to analytics
      root.Countly.opt_in()
    }
    addConsent(name, store)
    dispatch({ type: 'ANALYTICS_ADD_CONSENT', payload: { name } })
  },
  /**
   * @param {boolean?} shouldShow
   * @returns {function(Context):void}
   */
  doToggleShowAnalyticsBanner: (shouldShow) => ({ dispatch }) => {
    dispatch({ type: 'SET_SHOW_ANALYTICS_BANNER', payload: { shouldShow } })
  }
}

const createAnalyticsBundle = ({
  countlyUrl = 'https://countly.ipfs.tech',
  appVersion = process.env.REACT_APP_VERSION,
  // @ts-ignore - declared but never used
  appGitRevision = process.env.REACT_APP_GIT_REV,
  debug = false
}) => {
  return {
    name: 'analytics',

    persistActions: [
      ACTIONS.ANALYTICS_ENABLED,
      ACTIONS.ANALYTICS_DISABLED,
      ACTIONS.ANALYTICS_DISABLED,
      ACTIONS.ANALYTICS_ADD_CONSENT,
      ACTIONS.ANALYTICS_REMOVE_CONSENT,
      ACTIONS.SET_SHOW_ANALYTICS_BANNER
    ],

    /**
     * @param {Store} store
     */
    init: async (store) => {
      // LogRocket.init('sfqf1k/ipfs-webui')
      // test code sets a mock Counly instance on the global.
      if (!root.Countly) {
        root.Countly = {}
        root.Countly.q = []
        // @ts-ignore
        await import('countly-sdk-web')
      }
      const Countly = root.Countly

      Countly.require_consent = true
      Countly.url = countlyUrl
      const countlyAppKeyPromise = pickAppKey()
      countlyAppKeyPromise.then((appKey) => {
        Countly.app_key = appKey
      })
      Countly.app_version = appVersion
      Countly.debug = debug

      if (store.selectIsIpfsDesktop()) {
        Countly.app_version = store.selectDesktopVersion()
        Countly.q.push(['change_id', store.selectDesktopCountlyDeviceId(), true])
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
      } else if (!store.selectAnalyticsOptedOut()) {
        if (store.selectAnalyticsOptedOutPriorToDefaultOptIn()) {
          store.doToggleShowAnalyticsBanner(true)
        }
        // add consent/opt in by default
        store.doEnableAnalytics()
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

      // Fix for storybook error 'Countly.init is not a function'
      if (typeof Countly.init === 'function') {
        await countlyAppKeyPromise
        Countly.init()
      }
    },

    // Listen to redux actions
    getMiddleware: () => () => {
      /**
       * @param {function(Message):void} next
       * @returns {function(Message):void}
       */
      const middleware = next => action => {
        const payload = parseTask(action)
        if (payload) {
          const { id, duration, error } = payload
          addEventWrapped({ id, duration })

          // Record errors. Only from explicitly selected actions.
          if (error) {
            root.Countly.q.push(['add_log', action.type])
            root.Countly.q.push(['log_error', error])
            // LogRocket.error(error)
            // logger.error('Error in action', action.type, error)
          }
        }

        return next(action)
      }

      return middleware
    },

    /**
     * @param {Model|void} state
     * @param {Message} action
     * @returns {Model}
     */
    reducer: (state, action) => {
      state = state || {
        lastEnabledAt: 0,
        lastDisabledAt: 0,
        showAnalyticsBanner: false,
        optedOut: false,
        consent: []
      }

      switch (action.type) {
        case ACTIONS.ANALYTICS_ENABLED:
          return { ...state, lastEnabledAt: Date.now(), consent: action.payload.consent, optedOut: false }
        case ACTIONS.ANALYTICS_DISABLED:
          return { ...state, lastDisabledAt: Date.now(), consent: action.payload.consent, optedOut: true, showAnalyticsBanner: false }
        case ACTIONS.ANALYTICS_ADD_CONSENT: {
          const consent = state.consent.filter(item => item !== action.payload.name).concat(action.payload.name)
          return { ...state, lastEnabledAt: Date.now(), consent, optedOut: false }
        }
        case ACTIONS.ANALYTICS_REMOVE_CONSENT: {
          const consent = state.consent.filter(item => item !== action.payload.name)
          const lastDisabledAt = (consent.length === 0) ? Date.now() : state.lastDisabledAt
          const didOptOutCompletely = consent.length === 0
          return { ...state, lastDisabledAt, consent, optedOut: didOptOutCompletely, showAnalyticsBanner: false }
        }
        case ACTIONS.SET_SHOW_ANALYTICS_BANNER: {
          const shouldShowAnalyticsBanner = action.payload?.shouldShow || false
          return { ...state, showAnalyticsBanner: shouldShowAnalyticsBanner }
        }
        default: {
          // deal with missing consent state from 2.4.0 release.
          if (!state.consent) {
            if (state.lastEnabledAt > state.lastDisabledAt) {
              return { ...state, consent: consentGroups.safe }
            } else {
              return { ...state, consent: [] }
            }
          }

          return state
        }
      }
    },

    ...selectors,

    ...actions
  }
}

/**
 * @param {Message} action
 */
const parseTask = (action) => {
  switch (action.type) {
    case FILES.MAKE_DIR:
    case FILES.WRITE:
    case FILES.ADD_BY_PATH:
    case FILES.MOVE:
    case FILES.DELETE:
    case FILES.DOWNLOAD_LINK:
    case INIT.IPFS_INIT:
    case CONIFG.CONFIG_SAVE:
      return parseTaskResult(action.task, action.type)
    case EXP.EXPERIMENTS_TOGGLE:
      return parseToggleResult(action.task, 'EXPERIMENTS')
    case DESKTOP.DESKTOP_SETTING_TOGGLE:
      return parseToggleResult(action.task, 'DESKTOP_SETTING')
    default:
      return null
  }
}

/**
 * @param {Init['task']|ConfigSave['task']|FilesMessage['task']} task
 * @param {string} name
 */
const parseTaskResult = (task, name) => {
  if (task.status === 'Exit') {
    const { duration, result } = task
    const id = result.ok ? name : `${name}_FAILED`
    const error = result.ok ? null : result.error
    return { id, duration, error }
  } else {
    return null
  }
}

/**
 * @param {Toggle['task']} task
 * @param {string} name
 */
const parseToggleResult = (task, name) => {
  if (task.status === 'Exit') {
    const { result, duration } = task
    const { key } = result.ok ? result.value : result.error
    const error = result.ok ? null : result.error
    const status = !result.ok
      ? 'FAILED'
      : result.value.value
        ? 'ENABLED'
        : 'DISABLED'

    const id = `${name}_${changeCase.constantCase(key)}_${status}`

    return { id, duration, error }
  }
  return null
}

export default createAnalyticsBundle

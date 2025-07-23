import { readSetting, writeSetting } from './local-storage.js'

/**
 * @typedef {import('ipfs').IPFSService} IPFSService
 * @typedef {Set<string> | null} KuboSubsystems Valid subsystems to set log levels for.
 * @typedef {'debug' | 'info' | 'warn' | 'error' | 'dpanic' | 'panic' | 'fatal'} LogLevel
 * @typedef {'all' | '*'} AllSubsystemAliases
 *
 * @typedef {Object} Model
 * @property {boolean} initialized
 * @property {string} logLevel
 * @property {boolean} error
 *
 * @typedef {Object} ParsedLogLevel
 * @property {LogLevel} level
 * @property {string} subsystem
 *
 * @typedef {Object} State
 * @property {Model} logLevel
 */

/**
 * @type {AllSubsystemAliases}
 */
const ALL_SUBSYSTEMS_ALIASES = ['all', '*']
/**
 * @type {ReadonlyArray<LogLevel>}
 */
const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'dpanic', 'panic', 'fatal']
/**
 * @type {LogLevel}
 */
const DEFAULT_LOG_LEVEL = 'error'

/**
 * @returns {Model}
 */
const init = () => ({
  initialized: false,
  logLevel: readSetting('ipfsLogLevel') || DEFAULT_LOG_LEVEL,
  error: false
})

/**
 * @type {KuboSubsystems}
 */
let kuboSubsystems = null

/**
 * Validates a log level input string.
 * - Verifies that both subsystem and level are valid.
 *
 * @param {string} logLevelInput
 * @returns {boolean}
 * @example
 * checkValidLogLevel('debug')
 * checkValidLogLevel('*=debug, gc=info')
 * checkValidLogLevel('all=debug, gc=info, autotls=warn')
 */
export const checkValidLogLevel = (logLevelInput) => {
  try {
    const inputs = parseLogLevelToArray(logLevelInput)
    if (inputs.length === 0) return false
    for (const { level, subsystem } of inputs) {
      if (!LOG_LEVELS.includes(level)) return false
      if (!kuboSubsystems.has(subsystem) && !ALL_SUBSYSTEMS_ALIASES.includes(subsystem)) return false
    }
    return true
  } catch (err) {
    return false
  }
}

/**
 * Parses the given log level input string into an array of objects.
 * - lowercases the inputs
 * - removes any whitespace
 * @param {string} logLevel
 * @returns {Array<ParsedLogLevel>}
 */
const parseLogLevelToArray = (logLevel) => {
  const inputs = logLevel.split(' ').join('').toLowerCase().split(',')
  const result = []
  for (const input of inputs) {
    let level, subsystem
    if (input.includes('=')) {
      const [a, b] = input.trim().split('=')
      subsystem = a
      level = b
    } else {
      subsystem = 'all'
      level = input
    }
    result.push({ subsystem, level })
  }
  return result
}

/**
 * Loops through each log level setting and sends request to Kubo.
 * @param {string} logLevel
 * @param {IPFSService} ipfs
 * @returns {Promise<void>}
 */
const setLogLevels = async (logLevel, ipfs) => {
  const inputs = parseLogLevelToArray(logLevel)
  for (const { subsystem, level } of inputs) {
    const res = await ipfs.log.level(subsystem, level)
    console.info(res?.message)
  }
}

const bundle = {
  name: 'logLevel',

  reducer: (state = init(), { type, payload }) => {
    switch (type) {
      case 'SET_INITIALIZED':
        return { ...state, initialized: payload }
      case 'SET_LOG_LEVEL':
        return { ...state, logLevel: payload }
      case 'SET_ERROR':
        return { ...state, error: payload }
      default:
        return state
    }
  },

  /**
   * Initializes the log level setting.
   * - Reads logs level from local storage or uses default.
   * - Reads subsystems from Kubo.
   * @returns {Promise<void>}
   */
  doInitLogLevel: () => async ({ store, getIpfs, dispatch }) => {
    try {
      // set log levels
      const ipfs = getIpfs()
      await setLogLevels(store.selectIpfsLogLevel(), ipfs)

      // load subsystems
      const subsystems = await ipfs.log.ls()
      kuboSubsystems = new Set(subsystems)
      dispatch({ type: 'SET_INITIALIZED', payload: true })
    } catch (err) {
      console.error('log-level init failed: ', err)
      dispatch({ type: 'SET_ERROR', payload: true })
    }
  },

  /**
   * @param {string} logLevelInput
   * @returns {function(Context):Promise<void>}
   */
  doUpdateLogLevel: (logLevelInput) => async ({ dispatch, getIpfs }) => {
    try {
      if (!checkValidLogLevel(logLevelInput)) {
        throw new Error('Invalid log level input')
      }
      await setLogLevels(logLevelInput, getIpfs())
      await writeSetting('ipfsLogLevel', logLevelInput)
      dispatch({ type: 'SET_LOG_LEVEL', payload: logLevelInput })
      dispatch({ type: 'SET_ERROR', payload: false })
    } catch (err) {
      console.error('Error setting kubo log level: ', err)
      dispatch({ type: 'SET_ERROR', payload: true })
    }
  },

  /**
   * @param {State} state
   */
  selectIpfsLogLevelInitialized: (state) => {
    return state.logLevel.initialized
  },

  /**
   * @param {State} state
   */
  selectIpfsLogLevel: (state) => {
    return state.logLevel.logLevel
  },

  /**
   * @param {State} state
   */
  selectIpfsLogLevelError: (state) => {
    return state.logLevel.error
  }
}

export default bundle

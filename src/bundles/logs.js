import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import * as Enum from '../lib/enum.js'

/**
 * @typedef {Object} LogEntry
 * @property {string} timestamp
 * @property {string} level
 * @property {string} subsystem
 * @property {string} message
 */

/**
 * @typedef {Object} LogSubsystem
 * @property {string} name
 * @property {string} level
 */

/**
 * @typedef {Object} LogsState
 * @property {LogEntry[]} entries
 * @property {boolean} isStreaming
 * @property {string} globalLogLevel
 * @property {AbortController|null} streamController
 */

const ACTIONS = Enum.from([
  'LOGS_SET_LEVEL',
  'LOGS_START_STREAMING',
  'LOGS_STOP_STREAMING',
  'LOGS_ADD_ENTRY',
  'LOGS_CLEAR_ENTRIES'
])

const defaultState = {
  entries: [],
  isStreaming: false,
  globalLogLevel: 'info',
  streamController: null
}

const logsBundle = {
  name: 'logs',

  reducer: (state = defaultState, action) => {
    switch (action.type) {
      case ACTIONS.LOGS_SET_LEVEL: {
        if (action.subsystem === 'all') {
          return { ...state, globalLogLevel: action.level }
        }
        // For individual subsystems, we'll let the component handle the UI state
        return state
      }
      case ACTIONS.LOGS_START_STREAMING: {
        return {
          ...state,
          isStreaming: true,
          streamController: action.payload?.controller || null
        }
      }
      case ACTIONS.LOGS_STOP_STREAMING: {
        // Clean up the stream controller if it exists
        if (state.streamController) {
          state.streamController.abort()
        }
        return {
          ...state,
          isStreaming: false,
          streamController: null
        }
      }
      case ACTIONS.LOGS_ADD_ENTRY: {
        const newEntry = action.payload
        return {
          ...state,
          entries: [...state.entries.slice(-999), newEntry] // Keep last 1000 entries
        }
      }
      case ACTIONS.LOGS_CLEAR_ENTRIES: {
        return { ...state, entries: [] }
      }
      default:
        return state
    }
  },

  // Selectors
  selectLogs: state => state.logs,
  selectLogEntries: state => state.logs?.entries || [],
  selectIsLogStreaming: state => state.logs?.isStreaming || false,
  selectGlobalLogLevel: state => state.logs?.globalLogLevel || 'info',

  // Actions
  doSetLogLevel: (subsystem, level) => async ({ getIpfs, dispatch }) => {
    try {
      const ipfs = getIpfs()
      if (!ipfs) {
        throw new Error('IPFS not available')
      }

      await ipfs.log.level(subsystem, level)
      dispatch({ type: ACTIONS.LOGS_SET_LEVEL, subsystem, level })
    } catch (error) {
      console.error(`Failed to set log level for ${subsystem}:`, error)
      throw error
    }
  },

  doStartLogStreaming: () => async ({ getIpfs, dispatch }) => {
    const ipfs = getIpfs()
    if (!ipfs) {
      console.error('IPFS instance not available')
      return
    }

    const controller = new AbortController()

    dispatch({
      type: ACTIONS.LOGS_START_STREAMING,
      payload: { controller }
    })

    try {
      // Create a readable stream for log entries
      const stream = ipfs.log.tail()

      // Set up the reader for the stream
      let reader
      if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
        // Handle async iterable
        const processStream = async () => {
          try {
            for await (const entry of stream) {
              if (controller.signal.aborted) {
                break
              }

              // Parse log entry
              const logEntry = parseLogEntry(entry)
              if (logEntry) {
                dispatch({ type: ACTIONS.LOGS_ADD_ENTRY, payload: logEntry })
              }
            }
          } catch (error) {
            if (!controller.signal.aborted) {
              console.error('Log streaming error:', error)
              dispatch({ type: ACTIONS.LOGS_STOP_STREAMING })
            }
          }
        }
        processStream()
      } else if (stream && stream.getReader) {
        // Handle ReadableStream
        reader = stream.getReader()
        const processChunks = async () => {
          try {
            while (true) {
              if (controller.signal.aborted) {
                break
              }

              const { done, value } = await reader.read()

              if (done) {
                break
              }

              // Parse log entry from chunk
              const logEntry = parseLogEntry(value)
              if (logEntry) {
                dispatch({ type: ACTIONS.LOGS_ADD_ENTRY, payload: logEntry })
              }
            }
          } catch (error) {
            if (!controller.signal.aborted) {
              console.error('Log streaming error:', error)
              dispatch({ type: ACTIONS.LOGS_STOP_STREAMING })
            }
          } finally {
            if (reader) {
              reader.releaseLock()
            }
          }
        }
        processChunks()
      } else {
        // Fallback: simulate log entries for demo purposes
        console.warn('Log streaming not fully supported, using simulation')
        simulateLogEntries(dispatch, controller)
      }
    } catch (error) {
      console.error('Failed to start log streaming:', error)
      dispatch({ type: ACTIONS.LOGS_STOP_STREAMING })
    }
  },

  doStopLogStreaming: () => ({ dispatch }) => {
    dispatch({ type: ACTIONS.LOGS_STOP_STREAMING })
  },

  doAddLogEntry: (entry) => ({ dispatch }) => {
    dispatch({ type: ACTIONS.LOGS_ADD_ENTRY, payload: entry })
  },

  doClearLogEntries: () => ({ dispatch }) => {
    dispatch({ type: ACTIONS.LOGS_CLEAR_ENTRIES })
  }
}

// Create separate async resource bundle for subsystems
const logSubsystemsBundle = createAsyncResourceBundle({
  name: 'logSubsystems',
  actionBaseType: 'LOG_SUBSYSTEMS',
  getPromise: async ({ getIpfs }) => {
    try {
      const response = await getIpfs().log.ls()
      const subsystems = Array.isArray(response)
        ? response.map(name => ({ name, level: 'info' }))
        : response.Strings?.map(name => ({ name, level: 'info' })) || []
      return subsystems
    } catch (error) {
      console.error('Failed to fetch log subsystems:', error)
      throw error
    }
  },
  staleAfter: 60000,
  persist: false,
  checkIfOnline: false
})

// Add selectors for subsystems to the main logs bundle
logsBundle.selectLogSubsystems = state => {
  const data = state.logSubsystems?.data
  return Array.isArray(data) ? data : []
}
logsBundle.selectIsLoadingSubsystems = state => state.logSubsystems?.isLoading || false

// Add fetch action to logs bundle
logsBundle.doFetchLogSubsystems = logSubsystemsBundle.doFetchLogSubsystems

// Auto-fetch subsystems when IPFS is ready
logsBundle.reactLogSubsystemsFetch = createSelector(
  'selectLogSubsystemsShouldUpdate',
  'selectIpfsReady',
  (shouldUpdate, ipfsReady) => {
    if (shouldUpdate && ipfsReady) {
      return { actionCreator: 'doFetchLogSubsystems' }
    }
  }
)

// Helper function to parse log entries
function parseLogEntry (entry) {
  try {
    if (typeof entry === 'string') {
      // Try to parse as JSON log entry
      if (entry.startsWith('{')) {
        const parsed = JSON.parse(entry)
        return {
          timestamp: parsed.ts || parsed.timestamp || new Date().toISOString(),
          level: parsed.level || 'info',
          subsystem: parsed.system || parsed.logger || 'unknown',
          message: parsed.msg || parsed.message || entry
        }
      } else {
        // Parse plain text log format
        const parts = entry.split(' ')
        if (parts.length >= 3) {
          return {
            timestamp: new Date().toISOString(),
            level: parts[0] || 'info',
            subsystem: parts[1] || 'unknown',
            message: parts.slice(2).join(' ')
          }
        }
      }
    } else if (entry && typeof entry === 'object') {
      // Already parsed object
      return {
        timestamp: entry.ts || entry.timestamp || new Date().toISOString(),
        level: entry.level || 'info',
        subsystem: entry.system || entry.logger || 'unknown',
        message: entry.msg || entry.message || JSON.stringify(entry)
      }
    }
  } catch (error) {
    console.warn('Failed to parse log entry:', error)
  }

  // Fallback for unparseable entries
  return {
    timestamp: new Date().toISOString(),
    level: 'info',
    subsystem: 'unknown',
    message: String(entry)
  }
}

// Simulate log entries for demonstration
function simulateLogEntries (dispatch, controller) {
  const levels = ['debug', 'info', 'warn', 'error']
  const subsystems = ['bitswap', 'dht', 'swarm', 'pubsub', 'routing']
  const messages = [
    'Connection established',
    'Processing request',
    'Block received',
    'Peer discovered',
    'DHT query complete',
    'Content routing update',
    'Swarm connection lost',
    'Republishing provider records'
  ]

  const simulate = () => {
    if (controller.signal.aborted) {
      return
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level: levels[Math.floor(Math.random() * levels.length)],
      subsystem: subsystems[Math.floor(Math.random() * subsystems.length)],
      message: messages[Math.floor(Math.random() * messages.length)]
    }

    dispatch({ type: ACTIONS.LOGS_ADD_ENTRY, payload: entry })

    // Schedule next entry
    setTimeout(simulate, 1000 + Math.random() * 3000)
  }

  // Start simulation
  setTimeout(simulate, 1000)
}

// Export both bundles
export { logSubsystemsBundle }
export default logsBundle

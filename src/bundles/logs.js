import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import * as Enum from '../lib/enum.js'
import { logStorage } from '../lib/log-storage.ts'

/**
 * @typedef {Object} LogEntry
 * @property {string} timestamp
 * @property {string} level
 * @property {string} subsystem
 * @property {string} message
 * @property {string} id
 */

/**
 * @typedef {Object} LogSubsystem
 * @property {string} name
 * @property {string} level
 */

/**
 * @typedef {Object} LogBufferConfig
 * @property {number} memory
 * @property {number} indexedDB
 * @property {number} warnThreshold
 * @property {number} autoDisableThreshold
 */

/**
 * @typedef {Object} LogRateState
 * @property {number} currentRate
 * @property {number[]} recentCounts
 * @property {number} lastCountTime
 * @property {boolean} hasWarned
 * @property {boolean} autoDisabled
 */

/**
 * @typedef {Object} LogsState
 * @property {LogEntry[]} entries
 * @property {boolean} isStreaming
 * @property {string} globalLogLevel
 * @property {AbortController|null} streamController
 * @property {LogBufferConfig} bufferConfig
 * @property {LogRateState} rateState
 * @property {boolean} hasMoreHistory
 * @property {boolean} isLoadingHistory
 * @property {Object|null} storageStats
 * @property {LogEntry[]} pendingBatch
 * @property {number|null} batchTimeout
 */

const ACTIONS = Enum.from([
  'LOGS_SET_LEVEL',
  'LOGS_START_STREAMING',
  'LOGS_STOP_STREAMING',
  'LOGS_ADD_ENTRY',
  'LOGS_ADD_BATCH',
  'LOGS_CLEAR_ENTRIES',
  'LOGS_UPDATE_BUFFER_CONFIG',
  'LOGS_UPDATE_RATE_STATE',
  'LOGS_LOAD_HISTORY',
  'LOGS_SET_LOADING_HISTORY',
  'LOGS_UPDATE_STORAGE_STATS',
  'LOGS_SHOW_WARNING',
  'LOGS_AUTO_DISABLE'
])

const DEFAULT_BUFFER_CONFIG = {
  memory: 500,
  indexedDB: 10000,
  warnThreshold: 100,
  autoDisableThreshold: 500
}

const defaultState = {
  entries: [],
  isStreaming: false,
  globalLogLevel: 'info',
  streamController: null,
  bufferConfig: DEFAULT_BUFFER_CONFIG,
  rateState: {
    currentRate: 0,
    recentCounts: [],
    lastCountTime: Date.now(),
    hasWarned: false,
    autoDisabled: false
  },
  hasMoreHistory: false,
  isLoadingHistory: false,
  storageStats: null,
  pendingBatch: [],
  batchTimeout: null
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
          streamController: action.payload?.controller || null,
          rateState: {
            ...state.rateState,
            hasWarned: false,
            autoDisabled: false
          }
        }
      }
      case ACTIONS.LOGS_STOP_STREAMING: {
        // Clean up the stream controller if it exists
        if (state.streamController) {
          state.streamController.abort()
        }
        // Clear batch timeout
        if (state.batchTimeout) {
          clearTimeout(state.batchTimeout)
        }
        return {
          ...state,
          isStreaming: false,
          streamController: null,
          pendingBatch: [],
          batchTimeout: null
        }
      }
      case ACTIONS.LOGS_ADD_ENTRY: {
        const newEntry = action.payload
        // Add to pending batch instead of directly to entries
        return {
          ...state,
          pendingBatch: [...state.pendingBatch, newEntry]
        }
      }
      case ACTIONS.LOGS_ADD_BATCH: {
        const batchEntries = action.payload
        const memoryLimit = state.bufferConfig.memory
        const newEntries = [...state.entries, ...batchEntries]

        return {
          ...state,
          entries: newEntries.slice(-memoryLimit), // Keep only last N entries in memory
          pendingBatch: [],
          batchTimeout: null
        }
      }
      case ACTIONS.LOGS_CLEAR_ENTRIES: {
        return {
          ...state,
          entries: [],
          pendingBatch: [],
          hasMoreHistory: false
        }
      }
      case ACTIONS.LOGS_UPDATE_BUFFER_CONFIG: {
        return {
          ...state,
          bufferConfig: { ...state.bufferConfig, ...action.payload }
        }
      }
      case ACTIONS.LOGS_UPDATE_RATE_STATE: {
        return {
          ...state,
          rateState: { ...state.rateState, ...action.payload }
        }
      }
      case ACTIONS.LOGS_LOAD_HISTORY: {
        const historicalEntries = action.payload
        return {
          ...state,
          entries: [...historicalEntries, ...state.entries],
          isLoadingHistory: false,
          hasMoreHistory: historicalEntries.length > 0
        }
      }
      case ACTIONS.LOGS_SET_LOADING_HISTORY: {
        return {
          ...state,
          isLoadingHistory: action.payload
        }
      }
      case ACTIONS.LOGS_UPDATE_STORAGE_STATS: {
        return {
          ...state,
          storageStats: action.payload
        }
      }
      case ACTIONS.LOGS_SHOW_WARNING: {
        return {
          ...state,
          rateState: {
            ...state.rateState,
            hasWarned: true
          }
        }
      }
      case ACTIONS.LOGS_AUTO_DISABLE: {
        // Clean up the stream controller if it exists
        if (state.streamController) {
          state.streamController.abort()
        }
        return {
          ...state,
          isStreaming: false,
          streamController: null,
          rateState: {
            ...state.rateState,
            autoDisabled: true
          }
        }
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
  selectLogBufferConfig: state => state.logs?.bufferConfig || DEFAULT_BUFFER_CONFIG,
  selectLogRateState: state => state.logs?.rateState || defaultState.rateState,
  selectHasMoreHistory: state => state.logs?.hasMoreHistory || false,
  selectIsLoadingHistory: state => state.logs?.isLoadingHistory || false,
  selectLogStorageStats: state => state.logs?.storageStats || null,
  selectPendingLogBatch: state => state.logs?.pendingBatch || [],

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

  doStartLogStreaming: () => async ({ getIpfs, dispatch, store }) => {
    const ipfs = getIpfs()
    if (!ipfs) {
      console.error('IPFS instance not available')
      return
    }

    const controller = new AbortController()
    const bufferConfig = store.selectLogBufferConfig()

    dispatch({
      type: ACTIONS.LOGS_START_STREAMING,
      payload: { controller }
    })

    // Set up batch processing
    const batchProcessor = createBatchProcessor(dispatch, store, controller, bufferConfig)

    try {
      // Initialize log storage
      await logStorage.init()

      // Load recent logs from IndexedDB
      try {
        const recentLogs = await logStorage.getRecentLogs(bufferConfig.memory)
        if (recentLogs.length > 0) {
          dispatch({ type: ACTIONS.LOGS_ADD_BATCH, payload: recentLogs })
        }

        // Update storage stats and check for more history
        const stats = await logStorage.getStorageStats()
        dispatch({ type: ACTIONS.LOGS_UPDATE_STORAGE_STATS, payload: stats })

        // Set hasMoreHistory based on whether there are more logs than what we loaded
        if (stats.totalEntries > recentLogs.length) {
          // We have more history available - this will be used by the UI to show "Load more" button
          store.dispatch({ type: ACTIONS.LOGS_LOAD_HISTORY, payload: [] }) // Empty array means we have more but haven't loaded it yet
        }
      } catch (error) {
        console.warn('Failed to load recent logs from storage:', error)
      }

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
                batchProcessor.addEntry(logEntry)
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
                batchProcessor.addEntry(logEntry)
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
        simulateLogEntries(batchProcessor, controller, bufferConfig)
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

  doClearLogEntries: () => async ({ dispatch }) => {
    // Clear both memory and IndexedDB
    try {
      await logStorage.clearAllLogs()
    } catch (error) {
      console.warn('Failed to clear IndexedDB logs:', error)
    }
    dispatch({ type: ACTIONS.LOGS_CLEAR_ENTRIES })
  },

  // New enhanced actions
  doUpdateLogBufferConfig: (config) => ({ dispatch }) => {
    dispatch({ type: ACTIONS.LOGS_UPDATE_BUFFER_CONFIG, payload: config })
    // Update IndexedDB config
    logStorage.updateConfig({ maxEntries: config.indexedDB })
  },

  doLoadHistoricalLogs: (beforeTimestamp, limit = 100) => async ({ dispatch }) => {
    dispatch({ type: ACTIONS.LOGS_SET_LOADING_HISTORY, payload: true })

    try {
      const historicalLogs = await logStorage.getLogsBefore(beforeTimestamp, limit)
      dispatch({ type: ACTIONS.LOGS_LOAD_HISTORY, payload: historicalLogs })
    } catch (error) {
      console.error('Failed to load historical logs:', error)
      dispatch({ type: ACTIONS.LOGS_SET_LOADING_HISTORY, payload: false })
    }
  },

  doUpdateStorageStats: () => async ({ dispatch }) => {
    try {
      const stats = await logStorage.getStorageStats()
      dispatch({ type: ACTIONS.LOGS_UPDATE_STORAGE_STATS, payload: stats })
    } catch (error) {
      console.error('Failed to update storage stats:', error)
    }
  },

  doShowLogWarning: (warningType) => ({ dispatch }) => {
    dispatch({ type: ACTIONS.LOGS_SHOW_WARNING, payload: warningType })
  },

  doAutoDisableStreaming: () => ({ dispatch }) => {
    dispatch({ type: ACTIONS.LOGS_AUTO_DISABLE })
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

// Batch processor for efficient log handling with rate monitoring
function createBatchProcessor (dispatch, store, controller, bufferConfig) {
  let pendingEntries = []
  let lastBatchTime = Date.now()
  let entryCounts = [] // Rolling window of entry counts per second
  let batchTimeout = null

  const processBatch = async () => {
    if (pendingEntries.length === 0) return

    const entries = [...pendingEntries]
    pendingEntries = []
    batchTimeout = null

    // Update rate monitoring
    const now = Date.now()
    const currentSecond = Math.floor(now / 1000)

    // Clean old counts (keep last 5 seconds for rate calculation)
    entryCounts = entryCounts.filter(({ second }) => currentSecond - second < 5)

    // Add current batch count
    const existingCount = entryCounts.find(({ second }) => second === currentSecond)
    if (existingCount) {
      existingCount.count += entries.length
    } else {
      entryCounts.push({ second: currentSecond, count: entries.length })
    }

    // Calculate current rate (entries per second over last 5 seconds)
    const totalEntries = entryCounts.reduce((sum, { count }) => sum + count, 0)
    const currentRate = totalEntries / Math.max(entryCounts.length, 1)

    // Update rate state
    dispatch({
      type: ACTIONS.LOGS_UPDATE_RATE_STATE,
      payload: { currentRate, recentCounts: entryCounts }
    })

    // Check for warnings and auto-disable
    const rateState = store.selectLogRateState()

    if (currentRate > bufferConfig.autoDisableThreshold && !rateState.autoDisabled) {
      console.warn(`Log rate too high (${currentRate.toFixed(1)}/s), auto-disabling streaming`)
      dispatch({ type: ACTIONS.LOGS_AUTO_DISABLE })
      return
    }

    if (currentRate > bufferConfig.warnThreshold && !rateState.hasWarned && !rateState.autoDisabled) {
      console.warn(`High log rate detected: ${currentRate.toFixed(1)} logs/second`)
      dispatch({ type: ACTIONS.LOGS_SHOW_WARNING })
    }

    // Store in IndexedDB (async, don't wait)
    try {
      logStorage.appendLogs(entries).catch(error => {
        console.warn('Failed to store logs in IndexedDB:', error)
      })
    } catch (error) {
      console.warn('Failed to store logs in IndexedDB:', error)
    }

    // Add to memory buffer
    dispatch({ type: ACTIONS.LOGS_ADD_BATCH, payload: entries })

    lastBatchTime = now
  }

  const addEntry = (entry) => {
    if (controller.signal.aborted) return

    pendingEntries.push(entry)

    // Process batch if we have enough entries or enough time has passed
    const shouldProcess =
      pendingEntries.length >= 50 || // Batch size threshold
      (Date.now() - lastBatchTime) >= 500 // Time threshold (500ms)

    if (shouldProcess && !batchTimeout) {
      batchTimeout = setTimeout(processBatch, 100) // Small delay to collect a few more entries
    } else if (!batchTimeout) {
      // Set a fallback timeout to ensure batches are processed even with low rates
      batchTimeout = setTimeout(processBatch, 1000)
    }
  }

  // Clean up on abort
  controller.signal.addEventListener('abort', () => {
    if (batchTimeout) {
      clearTimeout(batchTimeout)
      batchTimeout = null
    }
    // Process any remaining entries
    if (pendingEntries.length > 0) {
      processBatch()
    }
  })

  return { addEntry }
}

// Simulate log entries for demonstration
function simulateLogEntries (batchProcessor, controller, bufferConfig) {
  const levels = ['debug', 'info', 'warn', 'error']
  const subsystems = ['bitswap', 'dht', 'swarm', 'pubsub', 'routing', 'blockservice', 'exchange', 'namesys']
  const messages = [
    'Connection established',
    'Processing request',
    'Block received',
    'Peer discovered',
    'DHT query complete',
    'Content routing update',
    'Swarm connection lost',
    'Republishing provider records',
    'Bootstrap peer connected',
    'Block exchange started',
    'Routing table updated',
    'Network bandwidth measured'
  ]

  // Simulate varying log rates based on global log level
  const baseInterval = 2000 // Default for info level
  const burstProbability = 0.1 // Chance of burst mode

  const simulate = () => {
    if (controller.signal.aborted) {
      return
    }

    // Occasionally simulate bursts (like when debug is enabled)
    const isBurst = Math.random() < burstProbability
    const entriesThisRound = isBurst ? Math.floor(Math.random() * 20) + 5 : 1

    for (let i = 0; i < entriesThisRound; i++) {
      const entry = {
        timestamp: new Date().toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        subsystem: subsystems[Math.floor(Math.random() * subsystems.length)],
        message: messages[Math.floor(Math.random() * messages.length)]
      }

      batchProcessor.addEntry(entry)
    }

    // Vary interval based on activity
    const nextInterval = isBurst
      ? 100 + Math.random() * 200 // Fast when bursting
      : baseInterval + Math.random() * 1000

    setTimeout(simulate, nextInterval)
  }

  // Start simulation
  setTimeout(simulate, 1000)
}

// Export both bundles
export { logSubsystemsBundle }
export default logsBundle

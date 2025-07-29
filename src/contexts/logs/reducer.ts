import { LogsState, LogsAction, LogRateState, LogBufferConfig } from './types'

/**
 * Default buffer configuration
 */
export const DEFAULT_BUFFER_CONFIG: LogBufferConfig = {
  memory: 10_000, // Keep last 10k entries in memory
  indexedDB: 200_000, // Store up to 200k entries in IndexedDB
  warnThreshold: 1_000,
  autoDisableThreshold: 6_000
}

/**
 * Default rate state
 */
export const DEFAULT_RATE_STATE: LogRateState = {
  currentRate: 0,
  recentCounts: [],
  lastCountTime: Date.now(),
  hasWarned: false,
  autoDisabled: false
}

/**
 * Initial empty state shell - will be populated by initLogsState
 */
const initialStateShell: Partial<LogsState> = {
  entries: [],
  isStreaming: false,
  globalLogLevel: 'info',
  streamController: null,
  hasMoreHistory: false,
  isLoadingHistory: false,
  storageStats: null,
  pendingBatch: [],
  batchTimeout: null,
  viewOffset: 0,
  subsystemLevels: {},
  actualLogLevels: {},
  isLoadingLevels: false,
  subsystems: [],
  isLoadingSubsystems: false
}

/**
 * Lazy initialization function to avoid recreating deep objects on every render
 */
export function initLogsState (): LogsState {
  return {
    ...initialStateShell,
    bufferConfig: { ...DEFAULT_BUFFER_CONFIG },
    rateState: { ...DEFAULT_RATE_STATE }
  } as LogsState
}

/**
 * Logs reducer with immutable state updates
 */
export function logsReducer (state: LogsState, action: LogsAction): LogsState {
  switch (action.type) {
    case 'SET_LEVEL': {
      if (action.subsystem === 'all') {
        return { ...state, globalLogLevel: action.level }
      }
      return {
        ...state,
        subsystemLevels: {
          ...state.subsystemLevels,
          [action.subsystem]: action.level
        }
      }
    }

    case 'START_STREAMING': {
      return {
        ...state,
        isStreaming: true,
        streamController: action.controller,
        viewOffset: 0,
        rateState: {
          ...state.rateState,
          autoDisabled: false
          // Don't reset hasWarned - let it persist across streaming sessions
        }
      }
    }

    case 'STOP_STREAMING': {
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

    case 'ADD_ENTRY': {
      return {
        ...state,
        pendingBatch: [...state.pendingBatch, action.entry]
      }
    }

    case 'ADD_BATCH': {
      const batchEntries = action.entries
      const memoryLimit = state.bufferConfig.memory

      // If user is viewing historical logs (offset > 0), don't update memory buffer
      // This prevents jarring "jumps" back to latest while browsing history
      if (state.viewOffset > 0) {
        return {
          ...state,
          pendingBatch: [],
          batchTimeout: null
        }
      }

      // User is at latest position, update memory buffer normally
      const newEntries = [...state.entries, ...batchEntries]
      const finalEntries = newEntries.slice(-memoryLimit)
      return {
        ...state,
        entries: finalEntries, // Keep only last N entries in memory
        pendingBatch: [],
        batchTimeout: null
      }
    }

    case 'CLEAR_ENTRIES': {
      return {
        ...state,
        entries: [],
        pendingBatch: [],
        hasMoreHistory: false,
        viewOffset: 0
      }
    }

    case 'UPDATE_BUFFER_CONFIG': {
      return {
        ...state,
        bufferConfig: { ...state.bufferConfig, ...action.config }
      }
    }

    case 'UPDATE_RATE_STATE': {
      return {
        ...state,
        rateState: { ...state.rateState, ...action.rateState }
      }
    }

    case 'LOAD_HISTORY': {
      const { logs: historicalEntries, maxEntries } = action
      // Sliding window: add to top, trim from bottom to maintain max size
      const newEntries = [...historicalEntries, ...state.entries]
      const trimmedEntries = newEntries.slice(0, maxEntries)

      // Update view offset to track position in timeline
      const newOffset = state.viewOffset + historicalEntries.length

      return {
        ...state,
        entries: trimmedEntries,
        isLoadingHistory: false,
        viewOffset: newOffset
      }
    }

    case 'SET_LOADING_HISTORY': {
      return {
        ...state,
        isLoadingHistory: action.loading
      }
    }

    case 'UPDATE_STORAGE_STATS': {
      return {
        ...state,
        storageStats: action.stats
      }
    }

    case 'SET_HAS_MORE_HISTORY': {
      return {
        ...state,
        hasMoreHistory: action.hasMore
      }
    }

    case 'LOAD_LATEST': {
      const { logs, hasMoreHistory } = action
      return {
        ...state,
        entries: logs,
        viewOffset: 0, // Reset to latest position
        hasMoreHistory
      }
    }

    case 'SHOW_WARNING': {
      return {
        ...state,
        rateState: {
          ...state.rateState,
          hasWarned: true
        }
      }
    }

    case 'AUTO_DISABLE': {
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

    case 'RESET_WARNING': {
      return {
        ...state,
        rateState: {
          ...state.rateState,
          hasWarned: false
        }
      }
    }

    case 'FETCH_LEVELS': {
      return {
        ...state,
        isLoadingLevels: true
      }
    }

    case 'UPDATE_LEVELS': {
      return {
        ...state,
        actualLogLevels: action.levels,
        isLoadingLevels: false
      }
    }

    case 'FETCH_SUBSYSTEMS': {
      return {
        ...state,
        isLoadingSubsystems: true
      }
    }

    case 'UPDATE_SUBSYSTEMS': {
      return {
        ...state,
        subsystems: action.subsystems,
        isLoadingSubsystems: false
      }
    }

    default:
      return state
  }
}

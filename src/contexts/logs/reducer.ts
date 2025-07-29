import { LogsState, LogsAction, LogRateState, LogBufferConfig } from './types'

/**
 * Default buffer configuration
 */
export const DEFAULT_BUFFER_CONFIG: LogBufferConfig = {
  memory: 1_000, // Keep last 1k entries in memory (react-virtualized will handle the rest)
  indexedDB: 200_000, // Store up to 200k entries in IndexedDB
  warnThreshold: 50,
  autoDisableThreshold: 1_000
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
  displayEntries: [],
  streamBuffer: [],
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
  isLoadingSubsystems: false,
  newLogsCount: 0
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

      if (state.viewOffset > 0) {
        // User is viewing historical logs - buffer new logs and send to IndexedDB
        const newStreamBuffer = [...state.streamBuffer, ...batchEntries]
        const sortedBuffer = newStreamBuffer.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )

        return {
          ...state,
          streamBuffer: sortedBuffer.slice(-memoryLimit), // Keep buffer size reasonable
          newLogsCount: state.newLogsCount + batchEntries.length,
          pendingBatch: [],
          batchTimeout: null
        }
      } else {
        // User is at latest position - update display directly
        const newDisplayEntries = [...state.displayEntries, ...batchEntries]
        const sortedEntries = newDisplayEntries.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        const finalEntries = sortedEntries.slice(-memoryLimit)

        return {
          ...state,
          displayEntries: finalEntries,
          pendingBatch: [],
          batchTimeout: null
        }
      }
    }

    case 'CLEAR_ENTRIES': {
      return {
        ...state,
        displayEntries: [],
        streamBuffer: [],
        pendingBatch: [],
        hasMoreHistory: false,
        viewOffset: 0,
        newLogsCount: 0
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
      const newEntries = [...historicalEntries, ...state.displayEntries]
      // Sort by timestamp to ensure chronological order
      const sortedEntries = newEntries.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      const trimmedEntries = sortedEntries.slice(0, maxEntries)

      // Update view offset to track position in timeline
      const newOffset = state.viewOffset + historicalEntries.length

      return {
        ...state,
        displayEntries: trimmedEntries,
        isLoadingHistory: false,
        viewOffset: newOffset
      }
    }

    case 'LOAD_RECENT': {
      const { logs: recentEntries, maxEntries, reachedLatest } = action
      // Add recent logs to the end of current entries
      const newEntries = [...state.displayEntries, ...recentEntries]
      // Sort by timestamp to ensure chronological order
      const sortedEntries = newEntries.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      const trimmedEntries = sortedEntries.slice(-maxEntries)

      // If we reached latest, reset view offset to 0
      const newOffset = reachedLatest ? 0 : Math.max(0, state.viewOffset - recentEntries.length)

      return {
        ...state,
        displayEntries: trimmedEntries,
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

    case 'SET_VIEW_OFFSET': {
      return {
        ...state,
        viewOffset: action.offset
      }
    }

    case 'LOAD_LATEST': {
      const { logs, hasMoreHistory } = action

      // Sort logs to ensure chronological order
      const sortedLogs = [...logs].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )

      // Merge with any buffered stream logs
      const allEntries = [...sortedLogs, ...state.streamBuffer]
      const finalSorted = allEntries.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      const trimmed = finalSorted.slice(-state.bufferConfig.memory)

      return {
        ...state,
        displayEntries: trimmed,
        streamBuffer: [], // Clear buffer since we've merged
        newLogsCount: 0, // Reset count
        viewOffset: 0, // Reset to latest position
        hasMoreHistory
      }
    }

    case 'MERGE_STREAM_BUFFER': {
      // Merge buffered stream logs into display when returning to latest view
      const allEntries = [...state.displayEntries, ...state.streamBuffer]
      const sortedEntries = allEntries.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      const trimmed = sortedEntries.slice(-state.bufferConfig.memory)

      return {
        ...state,
        displayEntries: trimmed,
        streamBuffer: [],
        newLogsCount: 0,
        viewOffset: 0
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

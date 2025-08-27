import type { LogEntry } from './api'
import type { LogStorageStats } from './log-storage'

/**
 * Log buffer configuration
 */
export interface LogBufferConfig {
  memory: number
  indexedDB: number
  warnThreshold: number
  autoDisableThreshold: number
}

/**
 * Log rate state for monitoring
 */
export interface LogRateState {
  currentRate: number
  recentCounts: Array<{ second: number; count: number }>
  lastCountTime: number
  hasWarned: boolean
  autoDisabled: boolean
}

/**
 * Logs state for the reducer
 */
export interface LogsState {
  entries: LogEntry[]
  isStreaming: boolean
  globalLogLevel: string
  bufferConfig: LogBufferConfig
  rateState: LogRateState
  storageStats: LogStorageStats | null
  pendingBatch: LogEntry[]
  batchTimeout: number | null
  subsystemLevels: Record<string, string>
  actualLogLevels: Record<string, string>
  isLoadingLevels: boolean
}

/**
 * Actions for the logs reducer
 */
export type LogsAction =
  | { type: 'SET_LEVEL'; subsystem: string; level: string }
  | { type: 'START_STREAMING' }
  | { type: 'STOP_STREAMING' }
  | { type: 'ADD_ENTRY'; entry: LogEntry }
  | { type: 'ADD_BATCH'; entries: LogEntry[] }
  | { type: 'CLEAR_ENTRIES' }
  | { type: 'UPDATE_BUFFER_CONFIG'; config: Partial<LogBufferConfig> }
  | { type: 'UPDATE_RATE_STATE'; rateState: Partial<LogRateState> }
  | { type: 'UPDATE_STORAGE_STATS'; stats: LogStorageStats }
  | { type: 'SHOW_WARNING' }
  | { type: 'AUTO_DISABLE' }
  | { type: 'RESET_WARNING' }
  | { type: 'FETCH_LEVELS' }
  | { type: 'UPDATE_LEVELS'; levels: Record<string, string> }

/**
 * Default buffer configuration
 */
export const DEFAULT_BUFFER_CONFIG: LogBufferConfig = {
  memory: 1_000, // Keep last 10k entries in memory
  indexedDB: 200_000, // Store up to 200k entries in IndexedDB
  warnThreshold: 50,
  autoDisableThreshold: 100
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
  storageStats: null,
  pendingBatch: [],
  batchTimeout: null,
  subsystemLevels: {},
  actualLogLevels: {},
  isLoadingLevels: false
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
      if (action.subsystem === '*') {
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
        rateState: {
          ...state.rateState,
          autoDisabled: false
          // Don't reset hasWarned - let it persist across streaming sessions
        }
      }
    }

    case 'STOP_STREAMING': {
      // Clear batch timeout
      if (state.batchTimeout) {
        clearTimeout(state.batchTimeout)
      }
      return {
        ...state,
        isStreaming: false,
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

      // Update memory buffer with new entries
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
        pendingBatch: []
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

    case 'UPDATE_STORAGE_STATS': {
      return {
        ...state,
        storageStats: action.stats
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
      return {
        ...state,
        isStreaming: false,
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

    default:
      return state
  }
}

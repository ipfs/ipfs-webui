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
  entries: Map<number, LogEntry>
  isStreaming: boolean
  bufferConfig: LogBufferConfig
  rateState: LogRateState
  storageStats: LogStorageStats | null
  batchTimeout: number | null
  subsystemLevels: Record<string, string>
  actualLogLevels: Record<string, string>
  isLoadingLevels: boolean
}

/**
 * Actions for the logs reducer
 */
export type LogsAction =
  | { type: 'START_STREAMING' }
  | { type: 'STOP_STREAMING' }
  /**
   * Be sure to only provide entries sorted by timestamp (oldest first), otherwise the resulting log entries will be out of order.
   */
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
  memory: 1_000, // Keep last 1k entries in memory and rendered in the UI
  indexedDB: 200_000, // Store up to 200k entries in IndexedDB
  warnThreshold: 100,
  autoDisableThreshold: 500
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
  entries: new Map(),
  isStreaming: false,
  storageStats: null,
  batchTimeout: null,
  subsystemLevels: {},
  actualLogLevels: {},
  isLoadingLevels: false
}

function trimMapToLastN<K, V> (m: Map<K, V>, n: number) {
  if (m.size <= n) return
  let toDrop = m.size - n
  const it = m.keys()
  while (toDrop-- > 0) {
    const { value, done } = it.next()
    if (done) break
    m.delete(value)
  }
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
        batchTimeout: null
      }
    }

    case 'ADD_BATCH': {
      const { entries: prevEntries, bufferConfig } = state
      const memoryLimit = bufferConfig.memory

      const entries = new Map(prevEntries)

      // Append only new ids, preserving batch order (expecting timestamp sorted entries)
      for (const e of action.entries) {
        const id = e.id!
        if (!entries.has(id)) {
          entries.set(id, e)
        }
      }

      // Keep only last N by arrival/time order (oldest are at the front)
      trimMapToLastN(entries, memoryLimit)

      return { ...state, entries, batchTimeout: null }
    }

    case 'CLEAR_ENTRIES': {
      return {
        ...state,
        entries: new Map()
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

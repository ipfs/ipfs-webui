/**
 * Log entry data structure
 */
export interface LogEntry {
  timestamp: string
  level: string
  subsystem: string
  message: string
  id?: string
}

/**
 * Log subsystem data structure
 */
export interface LogSubsystem {
  name: string
  level: string
}

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
 * Storage statistics - matches log-storage.ts interface
 */
export interface LogStorageStats {
  totalEntries: number
  estimatedSize: number
  oldestTimestamp?: string | null
  newestTimestamp?: string | null
}

/**
 * Logs context value
 */
export interface LogsContextValue {
  // Log entries and streaming
  entries: LogEntry[]
  isStreaming: boolean
  viewOffset: number

  // Log levels
  globalLogLevel: string
  subsystemLevels: Record<string, string>
  actualLogLevels: Record<string, string>
  isLoadingLevels: boolean

  // Subsystems
  subsystems: LogSubsystem[]
  isLoadingSubsystems: boolean

  // Configuration and monitoring
  bufferConfig: LogBufferConfig
  rateState: LogRateState
  storageStats: LogStorageStats | null

  // Computed values
  gologLevelString: string | null

  // Actions
  startStreaming: () => void
  stopStreaming: () => void
  clearEntries: () => void
  setLogLevel: (subsystem: string, level: string) => void
  updateBufferConfig: (config: Partial<LogBufferConfig>) => void
  goToLatestLogs: () => void
  fetchSubsystems: () => void
  fetchLogLevels: () => void
  updateStorageStats: () => void
  showWarning: () => void
}

/**
 * Logs state for the reducer
 */
export interface LogsState {
  entries: LogEntry[]
  isStreaming: boolean
  globalLogLevel: string
  streamController: AbortController | null
  bufferConfig: LogBufferConfig
  rateState: LogRateState
  storageStats: LogStorageStats | null
  pendingBatch: LogEntry[]
  batchTimeout: number | null
  viewOffset: number
  subsystemLevels: Record<string, string>
  actualLogLevels: Record<string, string>
  isLoadingLevels: boolean
  subsystems: LogSubsystem[]
  isLoadingSubsystems: boolean
}

/**
 * Actions for the logs reducer
 */
export type LogsAction =
  | { type: 'SET_LEVEL'; subsystem: string; level: string }
  | { type: 'START_STREAMING'; controller: AbortController }
  | { type: 'STOP_STREAMING' }
  | { type: 'ADD_ENTRY'; entry: LogEntry }
  | { type: 'ADD_BATCH'; entries: LogEntry[] }
  | { type: 'CLEAR_ENTRIES' }
  | { type: 'UPDATE_BUFFER_CONFIG'; config: Partial<LogBufferConfig> }
  | { type: 'UPDATE_RATE_STATE'; rateState: Partial<LogRateState> }
  | { type: 'UPDATE_STORAGE_STATS'; stats: LogStorageStats }
  | { type: 'LOAD_LATEST'; logs: LogEntry[] }
  | { type: 'SHOW_WARNING' }
  | { type: 'AUTO_DISABLE' }
  | { type: 'RESET_WARNING' }
  | { type: 'FETCH_LEVELS' }
  | { type: 'UPDATE_LEVELS'; levels: Record<string, string> }
  | { type: 'FETCH_SUBSYSTEMS' }
  | { type: 'UPDATE_SUBSYSTEMS'; subsystems: LogSubsystem[] }

/**
 * API Response types for type safety
 */
export interface LogLevelsResponse {
  levels: Record<string, string>
}

/**
 * Raw log entry from IPFS API (before parsing)
 */
export interface RawLogEntry {
  ts?: string
  timestamp?: string
  level?: string
  system?: string
  logger?: string
  msg?: string
  message?: string
}

/**
 * Batch processor interface
 */
export interface BatchProcessor {
  start: (controller: AbortController) => void
  addEntry: (entry: LogEntry) => void
}

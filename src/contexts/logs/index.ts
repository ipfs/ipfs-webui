// Export the context provider and hook
export { LogsProvider, useLogs } from './logs-context'

// Export utilities (optional, for advanced usage)
export { getLogLevels, parseLogEntry } from './api'
export { logsReducer, initLogsState } from './reducer'
export { useBatchProcessor } from './use-batch-processor'

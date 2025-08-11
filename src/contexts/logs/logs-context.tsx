import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react'
import { LogBufferConfig, LogsContextValue, LogsProviderProps } from './types'
import { logsReducer, initLogsState } from './reducer'
import { getLogLevels, parseLogEntry, fetchLogSubsystems } from './api'
import { useBatchProcessor } from './batch-processor'
import { logStorage } from '../../lib/log-storage'

/**
 * Logs context
 */
const LogsContext = createContext<LogsContextValue | undefined>(undefined)
LogsContext.displayName = 'LogsContext'

/**
 * Streamlined logs provider component with performance optimizations
 */
const LogsProviderImpl: React.FC<LogsProviderProps> = ({ children, ipfs, ipfsConnected = false }) => {
  // Use lazy initialization to avoid recreating deep objects on every render
  const [state, dispatch] = useReducer(logsReducer, undefined, initLogsState)

  // Use ref for mount status to avoid stale closures
  const isMounted = useRef(true)

  // Use the improved batch processor hook
  const batchProcessor = useBatchProcessor(
    useCallback((entries) => dispatch({ type: 'ADD_BATCH', entries }), []),
    state.bufferConfig,
    useCallback((currentRate: number, recentCounts: Array<{ second: number; count: number }>, stats?: any) => {
      dispatch({
        type: 'UPDATE_RATE_STATE',
        rateState: { currentRate, recentCounts }
      })

      // Update storage stats if provided
      if (stats) {
        dispatch({ type: 'UPDATE_STORAGE_STATS', stats })
      }
    }, []),
    useCallback(() => {
      dispatch({ type: 'AUTO_DISABLE' })
    }, [])
  )

  // Internal action implementations with proper error handling
  const fetchSubsystemsInternal = useCallback(async () => {
    if (!ipfsConnected || !ipfs) return

    try {
      dispatch({ type: 'FETCH_SUBSYSTEMS' })
      const subsystems = await fetchLogSubsystems(ipfs)
      dispatch({ type: 'UPDATE_SUBSYSTEMS', subsystems })
    } catch (error) {
      console.error('Failed to fetch log subsystems:', error)
      dispatch({ type: 'UPDATE_SUBSYSTEMS', subsystems: [] })
    }
  }, [ipfs, ipfsConnected])

  const fetchLogLevelsInternal = useCallback(async () => {
    if (!ipfsConnected || !ipfs) return

    try {
      dispatch({ type: 'FETCH_LEVELS' })
      const logLevels = await getLogLevels()
      dispatch({ type: 'UPDATE_LEVELS', levels: logLevels })
    } catch (error) {
      console.error('Failed to fetch log levels:', error)
      dispatch({ type: 'UPDATE_LEVELS', levels: {} })
    }
  }, [ipfs, ipfsConnected])

  const setLogLevel = useCallback(async (subsystem: string, level: string) => {
    if (!ipfsConnected || !ipfs) return

    try {
      await ipfs.log.level(subsystem, level)

      if (subsystem === 'all') {
        try {
          const response = await getLogLevels()
          dispatch({ type: 'UPDATE_LEVELS', levels: response })
        } catch (error) {
          console.warn('Failed to fetch updated log levels after global change:', error)
          const updatedLevels = {
            ...state.actualLogLevels,
            '*': level
          }
          dispatch({ type: 'UPDATE_LEVELS', levels: updatedLevels })
        }
      } else {
        const updatedLevels = {
          ...state.actualLogLevels,
          [subsystem]: level
        }
        dispatch({ type: 'UPDATE_LEVELS', levels: updatedLevels })
      }

      dispatch({ type: 'SET_LEVEL', subsystem, level })
    } catch (error) {
      console.error(`Failed to set log level for ${subsystem}:`, error)
      throw error
    }
  }, [ipfs, ipfsConnected, state.actualLogLevels])

  const startStreaming = useCallback(async () => {
    if (!ipfsConnected || !ipfs) {
      console.error('IPFS instance not available')
      return
    }

    const controller = new AbortController()
    dispatch({ type: 'START_STREAMING', controller })
    batchProcessor.start(controller)

    try {
      await logStorage.init()

      try {
        const recentLogs = await logStorage.getRecentLogs(state.bufferConfig.memory)
        if (recentLogs.length > 0) {
          dispatch({ type: 'ADD_BATCH', entries: recentLogs })
        }

        const stats = await logStorage.getStorageStats()
        dispatch({ type: 'UPDATE_STORAGE_STATS', stats })
      } catch (error) {
        console.warn('Failed to load recent logs from storage:', error)
      }

      const stream = ipfs.log.tail()

      if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
        const processStream = async () => {
          try {
            for await (const entry of stream) {
              if (controller.signal.aborted) break

              const logEntry = parseLogEntry(entry)
              if (logEntry) {
                batchProcessor.addEntry(logEntry)
              }
            }
          } catch (error) {
            if (!controller.signal.aborted) {
              console.error('Log streaming error:', error)
              dispatch({ type: 'STOP_STREAMING' })
            }
          }
        }
        processStream()
      } else if (stream && stream.getReader) {
        const reader = stream.getReader()
        const processChunks = async () => {
          try {
            while (true) {
              if (controller.signal.aborted) break

              const { done, value } = await reader.read()
              if (done) break

              const logEntry = parseLogEntry(value)
              if (logEntry) {
                batchProcessor.addEntry(logEntry)
              }
            }
          } catch (error) {
            if (!controller.signal.aborted) {
              console.error('Log streaming error:', error)
              dispatch({ type: 'STOP_STREAMING' })
            }
          } finally {
            if (reader) {
              reader.releaseLock()
            }
          }
        }
        processChunks()
      } else {
        throw new Error('Log streaming not supported')
      }
    } catch (error) {
      console.error('Failed to start log streaming:', error)
      dispatch({ type: 'STOP_STREAMING' })
    }
  }, [ipfs, ipfsConnected, state.bufferConfig, batchProcessor])

  const stopStreaming = useCallback(() => {
    dispatch({ type: 'STOP_STREAMING' })
  }, [])

  const clearEntries = useCallback(async () => {
    try {
      await logStorage.clearAllLogs()
    } catch (error) {
      console.warn('Failed to clear IndexedDB logs:', error)
    }
    dispatch({ type: 'CLEAR_ENTRIES' })
  }, [])

  const updateBufferConfig = useCallback((config: Partial<LogBufferConfig>) => {
    dispatch({ type: 'UPDATE_BUFFER_CONFIG', config })
    if (config.indexedDB != null) {
      logStorage.updateConfig({ maxEntries: config.indexedDB })
    }
  }, [])

  const goToLatestLogsInternal = useCallback(async () => {
    try {
      const latestLogs = await logStorage.getRecentLogs(state.bufferConfig.memory)
      const storageStats = await logStorage.getStorageStats()

      dispatch({
        type: 'LOAD_LATEST',
        logs: latestLogs
      })

      dispatch({ type: 'UPDATE_STORAGE_STATS', stats: storageStats })
    } catch (error) {
      console.error('Failed to load latest logs:', error)
    }
  }, [state.bufferConfig.memory])

  const updateStorageStatsInternal = useCallback(async () => {
    try {
      const stats = await logStorage.getStorageStats()
      dispatch({ type: 'UPDATE_STORAGE_STATS', stats })
    } catch (error) {
      console.error('Failed to update storage stats:', error)
    }
  }, [])

  const showWarning = useCallback(() => {
    dispatch({ type: 'SHOW_WARNING' })
  }, [])

  // Compute GOLOG_LOG_LEVEL equivalent string
  const gologLevelString = useMemo(() => {
    // Only calculate if log levels have been loaded
    if (state.isLoadingLevels || Object.keys(state.actualLogLevels).length === 0) {
      return null
    }

    // Use the actual effective global level, fallback to stored global level
    const effectiveGlobalLevel = state.actualLogLevels['*'] || state.globalLogLevel
    const parts = [effectiveGlobalLevel]

    // Add subsystems that differ from the effective global level
    state.subsystems.forEach(subsystem => {
      const subsystemLevel = state.actualLogLevels[subsystem.name] || state.subsystemLevels[subsystem.name] || subsystem.level || 'info'
      if (subsystemLevel !== effectiveGlobalLevel) {
        parts.push(`${subsystem.name}=${subsystemLevel}`)
      }
    })

    return parts.join(',')
  }, [state.isLoadingLevels, state.actualLogLevels, state.globalLogLevel, state.subsystems, state.subsystemLevels])

  // Mount/unmount and bootstrap effect
  useEffect(() => {
    // Update storage config with current buffer settings
    logStorage.updateConfig({ maxEntries: state.bufferConfig.indexedDB })
    console.log('Updated storage config to maxEntries:', state.bufferConfig.indexedDB)

    return () => {
      isMounted.current = false
    }
  }, [state.bufferConfig.indexedDB])

  // Initialize log storage and bootstrap data
  useEffect(() => {
    async function bootstrap () {
      if (!isMounted.current) return

      try {
        await logStorage.init()
      } catch (error) {
        console.warn('Failed to initialize log storage:', error)
      }

      if (!isMounted.current) return

      // Load initial data in parallel when IPFS is connected
      if (ipfsConnected && ipfs) {
        await Promise.allSettled([
          fetchSubsystemsInternal(),
          fetchLogLevelsInternal(),
          updateStorageStatsInternal(),
          goToLatestLogsInternal()
        ])
      }
    }

    bootstrap()

    return () => {
      dispatch({ type: 'STOP_STREAMING' })
    }
  }, [ipfsConnected, ipfs, fetchSubsystemsInternal, fetchLogLevelsInternal, updateStorageStatsInternal, goToLatestLogsInternal])

  // Group related actions for cleaner context value assembly
  const logActions = useMemo(() => ({
    startStreaming,
    stopStreaming,
    clearEntries,
    setLogLevel,
    updateBufferConfig,
    goToLatestLogs: goToLatestLogsInternal,
    fetchSubsystems: fetchSubsystemsInternal,
    fetchLogLevels: fetchLogLevelsInternal,
    updateStorageStats: updateStorageStatsInternal,
    showWarning
  }), [
    startStreaming,
    stopStreaming,
    clearEntries,
    setLogLevel,
    updateBufferConfig,
    goToLatestLogsInternal,
    fetchSubsystemsInternal,
    fetchLogLevelsInternal,
    updateStorageStatsInternal,
    showWarning
  ])

  // Combine state, computed values, and actions - React will optimize this automatically
  const contextValue: LogsContextValue = {
    ...state,
    ...logActions,
    gologLevelString
  }

  return (
    <LogsContext.Provider value={contextValue}>
      {children}
    </LogsContext.Provider>
  )
}

/**
 * Hook to consume the logs context
 */
export function useLogs (): LogsContextValue {
  const context = useContext(LogsContext)
  if (context === undefined) {
    throw new Error('useLogs must be used within a LogsProvider')
  }
  return context
}

/**
 * Logs provider component
 */
export const LogsProvider = LogsProviderImpl

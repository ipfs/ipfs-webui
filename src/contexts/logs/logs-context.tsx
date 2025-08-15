import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef, useState } from 'react'
import { logsReducer, initLogsState } from './reducer'
import { parseLogEntry, getLogLevels, setLogLevelsBatch as setLogLevelsBatchApi } from './api'
import { useBatchProcessor } from './use-batch-processor'
import { logStorage } from './log-storage'
import type { KuboRPCClient } from 'kubo-rpc-client'
import type { LogEntry } from './api'
import type { LogBufferConfig, LogRateState } from './reducer'
import type { LogStorageStats } from './log-storage'

interface LogsProviderProps {
  children: React.ReactNode
  ipfs?: KuboRPCClient
  ipfsConnected?: boolean
}

/**
 * Logs context value
 */
export interface LogsContextValue {
  // Log entries and streaming
  entries: LogEntry[]
  isStreaming: boolean

  // Log levels
  globalLogLevel: string
  subsystemLevels: Record<string, string>
  actualLogLevels: Record<string, string>
  isLoadingLevels: boolean
  /**
   * Kubo only adds support for getting log levels in version 0.37.0 and later.
   * @see https://github.com/ipfs/kubo/issues/10867
   */
  isLogLevelsSupported: boolean

  /**
   * Kubo only adds (useful) support for log tailing in version 0.36.0 and later.
   * @see https://github.com/ipfs/kubo/issues/10816
   */
  isLogTailSupported: boolean

  // Configuration and monitoring
  bufferConfig: LogBufferConfig
  rateState: LogRateState
  storageStats: LogStorageStats | null

  // Computed values
  gologLevelString: string | null
  subsystems: Array<{ name: string; level: string }>

  // Actions
  startStreaming: () => void
  stopStreaming: () => void
  clearEntries: () => void
  setLogLevelsBatch: (levels: Array<{ subsystem: string; level: string }>) => Promise<void>
  updateBufferConfig: (config: Partial<LogBufferConfig>) => void

  fetchLogLevels: () => void
  updateStorageStats: () => void
  showWarning: () => void
}

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
  const [bootstrapped, setBootstrapped] = useState(false)
  const [isLogLevelsSupported, setIsLogLevelsSupported] = useState(true)
  const [isLogTailSupported, setIsLogTailSupported] = useState(true)
  const streamControllerRef = useRef<AbortController | null>(null)

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
      const controller = streamControllerRef.current
      if (!controller) {
        throw new Error('Stream controller not found')
      }
      dispatch({ type: 'AUTO_DISABLE', controller })
    }, [])
  )

  const fetchLogLevelsInternal = useCallback(async () => {
    if (!ipfsConnected || !ipfs) return
    const controller = new AbortController()

    try {
      dispatch({ type: 'FETCH_LEVELS' })
      const logLevels = await getLogLevels(ipfs, controller.signal)
      dispatch({ type: 'UPDATE_LEVELS', levels: logLevels })
      setIsLogLevelsSupported(true)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('argument "level" is required')) {
          console.error('Failed to fetch log levels - unsupported Kubo version:', error)
          // setIsLogLevelsSupported(false)
          dispatch({ type: 'UPDATE_LEVELS', levels: {} })
          return
        }
      }
      console.error('Failed to fetch log levels:', error)
      dispatch({ type: 'UPDATE_LEVELS', levels: {} })
    }
    return () => {
      controller.abort()
    }
  }, [ipfs, ipfsConnected])

  const setLogLevelsBatch = useCallback(async (levels: Array<{ subsystem: string; level: string }>) => {
    if (!ipfsConnected || !ipfs) return
    if (!isLogLevelsSupported) {
      throw new Error('Log level management is not supported in this version of Kubo')
    }

    try {
      // Set all levels in batch and get the final state
      const finalLevels = await setLogLevelsBatchApi(ipfs, levels)

      // Update the state with the final levels
      dispatch({ type: 'UPDATE_LEVELS', levels: finalLevels })

      // Update individual subsystem levels in state
      levels.forEach(({ subsystem, level }) => {
        dispatch({ type: 'SET_LEVEL', subsystem, level })
      })
    } catch (error) {
      console.error('Failed to set log levels in batch:', error)
      throw error
    }
  }, [ipfs, ipfsConnected, isLogLevelsSupported])

  const processStream = useCallback(async (stream: AsyncIterable<any>) => {
    const controller = streamControllerRef.current
    if (!controller) {
      throw new Error('Stream controller not found')
    }

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
        dispatch({ type: 'STOP_STREAMING', controller })
      }
    }
  }, [batchProcessor, dispatch])

  const stopStreaming = useCallback(() => {
    const controller = streamControllerRef.current
    if (!controller) {
      throw new Error('Stream controller not found')
    }
    dispatch({ type: 'STOP_STREAMING', controller })
    batchProcessor.stop()
    streamControllerRef.current = null
  }, [batchProcessor, dispatch])

  const startStreaming = useCallback(async () => {
    if (!ipfsConnected || !ipfs) {
      console.error('IPFS instance not available')
      return
    }

    const controller = new AbortController()
    streamControllerRef.current = controller
    dispatch({ type: 'START_STREAMING' })
    batchProcessor.start(streamControllerRef)

    try {
      await logStorage.init()

      // Load recent logs from storage
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

      const stream = ipfs.log.tail({ signal: controller.signal })

      if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
        void processStream(stream)
      } else {
        throw new Error('Log streaming not supported')
      }
    } catch (error) {
      console.error('Failed to start log streaming:', error)
      stopStreaming()
    }
  }, [ipfsConnected, ipfs, batchProcessor, state.bufferConfig.memory, processStream, stopStreaming])

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

  const updateStorageStatsInternal = useCallback(async () => {
    try {
      const stats = await logStorage.getStorageStats()
      dispatch({ type: 'UPDATE_STORAGE_STATS', stats })
    } catch (error) {
      console.error('Failed to update storage stats:', error)
    }
  }, [])

  const loadExistingEntries = useCallback(async () => {
    try {
      await logStorage.init()
      const recentLogs = await logStorage.getRecentLogs(state.bufferConfig.memory)
      if (recentLogs.length > 0) {
        dispatch({ type: 'ADD_BATCH', entries: recentLogs })
      }
    } catch (error) {
      console.warn('Failed to load existing log entries:', error)
    }
  }, [state.bufferConfig.memory])

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
    const effectiveGlobalLevel = state.actualLogLevels['(default)'] || state.globalLogLevel
    const parts = [effectiveGlobalLevel]

    // Add subsystems that differ from the effective global level
    Object.entries(state.actualLogLevels).forEach(([subsystem, level]) => {
      if (subsystem !== '(default)' && level !== effectiveGlobalLevel) {
        parts.push(`${subsystem}=${level}`)
      }
    })

    return parts.join(',')
  }, [state.isLoadingLevels, state.actualLogLevels, state.globalLogLevel])

  // Compute subsystems list from actual log levels
  const subsystems = useMemo(() => {
    return Object.entries(state.actualLogLevels)
      .filter(([name]) => name !== '(default)')
      .map(([name, level]) => ({
        name,
        level: level || 'info'
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [state.actualLogLevels])

  // Mount/unmount and bootstrap effect
  useEffect(() => {
    // Update storage config with current buffer settings
    logStorage.updateConfig({ maxEntries: state.bufferConfig.indexedDB })
  }, [state.bufferConfig.indexedDB])

  // Cleanup effect - stops streaming on unmount
  useEffect(() => {
    isMounted.current = true
    return () => {
      stopStreaming()
      isMounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Initialize log storage and bootstrap data
  useEffect(() => {
    if (bootstrapped) return

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
          fetchLogLevelsInternal(),
          updateStorageStatsInternal(),
          loadExistingEntries()
        ]).then(() => {
          setBootstrapped(true)
        })
      }
    }

    bootstrap()
  }, [ipfsConnected, ipfs, fetchLogLevelsInternal, updateStorageStatsInternal, loadExistingEntries, bootstrapped])

  // Group related actions for cleaner context value assembly
  const logActions = useMemo(() => ({
    startStreaming,
    stopStreaming,
    clearEntries,
    setLogLevelsBatch,
    updateBufferConfig,
    fetchLogLevels: fetchLogLevelsInternal,
    updateStorageStats: updateStorageStatsInternal,
    loadExistingEntries,
    showWarning
  }), [
    startStreaming,
    stopStreaming,
    clearEntries,
    setLogLevelsBatch,
    updateBufferConfig,
    fetchLogLevelsInternal,
    updateStorageStatsInternal,
    loadExistingEntries,
    showWarning
  ])

  // Combine state, computed values, and actions - React will optimize this automatically
  const contextValue: LogsContextValue = {
    ...state,
    ...logActions,
    gologLevelString,
    subsystems,
    isLogLevelsSupported,
    isLogTailSupported
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

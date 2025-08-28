import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef, useState } from 'react'
import { logsReducer, initLogsState } from './reducer'
import { parseLogEntry, getLogLevels, setLogLevelsBatch as setLogLevelsBatchApi } from './api'
import { useBatchProcessor } from './use-batch-processor'
import { logStorage } from './log-storage'
import { useBridgeSelector } from '../../helpers/context-bridge'
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
  subsystemLevels: Record<string, string>
  actualLogLevels: Record<string, string>
  isLoadingLevels: boolean

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
export const LogsProvider: React.FC<LogsProviderProps> = ({ children }) => {
  // Use lazy initialization to avoid recreating deep objects on every render
  const [state, dispatch] = useReducer(logsReducer, undefined, initLogsState)
  const [bootstrapped, setBootstrapped] = useState(false)
  const streamControllerRef = useRef<AbortController | null>(null)
  const ipfs = useBridgeSelector('selectIpfs') as KuboRPCClient
  const ipfsConnected = useBridgeSelector('selectIpfsConnected') as boolean

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
      streamControllerRef.current?.abort()
      dispatch({ type: 'AUTO_DISABLE' })
    }, [])
  )

  const fetchLogLevelsInternal = useCallback(async () => {
    if (!ipfsConnected || !ipfs) return
    const controller = new AbortController()

    try {
      dispatch({ type: 'FETCH_LEVELS' })
      const logLevels = await getLogLevels(ipfs, controller.signal)
      dispatch({ type: 'UPDATE_LEVELS', levels: logLevels })
    } catch (error: unknown) {
      console.error('Failed to fetch log levels:', error)
      dispatch({ type: 'UPDATE_LEVELS', levels: {} })
    }
    return () => {
      controller.abort()
    }
  }, [ipfs, ipfsConnected])

  const setLogLevelsBatch = useCallback(async (levels: Array<{ subsystem: string; level: string }>) => {
    if (!ipfsConnected || !ipfs) return

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
  }, [ipfs, ipfsConnected])

  const processStream = useCallback(async (stream: AsyncIterable<any>) => {
    try {
      for await (const entry of stream) {
        if (streamControllerRef.current?.signal.aborted) break
        const logEntry = parseLogEntry(entry)
        if (logEntry) {
          batchProcessor.addEntry(logEntry)
        }
      }
    } catch (error) {
      if (!streamControllerRef.current?.signal.aborted) {
        console.error('Log streaming error:', error)
        streamControllerRef.current?.abort()
        dispatch({ type: 'STOP_STREAMING' })
      }
    }
  }, [batchProcessor, dispatch])

  const stopStreaming = useCallback(() => {
    streamControllerRef.current?.abort()
    dispatch({ type: 'STOP_STREAMING' })
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
    const effectiveGlobalLevel = state.actualLogLevels['(default)']
    const parts = [effectiveGlobalLevel]

    // Add subsystems that differ from the effective global level
    Object.entries(state.actualLogLevels).forEach(([subsystem, level]) => {
      if (subsystem !== '(default)' && level !== effectiveGlobalLevel) {
        parts.push(`${subsystem}=${level}`)
      }
    })

    return parts.join(',')
  }, [state.isLoadingLevels, state.actualLogLevels])

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

  // Ensure we have safe defaults for arrays
  const safeLogEntries = useMemo(() => Array.isArray(state.entries) ? state.entries : [], [state.entries])

  // Combine state, computed values, and actions - React will optimize this automatically
  const contextValue: LogsContextValue = {
    ...state,
    ...logActions,
    entries: safeLogEntries,
    gologLevelString,
    subsystems
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

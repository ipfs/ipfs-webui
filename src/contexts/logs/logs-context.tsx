import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef, useState } from 'react'
import { logsReducer, initLogsState } from './reducer'
import { parseLogEntry, getLogLevels, setLogLevelsBatch as setLogLevelsBatchApi } from './api'
import { useBatchProcessor } from './use-batch-processor'
import { logStorage } from './log-storage'
import { useBridgeSelector } from '../../helpers/context-bridge'
import { calculateGologLevelString } from '../../lib/golog-level-utils'
import type { KuboRPCClient } from 'kubo-rpc-client'
import type { LogEntry } from './api'
import type { LogBufferConfig, LogRateState } from './reducer'
import type { LogStorageStats } from './log-storage'
import { useAgentVersionMinimum } from '../../lib/hooks/use-agent-version-minimum'

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
  isAgentVersionSupported: boolean

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

  /**
   * Kubo only adds support for getting log levels in version 0.37.0 and later.
   *
   * Kubo fixed log tailing in version 0.36.0 and later.
   * @see https://github.com/ipfs/kubo/issues/10867
   */
  const { ok: isAgentVersionSupported } = useAgentVersionMinimum({
    minimumVersion: '0.37.0',
    requiredAgent: 'kubo'
  })

  // Use ref for mount status to avoid stale closures
  const isMounted = useRef(true)
  const addBatch = useCallback(async (entryCount: number) => {
    // we always pull from storage to ensure we have the properly set logEntry with id
    const entries = await logStorage.getRecentLogs(entryCount)
    dispatch({ type: 'ADD_BATCH', entries })
  }, [dispatch])
  const onRateUpdate = useCallback((currentRate: number, recentCounts: Array<{ second: number; count: number }>, stats?: any) => {
    dispatch({
      type: 'UPDATE_RATE_STATE',
      rateState: { currentRate, recentCounts }
    })

    // Update storage stats if provided
    if (stats != null) {
      dispatch({ type: 'UPDATE_STORAGE_STATS', stats })
    }
  }, [])
  const onAutoDisable = useCallback(() => {
    dispatch({ type: 'AUTO_DISABLE' })
    streamControllerRef.current?.abort()
  }, [])

  // Use the improved batch processor hook
  const batchProcessor = useBatchProcessor(
    addBatch,
    state.bufferConfig,
    logStorage,
    onRateUpdate,
    onAutoDisable
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

      // Update the state with the final levels from the API response
      dispatch({ type: 'UPDATE_LEVELS', levels: finalLevels })
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
    dispatch({ type: 'STOP_STREAMING' })
    streamControllerRef.current?.abort()
    batchProcessor.stop()
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

    return calculateGologLevelString(state.actualLogLevels)
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
    if (bootstrapped || !isAgentVersionSupported) return

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
  }, [ipfsConnected, ipfs, fetchLogLevelsInternal, updateStorageStatsInternal, loadExistingEntries, bootstrapped, isAgentVersionSupported])

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
  const safeLogEntries = useMemo(() => Array.from(state.entries.values()), [state.entries])

  // Combine state, computed values, and actions - React will optimize this automatically
  const contextValue: LogsContextValue = {
    ...state,
    ...logActions,
    entries: safeLogEntries,
    gologLevelString,
    subsystems,
    isAgentVersionSupported
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

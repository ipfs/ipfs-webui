import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef, useState } from 'react'
import { LogBufferConfig, LogsContextValue, LogsProviderProps } from './types'
import { logsReducer, initLogsState } from './reducer'
import { getLogLevels, parseLogEntry, fetchLogSubsystems } from './api'
import { useBatchProcessor } from './batch-processor'
import { logStorage } from '../../lib/log-storage'
import { BufferedCursor } from 'buffered-cursor'
import { FetchOptions, timestampStrategy } from 'buffered-cursor/strategies'
import type { LogEntry } from '../../lib/log-storage'

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

  // Buffered cursor for efficient log loading
  const [cursor, setCursor] = useState<BufferedCursor<any, Date> | null>(null)
  const [displayEntries, setDisplayEntries] = useState<LogEntry[]>([])

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

        if (stats.totalEntries > recentLogs.length) {
          dispatch({ type: 'SET_HAS_MORE_HISTORY', hasMore: true })
        }
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

  const loadHistoricalLogs = useCallback(async (beforeTimestamp?: string, limit = 100) => {
    dispatch({ type: 'SET_LOADING_HISTORY', loading: true })

    try {
      // If no timestamp provided, use the oldest timestamp from current entries
      const timestamp = beforeTimestamp || (state.displayEntries.length > 0 ? state.displayEntries[0].timestamp : new Date().toISOString())
      const historicalLogs = await logStorage.getLogsBefore(timestamp, limit)
      dispatch({
        type: 'LOAD_HISTORY',
        logs: historicalLogs,
        maxEntries: state.bufferConfig.memory
      })

      const hasMoreHistory = historicalLogs.length === limit
      dispatch({ type: 'SET_HAS_MORE_HISTORY', hasMore: hasMoreHistory })
    } catch (error) {
      console.error('Failed to load historical logs:', error)
      dispatch({ type: 'SET_LOADING_HISTORY', loading: false })
    }
  }, [state.bufferConfig.memory])

  const loadRecentLogs = useCallback(async (afterTimestamp: string, limit = 100) => {
    console.log('loadRecentLogs called with:', { afterTimestamp, limit })
    dispatch({ type: 'SET_LOADING_HISTORY', loading: true })

    try {
      const recentLogs = await logStorage.getLogsAfter(afterTimestamp, limit)
      console.log('loadRecentLogs got:', recentLogs.length, 'logs')

      if (recentLogs.length > 0) {
        // Check if there are more logs available after the ones we just loaded
        // by trying to get one more log after the last one we received
        const lastLog = recentLogs[recentLogs.length - 1]
        const moreLogsAfter = await logStorage.getLogsAfter(lastLog.timestamp, 1)
        const reachedLatest = moreLogsAfter.length === 0

        console.log('loadRecentLogs dispatching LOAD_RECENT with reachedLatest:', reachedLatest, 'logs:', recentLogs.length, 'lastTimestamp:', lastLog.timestamp, 'moreLogsAfter:', moreLogsAfter.length)

        dispatch({
          type: 'LOAD_RECENT',
          logs: recentLogs,
          maxEntries: state.bufferConfig.memory,
          reachedLatest
        })
      } else {
        // No more recent logs, we're at the latest
        console.log('loadRecentLogs: no more recent logs, setting viewOffset to 0')
        dispatch({ type: 'SET_VIEW_OFFSET', offset: 0 })
      }
    } catch (error) {
      console.error('Failed to load recent logs:', error)
    } finally {
      dispatch({ type: 'SET_LOADING_HISTORY', loading: false })
    }
  }, [state.bufferConfig.memory])

  const goToLatestLogsInternal = useCallback(async () => {
    try {
      const latestLogs = await logStorage.getRecentLogs(state.bufferConfig.memory)
      const storageStats = await logStorage.getStorageStats()

      const hasMoreHistory = storageStats.totalEntries > latestLogs.length

      dispatch({
        type: 'LOAD_LATEST',
        logs: latestLogs,
        hasMoreHistory
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

  const mergeStreamBuffer = useCallback(() => {
    dispatch({ type: 'MERGE_STREAM_BUFFER' })
  }, [])

  const setViewOffset = useCallback((offset: number) => {
    dispatch({ type: 'SET_VIEW_OFFSET', offset })
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

  // Initialize buffered cursor
  useEffect(() => {
    async function initializeCursor () {
      try {
        await logStorage.init()

        const cur = new BufferedCursor<LogEntry, Date>({
          strategy: timestampStrategy<LogEntry>(async (key: Date | null, opts: FetchOptions<Date>) => {
            // if (key === null) {
            //   const recentLogs = await logStorage.getRecentLogs(opts.limit)
            //   return recentLogs.map(r => ({ ts: new Date(r.timestamp), value: r }))
            // }
            console.log('timestampStrategy called with:', { key, opts })
            const timestamp = key?.toISOString() ?? new Date().toISOString()
            let rows: LogEntry[]
            if (opts.direction === 'before') {
              rows = await logStorage.getLogsBefore(timestamp, opts.limit)
            } else {
              rows = await logStorage.getLogsAfter(timestamp, opts.limit)
            }
            const cursorItems = rows.reverse().map(r => ({ ts: new Date(r.timestamp), value: r }))

            // dispatch({ type: 'LOAD_HISTORY', logs: rows, maxEntries: state.bufferConfig.memory })
            return cursorItems
          }),
          pageSize: Math.floor(state.bufferConfig.memory / 2),
          retentionPages: 2
        })

        // bootstrap will call fetch(null, after) → fill initial window
        console.log('bootstrapping cursor with direction:', 'before')
        await cur.bootstrap('before')
        console.log('cursor toArray:', cur.toArray())
        setDisplayEntries(cur.toArray().map(e => e.value))
        setCursor(cur)
      } catch (error) {
        console.error('Failed to initialize cursor:', error)
      }
    }

    initializeCursor()
  }, [state.bufferConfig.memory])

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

      // Always load logs from storage, even if IPFS is not connected
      await Promise.allSettled([
        updateStorageStatsInternal(),
        goToLatestLogsInternal()
      ])

      // Load IPFS-specific data only when connected
      if (ipfsConnected && ipfs) {
        await Promise.allSettled([
          fetchSubsystemsInternal(),
          fetchLogLevelsInternal()
        ])
      }
    }

    bootstrap()

    return () => {
      dispatch({ type: 'STOP_STREAMING' })
    }
  }, [ipfsConnected, ipfs, fetchSubsystemsInternal, fetchLogLevelsInternal, updateStorageStatsInternal, goToLatestLogsInternal])

  // Provide a memoized actions object to prevent unnecessary re-renders
  const logActions = useMemo(() => ({
    startStreaming,
    stopStreaming,
    clearEntries,
    setLogLevel,
    updateBufferConfig,
    loadHistoricalLogs,
    loadRecentLogs,
    goToLatestLogs: goToLatestLogsInternal,
    fetchSubsystems: fetchSubsystemsInternal,
    fetchLogLevels: fetchLogLevelsInternal,
    updateStorageStats: updateStorageStatsInternal,
    showWarning,
    mergeStreamBuffer,
    setViewOffset
  }), [
    startStreaming,
    stopStreaming,
    clearEntries,
    setLogLevel,
    updateBufferConfig,
    loadHistoricalLogs,
    loadRecentLogs,
    goToLatestLogsInternal,
    fetchSubsystemsInternal,
    fetchLogLevelsInternal,
    updateStorageStatsInternal,
    showWarning,
    mergeStreamBuffer,
    setViewOffset
  ])

  const updateDisplayEntries = useCallback(() => {
    if (cursor != null) {
      setDisplayEntries(cursor.toArray().map(e => e.value))
    }
  }, [cursor])

  // Combine state, computed values, and actions - React will optimize this automatically
  const contextValue: LogsContextValue = {
    ...state,
    ...logActions,
    gologLevelString,
    cursor,
    displayEntries,
    updateDisplayEntries
    // displayEntries: cursor?.toArray().sort((a, b) => a.key.getTime() - b.key.getTime()).map(e => e.value) ?? []
  }

  useEffect(() => {
    console.log('displayEntries changed:', displayEntries)
  }, [displayEntries])

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

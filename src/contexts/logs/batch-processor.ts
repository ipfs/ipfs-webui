import { useRef, useCallback } from 'react'
import { LogEntry, LogBufferConfig, LogsAction, BatchProcessor } from './types'
import { logStorage } from '../../lib/log-storage'
import type React from 'react'

/**
 * Custom hook for batch processing logs with rate monitoring
 * Uses refs to maintain mutable state without recreating on every render
 */
export function useBatchProcessor (
  dispatch: React.Dispatch<LogsAction>,
  controller: AbortController | null,
  bufferConfig: LogBufferConfig
): BatchProcessor | null {
  // Use refs to hold mutable state that doesn't trigger re-renders
  const pendingEntriesRef = useRef<LogEntry[]>([])
  const lastBatchTimeRef = useRef(Date.now())
  const entryCountsRef = useRef<Array<{ second: number; count: number }>>([])
  const batchTimeoutRef = useRef<number | null>(null)
  const hasWarnedRef = useRef(false)
  const autoDisabledRef = useRef(false)

  const processBatch = useCallback(async () => {
    if (pendingEntriesRef.current.length === 0) return

    const entries = [...pendingEntriesRef.current]
    pendingEntriesRef.current = []
    batchTimeoutRef.current = null

    // Update rate monitoring
    const now = Date.now()
    const currentSecond = Math.floor(now / 1000)

    // Clean old counts (keep last 5 seconds for rate calculation)
    entryCountsRef.current = entryCountsRef.current.filter(
      ({ second }) => currentSecond - second < 5
    )

    // Add current batch count
    const existingCount = entryCountsRef.current.find(
      ({ second }) => second === currentSecond
    )
    if (existingCount) {
      existingCount.count += entries.length
    } else {
      entryCountsRef.current.push({ second: currentSecond, count: entries.length })
    }

    // Calculate current rate (entries per second over last 5 seconds)
    const totalEntries = entryCountsRef.current.reduce((sum, { count }) => sum + count, 0)
    const currentRate = totalEntries / Math.max(entryCountsRef.current.length, 1)

    // Update rate state
    dispatch({
      type: 'UPDATE_RATE_STATE',
      rateState: { currentRate, recentCounts: [...entryCountsRef.current] }
    })

    // Check for warnings and auto-disable
    if (currentRate > bufferConfig.autoDisableThreshold && !autoDisabledRef.current) {
      console.warn(`Log rate too high (${currentRate.toFixed(1)}/s), auto-disabling streaming`)
      autoDisabledRef.current = true
      dispatch({ type: 'AUTO_DISABLE' })
      return
    }

    if (currentRate > bufferConfig.warnThreshold && !hasWarnedRef.current && !autoDisabledRef.current) {
      console.warn(`High log rate detected: ${currentRate.toFixed(1)} logs/second`)
      hasWarnedRef.current = true
      dispatch({ type: 'SHOW_WARNING' })
    }

    // Store in IndexedDB (async, don't wait)
    try {
      logStorage.appendLogs(entries)
        .then(async () => {
          try {
            const updatedStats = await logStorage.getStorageStats()
            dispatch({ type: 'UPDATE_STORAGE_STATS', stats: updatedStats })
          } catch (error) {
            console.warn('Failed to update storage stats:', error)
          }
        })
        .catch(error => {
          console.warn('Failed to store logs in IndexedDB:', error)
        })
    } catch (error) {
      console.warn('Failed to store logs in IndexedDB:', error)
    }

    // Add to memory buffer
    dispatch({ type: 'ADD_BATCH', entries })
    lastBatchTimeRef.current = now
  }, [dispatch, bufferConfig])

  const addEntry = useCallback((entry: LogEntry) => {
    if (!controller || controller.signal.aborted) return

    pendingEntriesRef.current.push(entry)

    // Process batch if we have enough entries or enough time has passed
    const shouldProcess =
      pendingEntriesRef.current.length >= 50 || // Batch size threshold
      (Date.now() - lastBatchTimeRef.current) >= 500 // Time threshold (500ms)

    if (shouldProcess && !batchTimeoutRef.current) {
      batchTimeoutRef.current = window.setTimeout(processBatch, 100) // Small delay to collect a few more entries
    } else if (!batchTimeoutRef.current) {
      // Set a fallback timeout to ensure batches are processed even with low rates
      batchTimeoutRef.current = window.setTimeout(processBatch, 1000)
    }
  }, [controller, processBatch])

  // Set up cleanup when controller changes or component unmounts
  useCallback(() => {
    if (!controller) return

    const cleanup = () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
        batchTimeoutRef.current = null
      }
      // Process any remaining entries after current Redux cycle completes
      if (pendingEntriesRef.current.length > 0) {
        setTimeout(processBatch, 10) // Small delay to ensure we're outside the reducer
      }
    }

    controller.signal.onabort = cleanup

    return cleanup
  }, [controller, processBatch])()

  // Reset refs when starting new stream
  if (controller && !autoDisabledRef.current) {
    hasWarnedRef.current = false
    autoDisabledRef.current = false
  }

  // Only return processor if we have a valid controller
  if (!controller) return null

  return { addEntry }
}

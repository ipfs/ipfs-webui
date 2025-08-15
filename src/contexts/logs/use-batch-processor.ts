import { useRef, useCallback, useEffect } from 'react'
import { logStorage } from './log-storage'
import type { LogEntry } from './api'
import type { LogBufferConfig } from './reducer'
import type { MutableRefObject } from 'react'

/**
 * Batch processor interface
 */
export interface BatchProcessor {
  start: (controller: MutableRefObject<AbortController | null>) => void
  stop: () => void
  addEntry: (entry: LogEntry) => void
}

/**
 * Custom hook for batch processing logs with rate monitoring
 * Uses refs to maintain mutable state without recreating on every render
 */
export function useBatchProcessor (
  onBatch: (entries: LogEntry[]) => void,
  bufferConfig: LogBufferConfig,
  onRateUpdate?: (rate: number, counts: Array<{ second: number; count: number }>, stats?: any) => void,
  onAutoDisable?: () => void
): BatchProcessor {
  // Use refs to hold mutable state that doesn't trigger re-renders
  const controllerRef = useRef<AbortController | null>(null)
  const pendingEntriesRef = useRef<LogEntry[]>([])
  const lastBatchTimeRef = useRef(Date.now())
  const entryCountsRef = useRef<Array<{ second: number; count: number }>>([])
  const batchTimeoutRef = useRef<number | null>(null)
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

    // Update rate state via callback
    if (onRateUpdate) {
      onRateUpdate(currentRate, [...entryCountsRef.current])
    }

    // Check for warnings and auto-disable
    if (currentRate > bufferConfig.autoDisableThreshold && !autoDisabledRef.current) {
      console.warn(`Log rate too high (${currentRate.toFixed(1)}/s), auto-disabling streaming`)
      autoDisabledRef.current = true
      if (onAutoDisable) {
        onAutoDisable()
      }
    }

    // Note: Warning state is managed by the context, not here
    // The context will check the rate and show warnings appropriately

    // Store in IndexedDB (async, don't wait) - append new entries and remove old ones if needed
    try {
      // Always append new entries - the storage layer will handle circular buffer behavior
      await logStorage.appendLogs(entries)

      // Update storage stats after adding entries
      try {
        const updatedStats = await logStorage.getStorageStats()
        if (onRateUpdate) {
          // Pass updated stats via the rate update callback
          onRateUpdate(currentRate, [...entryCountsRef.current], updatedStats)
        }
      } catch (error) {
        console.warn('Failed to update storage stats:', error)
      }
    } catch (error) {
      console.warn('Failed to store logs in IndexedDB:', error)
    }

    // Call the batch callback
    onBatch(entries)
    lastBatchTimeRef.current = now
  }, [onBatch, bufferConfig, onRateUpdate, onAutoDisable])

  const start = useCallback((controller: MutableRefObject<AbortController | null>) => {
    controllerRef.current = controller.current
    // Reset rate counters when starting
    autoDisabledRef.current = false
    entryCountsRef.current = []
    lastBatchTimeRef.current = Date.now()
  }, [])

  const stop = useCallback(() => {
    // Clear any pending timeout
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current)
      batchTimeoutRef.current = null
    }

    controllerRef.current?.abort()

    // Clear the controller reference
    controllerRef.current = null

    // Process any remaining entries before stopping
    if (pendingEntriesRef.current.length > 0) {
      setTimeout(processBatch, 10)
    }
  }, [processBatch])

  const addEntry = useCallback((entry: LogEntry) => {
    if (!controllerRef.current || controllerRef.current.signal.aborted) return

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
  }, [processBatch])

  // Set up cleanup when controller changes
  useEffect(() => {
    const controller = controllerRef.current
    if (!controller) return

    const cleanup = () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
        batchTimeoutRef.current = null
      }
    }

    controller.signal.onabort = cleanup
    return cleanup
  }, [])

  return { start, stop, addEntry }
}

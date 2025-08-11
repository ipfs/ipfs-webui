import { useCallback, useMemo } from 'react'
import { useLogs } from '../contexts/logs'

export interface VirtualLogsConfig {
  overscanCount?: number
  batchSize?: number
  threshold?: number
}

export function useVirtualLogs ({
  overscanCount = 5,
  batchSize = 500,
  threshold = 200
}: VirtualLogsConfig = {}) {
  const {
    displayEntries,
    viewOffset,
    hasMoreHistory,
    isLoadingHistory,
    loadHistoricalLogs,
    loadRecentLogs
  } = useLogs()

  // Use displayEntries as the primary source
  const actualEntries = displayEntries

  // Row count is simply the number of entries
  const rowCount = useMemo(() => {
    return actualEntries.length
  }, [actualEntries.length])

  // All rows are loaded since we don't use sentinels
  const isRowLoaded = useCallback(
    ({ index }: { index: number }) => {
      return index < actualEntries.length
    },
    [actualEntries.length]
  )

  // Load more rows when scrolling near edges
  const loadMoreRows = useCallback(
    async ({ startIndex, stopIndex }: { startIndex: number; stopIndex: number }) => {
      // Loading older logs when scrolling near top
      if (hasMoreHistory && startIndex < threshold && !isLoadingHistory) {
        const oldest = actualEntries[0]
        if (oldest?.timestamp) {
          await loadHistoricalLogs(oldest.timestamp, batchSize)
        }
      }

      // Loading newer logs when scrolling near bottom (when viewing history)
      if (viewOffset > 0 && stopIndex > actualEntries.length - threshold && !isLoadingHistory) {
        const newest = actualEntries[actualEntries.length - 1]
        if (newest?.timestamp) {
          await loadRecentLogs(newest.timestamp, batchSize)
        }
      }
    },
    [actualEntries, hasMoreHistory, viewOffset, isLoadingHistory, loadHistoricalLogs, loadRecentLogs, batchSize, threshold]
  )

  // Get the actual entry for a given row index
  const getEntryAtIndex = useCallback(
    (index: number) => {
      return actualEntries[index]
    },
    [actualEntries]
  )

  return {
    rowCount,
    isRowLoaded,
    loadMoreRows,
    getEntryAtIndex,
    entries: actualEntries, // Keep for react-virtualized compatibility
    overscanCount,
    batchSize,
    threshold,
    hasMoreHistory,
    viewOffset,
    isLoadingHistory
  }
}

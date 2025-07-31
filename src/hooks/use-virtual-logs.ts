import { useCallback, useEffect, useState } from 'react'
import { logStorage } from 'src/lib/log-storage'
import { useLogs } from '../contexts/logs'

export interface VirtualLogsConfig {
  overscanCount?: number
  batchSize?: number
  threshold?: number
}

export function useVirtualLogs ({
  overscanCount = 5,
  batchSize = 100,
  threshold = 50
}: VirtualLogsConfig = {}) {
  const {
    displayEntries,
    viewOffset,
    hasMoreHistory,
    isLoadingHistory,
    // loadHistoricalLogs,
    // loadRecentLogs,
    updateDisplayEntries,
    cursor
    // setViewOffset
  } = useLogs()

  const [rowCount, setRowCount] = useState<number>(0)

  const lastUpdateTime = logStorage.lastUpdateTime()

  useEffect(() => {
    async function updateRowCount () {
      const size = await logStorage.size()
      setRowCount(size)
      console.log('rowCount updated:', size)
    }
    updateRowCount()
  }, [lastUpdateTime, displayEntries.length])

  // useEffect(() => {
  //   console.log('viewOffset(VIEW_OFFSET) changed:', viewOffset)
  // }, [viewOffset])

  // const [displayEntries, setDisplayEntries] = useState<LogEntry[]>(displayEntriesFromContext)

  // const displayEntriesRef = useRef<LogEntry[]>([])

  // // Use cursor if available, otherwise fall back to displayEntries
  // const actualEntries = useMemo(() => {
  //   if (cursor) {
  //     return cursor.toArray().map(e => e.value)
  //   }
  //   return []
  //   // return displayEntries
  // }, [cursor?.toArray])
  // const isAtEnd = useMemo(() => {

  // Row count is the total number of entries in the logStorage
  // const logStorageSize = logStorage.size()
  // const rowCount = useMemo(async () => await logStorageSize, [logStorageSize])
  // const rowCount = useMemo(() => {
  //   if (cursor) {
  //     return cursor.isAtEnd() ? displayEntries.length : displayEntries.length + 1
  //   }
  //   return displayEntries.length
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [cursor?.isAtEnd(), displayEntries.length])

  // Check if a row is loaded - mark top rows as unloaded when there's more history
  const isRowLoaded = useCallback(({ index }: Record<string, any> & { index: number }) => {
    console.log('isRowLoaded called:', { index, threshold })
    if (index < threshold && !cursor?.isAtStart()) {
      return false
    }
    if (index > displayEntries.length - threshold && !cursor?.isAtEnd()) {
      return false
    }
    return index < displayEntries.length
  }, [cursor, displayEntries, threshold])

  // Load more rows when scrolling near edges
  const loadMoreRows = useCallback(async ({ startIndex, stopIndex, ...rest }: Record<string, any> & { startIndex: number; stopIndex: number }) => {
    console.log('loadMoreRows called:', { startIndex, stopIndex, hasMoreHistory, isLoadingHistory, viewOffset, threshold, rest })
    console.log('VIEW_OFFSET rest:', rest)

    if (cursor != null) {
      let firstItem = cursor?.toArray()[0]
      let lastItem = cursor?.toArray()[cursor?.toArray().length - 1]
      console.log('first cursor item before load:', firstItem?.value)
      console.log('last cursor item before load:', lastItem?.value)
      // Use buffered cursor for loading
      if (startIndex < threshold && !cursor?.isAtStart()) {
        console.log('Loading historical logs with cursor...')
        await cursor?.loadBefore()
        updateDisplayEntries()
        firstItem = cursor?.toArray()[0]
        // setViewOffset(viewOffset)
      } else if (stopIndex > displayEntries.length - threshold && !cursor?.isAtEnd()) {
        console.log('Loading recent logs with cursor...')
        await cursor?.loadAfter()
        lastItem = cursor?.toArray()[cursor?.toArray().length - 1]
        updateDisplayEntries()
      }
      console.log('first cursor item after load:', firstItem?.value)
      console.log('last cursor item after load:', lastItem?.value)
    }
  }, [hasMoreHistory, isLoadingHistory, viewOffset, threshold, cursor, displayEntries.length, updateDisplayEntries])

  // Get the actual entry for a given row index
  const getEntryAtIndex = useCallback((index: number) => {
    return displayEntries[index]
  }, [displayEntries])

  return {
    rowCount,
    isRowLoaded,
    loadMoreRows,
    getEntryAtIndex,
    displayEntries,
    // displayEntriesRef,
    overscanCount,
    batchSize,
    threshold,
    hasMoreHistory,
    viewOffset,
    isLoadingHistory
  }
}

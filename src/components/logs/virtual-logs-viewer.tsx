import React, { useCallback, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { InfiniteLoader, AutoSizer, List, CellMeasurer, CellMeasurerCache } from 'react-virtualized'
import { useVirtualLogs } from '../../hooks/use-virtual-logs'
import LogRow from './log-row'

interface VirtualLogsViewerProps {
  height?: number
  formatTimestamp: (timestamp: string) => string
  getLevelColor: (level: string) => string
  autoScrollEnabled: boolean
  isStreaming: boolean
  viewOffset: number
}

const VirtualLogsViewer: React.FC<VirtualLogsViewerProps> = ({
  height = 400,
  formatTimestamp,
  getLevelColor,
  autoScrollEnabled,
  isStreaming,
  viewOffset
}) => {
  const { t } = useTranslation('diagnostics')
  const {
    rowCount,
    isRowLoaded,
    loadMoreRows,
    getEntryAtIndex,
    entries,
    overscanCount,
    batchSize,
    threshold,
    // hasMoreHistory,
    isLoadingHistory
  } = useVirtualLogs()

  // CellMeasurerCache for dynamic row heights
  const cache = useMemo(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 28,
      keyMapper: (index: number) => {
        const entry = getEntryAtIndex(index)
        return entry ? `${entry.timestamp}-${entry.subsystem}-${index}` : `empty-${index}`
      }
    })
  }, [getEntryAtIndex])

  const listRef = useRef<typeof List | null>(null)
  const scrollPositionRef = useRef<{ topEntryTimestamp?: string; topIndex?: number }>({})
  const isLoadingRef = useRef(false)

  // Auto-scroll to bottom when new logs arrive and we're at latest view
  useEffect(() => {
    if (listRef.current && autoScrollEnabled && isStreaming && viewOffset === 0) {
      listRef.current.scrollToRow(rowCount - 1)
    }
  }, [entries.length, rowCount, autoScrollEnabled, isStreaming, viewOffset])

  // Track when loading starts to capture scroll position
  useEffect(() => {
    if (isLoadingHistory && !isLoadingRef.current) {
      // Loading just started - capture current top visible item
      isLoadingRef.current = true
      if (listRef.current && entries.length > 0) {
        const grid = (listRef.current as any).Grid
        if (grid && grid._scrollingContainer) {
          const scrollTop = grid._scrollingContainer.scrollTop
          const topIndex = Math.floor(scrollTop / 28) // rowHeight = 28
          const topEntry = getEntryAtIndex(topIndex)
          if (topEntry) {
            scrollPositionRef.current = {
              topEntryTimestamp: topEntry.timestamp,
              topIndex
            }
          }
        }
      }
    } else if (!isLoadingHistory && isLoadingRef.current) {
      // Loading just finished - restore scroll position
      isLoadingRef.current = false
      if (listRef.current && scrollPositionRef.current.topEntryTimestamp) {
        // Find where the previously top item is now located
        const targetTimestamp = scrollPositionRef.current.topEntryTimestamp
        const newIndex = entries.findIndex(entry => entry.timestamp === targetTimestamp)

        if (newIndex !== -1) {
          // Restore the visual position
          listRef.current.scrollToRow(newIndex)
        }

        // Clear the stored position
        scrollPositionRef.current = {}
      }
    }
  }, [isLoadingHistory, entries, getEntryAtIndex])

  // Clear cache when entries change and re-measure
  useEffect(() => {
    cache.clearAll()
    if (listRef.current) {
      listRef.current.recomputeRowHeights()
    }
  }, [entries, cache])

  // Initial scroll to bottom on load
  useEffect(() => {
    if (listRef.current && entries.length > 0 && viewOffset === 0 && !isLoadingHistory) {
      // Small delay to ensure rendering is complete
      const timer = setTimeout(() => {
        listRef.current?.scrollToRow(rowCount - 1)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [entries.length, viewOffset, rowCount, isLoadingHistory])

  const rowRenderer = useCallback(
    ({ index, key, parent, style }) => {
      // Regular log entry
      const entry = getEntryAtIndex(index)
      if (!entry) {
        return (
          <CellMeasurer
            key={key}
            cache={cache}
            parent={parent}
            columnIndex={0}
            rowIndex={index}
          >
            <div style={style} className="pa2">
              <span className="charcoal-muted f6">Loading...</span>
            </div>
          </CellMeasurer>
        )
      }

      return (
        <CellMeasurer
          key={key}
          cache={cache}
          parent={parent}
          columnIndex={0}
          rowIndex={index}
        >
          <LogRow
            style={style}
            entry={entry}
            formatTimestamp={formatTimestamp}
            getLevelColor={getLevelColor}
          />
        </CellMeasurer>
      )
    },
    [
      getEntryAtIndex,
      formatTimestamp,
      getLevelColor,
      cache
    ]
  )

  // Show empty state if no entries
  if (entries.length === 0) {
    return (
      <div
        className='ba b--black-20 pa2 bg-near-white f6 overflow-auto relative'
        style={{ height: `${height}px`, fontFamily: 'Monaco, Consolas, monospace' }}
      >
        <p className='gray tc pa3'>{t('logs.entries.noEntries')}</p>
      </div>
    )
  }

  return (
    <div
      className='ba b--black-20 bg-near-white relative'
      style={{ height: `${height}px`, fontFamily: 'Monaco, Consolas, monospace' }}
    >
      {/* Loading indicator when fetching historical logs */}
      {isLoadingHistory && (
        <div className='absolute top-0 left-0 right-0 bg-light-yellow pa2 tc br2 f6 z-1'>
          <span className='charcoal-muted'>
            🔄 {t('logs.entries.loadingHistory')}...
          </span>
        </div>
      )}

      <AutoSizer>
        {({ height: autoHeight, width }) => (
          <InfiniteLoader
            isRowLoaded={isRowLoaded}
            loadMoreRows={loadMoreRows}
            rowCount={rowCount}
            minimumBatchSize={batchSize}
            threshold={threshold}
          >
            {({ onRowsRendered, registerChild }) => (
              <List
                ref={instance => {
                  listRef.current = instance
                  registerChild(instance)
                }}
                height={autoHeight}
                width={width}
                rowCount={rowCount}
                rowHeight={cache.rowHeight}
                onRowsRendered={onRowsRendered}
                rowRenderer={rowRenderer}
                overscanRowCount={overscanCount}
                scrollToAlignment="start"
                style={{ padding: '8px' }}
              />
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>

      {/* Auto-scroll indicator */}
      {isStreaming && viewOffset === 0 && autoScrollEnabled && (
        <div className='absolute bottom-0 left-0 right-0 tc pa2 charcoal-muted f6 bg-white-80'>
          📍 {t('logs.entries.streaming')}
        </div>
      )}
    </div>
  )
}

export default VirtualLogsViewer

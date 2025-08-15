# Virtual Logs System Architecture

This document explains the architecture and implementation of the IPFS WebUI's virtual logs system, which provides efficient, real-time log viewing with virtual scrolling capabilities.

## Overview

The virtual logs system is designed to handle high-volume log streaming from IPFS nodes while maintaining smooth UI performance. It uses a multi-layered architecture with:

- **Virtual Scrolling**: Efficient rendering of large log datasets
- **Batch Processing**: Optimized handling of incoming log streams
- **Persistent Storage**: IndexedDB-based log retention
- **State Management**: React Context for centralized log state

## Architecture Components

### 1. Virtual Logs Viewer (`src/components/logs/virtual-logs-viewer.tsx`)

The main UI component that renders logs using react-virtualized for performance.

**Key Features:**
- Memory buffer scrolling with auto-scroll to latest logs
- Auto-scroll to latest logs when streaming
- Rate monitoring and auto-disable for high log volumes

**Props:**
```typescript
interface VirtualLogsViewerProps {
  height?: number
  formatTimestamp: (timestamp: string) => string
  getLevelColor: (level: string) => string
  autoScrollEnabled: boolean
  isStreaming: boolean
}
```

**Integration:**
- Uses `useLogs` hook for data management
- Renders log entries in a scrollable container
- Handles auto-scroll and manual scroll detection

### 2. Virtual Logs Hook (`src/hooks/use-virtual-logs.ts`)

Provides the interface between the virtual viewer and the logs context.

**Key Functions:**
- `isRowLoaded`: Determines if a specific row index has data
- `loadMoreRows`: Loads data for visible/invisible rows
- `getEntryAtIndex`: Retrieves a specific log entry by index

**Configuration:**
```typescript
interface VirtualLogsConfig {
  overscanCount?: number  // Extra rows to render outside viewport
  batchSize?: number      // Number of rows to load per batch
  threshold?: number      // Rows from edge to trigger loading
}
```

**Data Flow:**
1. React-virtualized calls `loadMoreRows` when scrolling near edges
2. Hook calculates actual log IDs using `idbIdDiff` offset
3. Requests data from `logStorage.getLogIdRange()`
4. Updates `displayEntries` in the context

### 3. Logs Context (`src/contexts/logs/logs-context.tsx`)

Central state management for the entire logs system.

**State Management:**
- Uses React useReducer with `logsReducer`
- Manages streaming, storage, and UI state
- Provides actions for log operations

**Key State:**
```typescript
interface LogsContextValue {
  entries: LogEntry[]              // Currently loaded logs in memory
  isStreaming: boolean             // Active streaming status
  globalLogLevel: string           // Global log level
  subsystemLevels: Record<string, string>  // Per-subsystem levels
  actualLogLevels: Record<string, string>  // Effective levels from API
  bufferConfig: LogBufferConfig    // Memory and storage configuration
  rateState: LogRateState          // Rate monitoring state
  storageStats: LogStorageStats | null  // Storage statistics
  // ... other state properties
}
```

**Actions:**
- `startStreaming`/`stopStreaming`: Control log streaming
- `setLogLevelsBatch`: Configure log levels (single or batch)
- `clearEntries`: Clear stored logs
- `updateBufferConfig`: Update buffer configuration

### 4. Batch Processor (`src/contexts/logs/batch-processor.ts`)

Optimizes incoming log streams by batching entries and monitoring rates.

**Features:**
- Batches incoming logs (50 entries or 500ms timeout)
- Monitors log rate to prevent UI freezing
- Auto-disables streaming if rate exceeds threshold
- Stores logs in IndexedDB for persistence

**Rate Monitoring:**
- Tracks entries per second over 5-second window
- Warns when rate exceeds `warnThreshold`
- Auto-disables when rate exceeds `autoDisableThreshold`

**Batch Processing:**
```typescript
const processBatch = async () => {
  // Process pending entries
  const entries = [...pendingEntriesRef.current]
  pendingEntriesRef.current = []

  // Update rate monitoring
  updateRateCalculations(entries.length)

  // Store in IndexedDB
  await logStorage.appendLogs(entries)

  // Notify context
  onBatch(entries)
}
```

### 5. Log Storage (`src/lib/log-storage.ts`)

IndexedDB-based persistent storage with circular buffer behavior.

**Storage Features:**
- Circular buffer: automatically removes oldest entries when limit reached
- Efficient querying by timestamp and ID ranges
- Configurable maximum entries
- Storage statistics and monitoring

**Key Methods:**
```typescript
class LogStorage {
  async appendLogs(entries: LogEntry[]): Promise<void>
  async getLogIdRange(startId: number, endId: number): Promise<LogEntry[]>
  async getLogsBefore(timestamp: string, limit: number): Promise<LogEntry[]>
  async getLogsAfter(timestamp: string, limit: number): Promise<LogEntry[]>
  async getRecentLogs(limit: number): Promise<LogEntry[]>
  async getStorageStats(): Promise<LogStorageStats>
}
```

**Circular Buffer Implementation:**
- When `maxEntries` is reached, oldest entries are automatically deleted
- Maintains consistent ID ranges for virtual scrolling
- Provides `idbIdDiff` calculation for index mapping

## Data Flow

### 1. Log Streaming Flow

```
IPFS Node → Log Stream → Batch Processor → Log Storage → Context → Virtual Viewer
     ↓              ↓              ↓              ↓           ↓           ↓
  Raw Logs    Parsed Entries   Batched Logs   IndexedDB   React State   UI Render
```

1. **IPFS Streaming**: `ipfs.log.tail()` provides raw log stream
2. **Parsing**: Raw logs converted to `LogEntry` objects
3. **Batching**: Batch processor collects and processes entries
4. **Storage**: Logs stored in IndexedDB with circular buffer
5. **State Update**: Context receives batched entries
6. **UI Update**: Virtual viewer renders new entries

### 2. Virtual Scrolling Flow

```
User Scroll → React Virtualized → useVirtualLogs → Log Storage → Context → UI Update
     ↓              ↓                    ↓              ↓           ↓           ↓
  Scroll Event   Load More Rows    Calculate IDs   Fetch Range   Update State   Re-render
```

1. **Scroll Detection**: React-virtualized detects scroll near edges
2. **Load Request**: `loadMoreRows` called with start/stop indices
3. **ID Calculation**: Virtual hook calculates actual log IDs using `idbIdDiff`
4. **Data Fetch**: Storage retrieves logs for the requested range
5. **State Update**: Context updates `displayEntries`
6. **UI Render**: Virtual viewer renders new rows

### 3. Historical Loading Flow

```
User Action → Context Action → Log Storage → State Update → Virtual Viewer
     ↓              ↓              ↓              ↓              ↓
  Load History   loadHistoricalLogs   Query Before   Update Entries   Scroll Position
```

1. **User Request**: User clicks "Load More" or scrolls to top
2. **Context Action**: `loadHistoricalLogs` dispatched
3. **Storage Query**: Storage fetches logs before current oldest
4. **State Merge**: New logs prepended to `displayEntries`
5. **Scroll Restore**: Virtual viewer maintains scroll position

## Key Concepts

### Index Mapping (`idbIdDiff`)

The `idbIdDiff` is crucial for virtual scrolling performance:

```typescript
// Virtual index (what react-virtualized sees)
const virtualIndex = 0

// Actual log ID in IndexedDB
const actualLogId = virtualIndex + idbIdDiff

// Example:
// If idbIdDiff = 1000, then virtual index 0 maps to log ID 1000
// This allows efficient range queries without loading all logs
```

**Calculation:**
```typescript
// When logs are loaded, calculate the offset
const newestLogId = Number(entries[entries.length - 1]?.id ?? 0)
const totalLogsInDB = await logStorage.size()
idbIdDiff = newestLogId - totalLogsInDB + 1
```

### Circular Buffer Behavior

The storage system implements a circular buffer:

```typescript
// When maxEntries is reached, oldest entries are deleted
if (totalEntries > maxEntries) {
  const deleteCount = totalEntries - maxEntries
  // Delete oldest entries
  // Update idbIdDiff to maintain index mapping
}
```

### Batch Processing Strategy

The batch processor uses multiple strategies:

1. **Size-based**: Process when 50+ entries accumulated
2. **Time-based**: Process after 500ms timeout
3. **Fallback**: Process after 1 second regardless

This ensures responsive UI while maintaining efficiency.

## Performance Optimizations

### 1. Virtual Scrolling
- Only renders visible rows + overscan
- Dynamic row heights for variable content
- Efficient scroll position management

### 2. Batch Processing
- Reduces React re-renders
- Prevents UI blocking during high-volume streaming
- Rate monitoring prevents performance degradation

### 3. IndexedDB Optimization
- Efficient range queries using ID-based indexing
- Circular buffer prevents unlimited growth
- Async operations don't block UI

### 4. State Management
- Immutable updates prevent unnecessary re-renders
- Memoized callbacks reduce function recreation
- Ref-based mutable state for performance-critical data

## Configuration

### Buffer Configuration
```typescript
interface LogBufferConfig {
  memory: number           // Max entries in memory (default: 100)
  indexedDB: number        // Max entries in storage (default: 200,000)
  warnThreshold: number    // Rate warning threshold (default: 50/s)
  autoDisableThreshold: number // Auto-disable threshold (default: 1,000/s)
}
```

### Virtual Scrolling Configuration
```typescript
interface VirtualLogsConfig {
  overscanCount: number    // Extra rows to render (default: 5)
  batchSize: number        // Rows per load batch (default: 100)
  threshold: number        // Load trigger distance (default: 40)
}
```

## Error Handling

### Streaming Errors
- Automatic retry on connection loss
- Graceful degradation when IPFS unavailable
- User notification for persistent failures

### Storage Errors
- Fallback to memory-only mode
- Automatic cleanup on quota exceeded
- Error recovery for corrupted data

### Performance Errors
- Auto-disable streaming on high rates
- Warning notifications for performance issues
- Graceful degradation for large datasets

## Future Enhancements

### Planned Improvements
1. **Web Workers**: Move batch processing to background thread
2. **Compression**: Compress stored logs to increase capacity
3. **Advanced Filtering**: Real-time log filtering and search
4. **Export Features**: Export logs in in format users would receive if they were to pipe daemon logs to a file

### Performance Targets
- Handle 10,000+ logs/second without UI blocking
- Support 1M+ stored logs with sub-second query times
- Maintain 60fps scrolling with 10,000+ visible logs

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Reduce `memory` buffer size
   - Increase batch processing frequency
   - Monitor for memory leaks in log parsing

2. **Slow Scrolling**
   - Increase `overscanCount` for smoother scrolling
   - Reduce `batchSize` for more frequent updates
   - Check for expensive row rendering

3. **Storage Quota Exceeded**
   - Reduce `indexedDB` buffer size
   - Implement log compression
   - Add storage cleanup mechanisms

4. **Streaming Performance**
   - Adjust rate thresholds
   - Implement adaptive batching
   - Add stream backpressure handling

### Debug Tools

The system includes extensive logging for debugging:

```typescript
// Enable debug logging
console.log('Virtual logs debug info:', {
  displayEntries: displayEntries.length,
  rowCount,
  idbIdDiff,
  isStreaming,
  hasMoreHistory
})
```

## API Reference

### Context Hook
```typescript
const {
  displayEntries,
  isStreaming,
  startStreaming,
  stopStreaming,
  loadHistoricalLogs,
  setLogLevel,
  // ... other properties
} = useLogs()
```

### Virtual Logs Hook
```typescript
const {
  rowCount,
  isRowLoaded,
  loadMoreRows,
  getEntryAtIndex,
  displayEntries,
  // ... other properties
} = useVirtualLogs(config)
```

### Storage API
```typescript
const logStorage = new LogStorage(config)
await logStorage.init()
await logStorage.appendLogs(entries)
const logs = await logStorage.getLogIdRange(startId, endId)
```

This architecture provides a robust, performant solution for handling high-volume log streaming while maintaining excellent user experience through virtual scrolling and efficient state management.

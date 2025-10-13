# Logs System

Real-time log streaming from IPFS nodes with batch processing and persistent storage.

## Architecture

```
IPFS Node → Log Stream → Batch Processor → Log Storage → Context → Log Viewer
```

### Components

- **LogsScreen**: Main UI component for logs display
- **LogViewer**: Renders individual log entries in scrollable container
- **LogsContext**: Central state management using React Context
- **BatchProcessor**: Batches incoming logs (50 entries or 100ms timeout)
- **LogStorage**: IndexedDB storage with circular buffer (200k entry limit)

## Data Flow

1. **Streaming**: `ipfs.log.tail()` provides raw log stream
2. **Parsing**: Raw logs converted to `LogEntry` objects
3. **Batching**: Batch processor collects entries and processes in batches
4. **Storage**: Logs stored in IndexedDB, oldest entries removed when limit reached
5. **UI**: Log viewer renders entries from React state

## Configuration

See `LogBufferConfig` interface in `reducer.ts` for buffer configuration options.

## Usage

```typescript
const {
  entries,
  isStreaming,
  startStreaming,
  stopStreaming,
  setLogLevelsBatch
} = useLogs()
```

## File Structure

```
src/contexts/logs/
├── logs-context.tsx      # Main context provider
├── use-batch-processor.ts # Batch processing hook
├── log-storage.ts        # IndexedDB storage
├── reducer.ts            # State management
└── api.ts                # IPFS API calls
```

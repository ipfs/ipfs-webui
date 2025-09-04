/**
 * IndexedDB-based log storage service
 */
import type { LogEntry } from './api'

export interface LogStorageConfig {
  dbName: string
  storeName: string
  maxEntries: number
  version: number
}

export interface LogStorageStats {
  totalEntries: number
  oldestTimestamp: string | null
  newestTimestamp: string | null
  estimatedSize: number
}

const DEFAULT_CONFIG: LogStorageConfig = {
  dbName: 'ipfs-webui-logs',
  storeName: 'log-entries',
  maxEntries: 10000,
  version: 1
}

export class LogStorage {
  private db: IDBDatabase | null = null
  private config: LogStorageConfig
  private initPromise: Promise<void> | null = null
  // sentinal to prevent multiple trimming operations
  private trimmingOldEntries = false
  constructor (config: Partial<LogStorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Initialize the IndexedDB connection
   */
  async init (): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version)

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, {
            keyPath: 'id',
            autoIncrement: true
          })

          // Create index for timestamp-based queries
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('level', 'level', { unique: false })
          store.createIndex('subsystem', 'subsystem', { unique: false })
        }
      }
    })

    return this.initPromise
  }

  /**
   * Append new log entries with circular buffer behavior
   */
  async appendLogs (entries: LogEntry[]): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    const transaction = this.db.transaction([this.config.storeName], 'readwrite')
    const store = transaction.objectStore(this.config.storeName)

    const done = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onabort = () => reject(transaction.error ?? new Error('Transaction aborted'))
      transaction.onerror = () => reject(transaction.error ?? new Error('Transaction error'))
    })

    // Queue all adds without per-item awaits
    for (const entry of entries) {
      const entryWithId: LogEntry = {
        ...entry,
        timestamp: entry.timestamp ?? new Date().toISOString()
      }
      const req = store.add(entryWithId)
      req.onerror = () => { console.error(req.error) }
    }

    // shouldn't be necessary, but may help.
    if (typeof transaction.commit === 'function') transaction.commit()

    await done

    // Implement circular buffer - remove old entries if we exceed maxEntries
    void this.enforceMaxEntries()
  }

  /**
   * Get the most recent logs
   */
  async getRecentLogs (limit = 500): Promise<LogEntry[]> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    const tx = this.db.transaction([this.config.storeName], 'readonly')
    const store = tx.objectStore(this.config.storeName)
    const index = store.index('timestamp') // use your actual index name

    // Pre-size and fill from the end so final order is oldest→newest without reverse()
    const out: LogEntry[] = new Array(Math.max(0, limit))
    let write = out.length - 1
    let settled = false

    return new Promise<LogEntry[]>((resolve, reject) => {
      tx.onabort = () => {
        if (!settled) reject(tx.error ?? new Error('Transaction aborted'))
      }
      tx.onerror = () => {
        if (!settled) reject(tx.error ?? new Error('Transaction error'))
      }

      const req = index.openCursor(undefined, 'prev') // newest first
      req.onerror = () => {
      // don’t continue; let tx error/abort handlers fire
      }

      req.onsuccess = () => {
        const cursor = req.result
        if (!cursor || write < 0) {
          if (!settled) {
            settled = true
            // slice to the filled portion (trim any leading holes if fewer than limit)
            resolve(out.slice(write + 1))
          }
          return
        }

        out[write--] = {
          ...cursor.value,
          id: cursor.key as number // Include the auto-generated ID from IndexedDB
        } as LogEntry
        // Safe to continue while we're still in onsuccess (tx is active in this task)
        cursor.continue()
      }
    })
  }

  /**
   * Clear old entries to maintain circular buffer
   */
  private async enforceMaxEntries (): Promise<void> {
    if (!this.db || this.trimmingOldEntries) return

    const transaction = this.db.transaction([this.config.storeName], 'readwrite')
    const store = transaction.objectStore('log-entries')

    // Count total entries
    const countRequest = store.count()

    return new Promise<void>((resolve, reject) => {
      countRequest.onsuccess = () => {
        const totalCount = countRequest.result

        if (totalCount <= this.config.maxEntries) {
          resolve()
          return
        }
        this.trimmingOldEntries = true

        // Delete oldest entries
        const entriesToDelete = totalCount - this.config.maxEntries
        const index = store.index('timestamp')
        const request = index.openCursor(null, 'next') // Oldest first

        let deleted = 0

        request.onsuccess = () => {
          const cursor = request.result
          if (cursor && deleted < entriesToDelete) {
            cursor.delete()
            deleted++
            cursor.continue()
          } else {
            resolve()
          }
        }

        request.onerror = () => reject(request.error)
      }

      countRequest.onerror = () => reject(countRequest.error)
    }).finally(() => {
      this.trimmingOldEntries = false
    })
  }

  /**
   * Get storage statistics
   */
  async getStorageStats (): Promise<LogStorageStats> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readonly')
      const store = transaction.objectStore('log-entries')
      const index = store.index('timestamp')

      let totalEntries = 0
      let oldestTimestamp: string | null = null
      let newestTimestamp: string | null = null
      let estimatedSize = 0

      // Count entries and get timestamps
      const countRequest = store.count()

      countRequest.onsuccess = () => {
        totalEntries = countRequest.result

        if (totalEntries === 0) {
          resolve({
            totalEntries: 0,
            oldestTimestamp: null,
            newestTimestamp: null,
            estimatedSize: 0
          })
          return
        }

        // Get oldest timestamp
        const oldestRequest = index.openCursor(null, 'next')
        oldestRequest.onsuccess = () => {
          const cursor = oldestRequest.result
          if (cursor) {
            oldestTimestamp = cursor.value.timestamp

            // Estimate size (rough calculation)
            estimatedSize = totalEntries * JSON.stringify(cursor.value).length
          }

          // Get newest timestamp
          const newestRequest = index.openCursor(null, 'prev')
          newestRequest.onsuccess = () => {
            const cursor = newestRequest.result
            if (cursor) {
              newestTimestamp = cursor.value.timestamp
            }

            resolve({
              totalEntries,
              oldestTimestamp,
              newestTimestamp,
              estimatedSize
            })
          }
          newestRequest.onerror = () => reject(newestRequest.error)
        }
        oldestRequest.onerror = () => reject(oldestRequest.error)
      }

      countRequest.onerror = () => reject(countRequest.error)
    })
  }

  /**
   * Clear all stored logs
   */
  async clearAllLogs (): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite')
      const store = transaction.objectStore('log-entries')
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Update configuration (requires reinit)
   */
  updateConfig (newConfig: Partial<LogStorageConfig>): void {
    this.config = { ...this.config, ...newConfig }
    // Reset init promise to force reinitialization
    this.initPromise = null
    this.db = null
  }

  /**
   * Close the database connection
   */
  close (): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initPromise = null
    }
  }
}

// Export singleton instance
export const logStorage = new LogStorage()

import { LogEntry, LogSubsystem, LogLevelsResponse, RawLogEntry } from './types'
import type { KuboRPCClient } from 'kubo-rpc-client'

/**
 * Fetch log levels from IPFS API with proper type safety
 */
export async function getLogLevels (): Promise<Record<string, string>> {
  const resp = await fetch('http://127.0.0.1:5001/api/v0/log/get-level', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!resp.ok) {
    throw new Error('Could not fetch log levels: ' + resp.statusText)
  }

  const body = (await resp.json()) as LogLevelsResponse
  return body.Levels ?? {}
}

/**
 * Parse log entry with full type safety and no unchecked property reads
 */
export function parseLogEntry (raw: unknown): LogEntry | null {
  try {
    if (typeof raw === 'string') {
      // Try to parse as JSON log entry
      if (raw.startsWith('{')) {
        const parsed = JSON.parse(raw) as RawLogEntry
        return {
          timestamp: parsed.ts ?? parsed.timestamp ?? new Date().toISOString(),
          level: parsed.level ?? 'info',
          subsystem: parsed.system ?? parsed.logger ?? 'unknown',
          message: parsed.msg ?? parsed.message ?? raw
        }
      } else {
        // Parse plain text log format
        const parts = raw.split(' ')
        if (parts.length >= 3) {
          return {
            timestamp: new Date().toISOString(),
            level: parts[0] ?? 'info',
            subsystem: parts[1] ?? 'unknown',
            message: parts.slice(2).join(' ')
          }
        }
      }
    } else if (raw && typeof raw === 'object') {
      // Already parsed object
      const entry = raw as RawLogEntry
      return {
        timestamp: entry.ts ?? entry.timestamp ?? new Date().toISOString(),
        level: entry.level ?? 'info',
        subsystem: entry.system ?? entry.logger ?? 'unknown',
        message: entry.msg ?? entry.message ?? JSON.stringify(raw)
      }
    }
  } catch (error) {
    console.warn('Failed to parse log entry:', error)
  }

  // Fallback for unparseable entries
  return {
    timestamp: new Date().toISOString(),
    level: 'info',
    subsystem: 'unknown',
    message: String(raw)
  }
}

/**
 * Fetch and process log subsystems from IPFS API
 */
export async function fetchLogSubsystems (ipfs: KuboRPCClient): Promise<LogSubsystem[]> {
  // Get subsystem names
  const response = await ipfs.log.ls()
  const subsystemNames: string[] = Array.isArray(response) ? response : response.Strings || []

  // Fetch actual log levels from the API
  let logLevels: Record<string, string> = {}
  try {
    logLevels = await getLogLevels()
  } catch (error) {
    console.warn('Failed to fetch log levels, using defaults:', error)
  }

  // Create subsystem list with actual levels from API
  const subsystems: LogSubsystem[] = subsystemNames.map((name: string) => ({
    name,
    level: logLevels[name] ?? logLevels['*'] ?? 'info' // Use subsystem level, fallback to global, then default
  }))

  // Sort subsystems alphabetically by name
  return subsystems.sort((a, b) => a.name.localeCompare(b.name))
}

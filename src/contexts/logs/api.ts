import type { RawLogEntry, LogEntry, LogLevelsResponse, LogSubsystem } from './types'

/**
 * Fetch current log levels from IPFS daemon
 *
 * We need to wait for the following issues to be resolved:
 *
 * * https://github.com/ipfs/kubo/pull/10885
 * * https://github.com/ipfs/js-kubo-rpc-client/issues/339
 */
export async function getLogLevels (): Promise<Record<string, string>> {
  const resp = await fetch('http://127.0.0.1:5001/api/v0/log/get-level', { method: 'POST' })
  if (!resp.ok) throw new Error(`Log levels fetch failed: ${resp.status}`)
  const body = (await resp.json()) as LogLevelsResponse
  return body.Levels ?? {}
}

/**
 * Fetch subsystem list from IPFS instance
 */
export async function fetchLogSubsystems (ipfs: any): Promise<LogSubsystem[]> {
  const response = await ipfs.log.ls()
  const names: string[] = Array.isArray(response) ? response : response.Strings || []
  const levels = await getLogLevels()
  const subsystems = names.map(name => ({ name, level: levels[name] ?? levels['*'] ?? 'info' }))

  // Sort subsystems alphabetically by name
  return subsystems.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Parse raw log entry into structured LogEntry
 */
export function parseLogEntry (raw: unknown): LogEntry | null {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return {
        timestamp: parsed.ts ?? parsed.timestamp ?? new Date().toISOString(),
        level: parsed.level ?? 'info',
        subsystem: parsed.system ?? parsed.logger ?? 'unknown',
        message: parsed.msg ?? parsed.message ?? raw
      }
    } catch {
      const parts = raw.split(' ')
      if (parts.length >= 3) {
        return {
          timestamp: new Date().toISOString(),
          level: parts[0],
          subsystem: parts[1],
          message: parts.slice(2).join(' ')
        }
      }
    }
  } else if (raw && typeof raw === 'object') {
    const obj = raw as RawLogEntry
    return {
      timestamp: obj.ts ?? obj.timestamp ?? new Date().toISOString(),
      level: obj.level ?? 'info',
      subsystem: obj.system ?? obj.logger ?? 'unknown',
      message: obj.msg ?? obj.message ?? JSON.stringify(raw)
    }
  }
  return null
}

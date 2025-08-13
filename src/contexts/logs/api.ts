import type { RawLogEntry, LogEntry, LogLevelsResponse, LogSubsystem } from './types'
import type { KuboRPCClient } from 'kubo-rpc-client'

export async function getLogLevels (ipfs: KuboRPCClient, signal?: AbortSignal): Promise<LogLevelsResponse['levels']> {
  try {
    // @ts-expect-error - kubo-rpc-client is not typed correctly since https://github.com/ipfs/kubo/pull/10885 was merged.
    const response = await ipfs.log.level('*', undefined, { signal }) as LogLevelsResponse
    return response.levels
  } catch (e) {
    console.error('Failed to fetch log levels', e)
    throw e
  }
}

/**
 * Fetch subsystem list from IPFS instance
 */
export async function fetchLogSubsystems (ipfs: KuboRPCClient, signal?: AbortSignal): Promise<LogSubsystem[]> {
  const response = await ipfs.log.ls({ signal })
  const names: string[] = Array.isArray(response) ? response : response.Strings || []
  const levels = await getLogLevels(ipfs, signal)
  const subsystems = names.map(name => ({ name, level: levels[name] ?? levels['(default)'] ?? 'unknown' }))

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

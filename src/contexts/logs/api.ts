import type { KuboRPCClient } from 'kubo-rpc-client'

/**
 * Raw log entry from Kubo RPC API (before parsing)
 */
interface RawLogEntry {
  /**
   * The timestamp of the log
   */
  ts: string
  /**
   * The level of the log
   */
  level: string
  /**
   * The subsystem of the log
   */
  logger: string
  /**
   * The src line of code where the log was called from
   */
  caller: string
  /**
   * The message of the log
   */
  msg: string
  /**
   * Allow any additional structured fields
   */
  [key: string]: any
}

/**
 * Normalized log entry data structure
 */
export interface LogEntry {
  timestamp: string
  level: string
  subsystem: string
  message: string
  id?: number
}

/**
 * API Response types for type safety
 */
export interface LogLevelsResponse {
  levels: Record<string, string>
}

/**
 * Log subsystem data structure
 */
export interface LogSubsystem {
  name: string
  level: string
}

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
 * Set a single log level
 */
async function setLogLevel (ipfs: KuboRPCClient, subsystem: string, level: string, signal?: AbortSignal): Promise<void> {
  try {
    await ipfs.log.level(subsystem, level, { signal })
  } catch (e) {
    console.error(`Failed to set log level for ${subsystem} to ${level}`, e)
    throw e
  }
}

/**
 * Set multiple log levels in batch and return the final state
 */
export async function setLogLevelsBatch (ipfs: KuboRPCClient, levels: Array<{ subsystem: string; level: string }>, signal?: AbortSignal): Promise<LogLevelsResponse['levels']> {
  try {
    // Separate global level from subsystem levels
    const globalLevel = levels.find(({ subsystem }) => subsystem === '*' || subsystem === '(default)')
    const subsystemLevels = levels.filter(({ subsystem }) => subsystem !== '*' && subsystem !== '(default)')

    // Set global level first (if present)
    if (globalLevel) {
      await setLogLevel(ipfs, globalLevel.subsystem, globalLevel.level, signal)
    }

    // Then set individual subsystem levels
    for (const { subsystem, level } of subsystemLevels) {
      await setLogLevel(ipfs, subsystem, level, signal)
    }

    // Fetch the final state after all changes
    return getLogLevels(ipfs, signal)
  } catch (e) {
    console.error('Failed to set log levels in batch', e)
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
export function parseLogEntry (raw: unknown): LogEntry {
  const { ts, level, logger, caller, msg, ...attributes } = raw as RawLogEntry

  return {
    timestamp: ts,
    level,
    subsystem: logger,
    message: Object.keys(attributes).length > 0
      ? `${msg} ${JSON.stringify(attributes)}`
      : msg
  }
}

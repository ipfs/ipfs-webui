/**
 * GOLOG_LOG_LEVEL utility functions for parsing, validation, and calculation
 */

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'dpanic', 'panic', 'fatal'] as const
export type LogLevel = typeof LOG_LEVELS[number]

export interface LogSubsystem {
  subsystem: string
  level: string
}

export interface ValidationResult {
  isValid: boolean
  errorKey: string
  errorParams: Record<string, any>
}

export interface InputContext {
  currentPartIndex: number
  currentPartStart: number
  currentPart: string
  beforeCursor: string
  afterCursor: string
  isInSubsystemPart: boolean
  isComplete: boolean
  isAtEndOfCompletePart: boolean
}

/**
 * Parse a GOLOG_LOG_LEVEL string into an array of subsystem configurations
 */
export function parseGologLevelString (input: string): LogSubsystem[] {
  if (!input.trim()) return []

  const parts = input.split(',')
  const levelsToSet: LogSubsystem[] = []
  let globalLevel: string | null = null

  // Parse all parts to find global level and subsystem levels
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim()

    if (part.includes('=')) {
      // This is a subsystem=level part
      const equalIndex = part.indexOf('=')
      const subsystemName = part.substring(0, equalIndex).trim()
      const level = part.substring(equalIndex + 1).trim()
      if (level.trim() !== '') {
        levelsToSet.push({ subsystem: subsystemName, level })
      }
    } else if (part && !globalLevel) {
      // This is a global level (first non-empty part without equals)
      globalLevel = part
    }
  }

  // Add global level if found
  if (globalLevel) {
    levelsToSet.push({ subsystem: '*', level: globalLevel })
  }

  return levelsToSet
}

/**
 * Validate a GOLOG_LOG_LEVEL string
 */
export function validateGologLevelString (input: string, validSubsystems: string[]): ValidationResult {
  if (input.trim().length === 0) {
    return { isValid: false, errorKey: 'logs.autocomplete.invalidInput', errorParams: {} }
  }

  const parts = input.split(',')
  let seenGlobalLevel = false

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim()
    if (part.length === 0) continue

    if (part.includes('=')) {
      // This is a subsystem=level part
      const equalIndex = part.indexOf('=')
      const subsystemName = part.substring(0, equalIndex).trim()
      const level = part.substring(equalIndex + 1).trim()

      // Check if subsystem exists
      if (!validSubsystems.includes(subsystemName)) {
        return {
          isValid: false,
          errorKey: 'logs.autocomplete.invalidSubsystem',
          errorParams: { subsystem: subsystemName, subsystems: validSubsystems.join(', ') }
        }
      }

      if (level.length === 0) {
        return {
          isValid: false,
          errorKey: 'logs.autocomplete.invalidSubsystemLevel',
          errorParams: { subsystem: subsystemName, subsystems: validSubsystems.join(', ') }
        }
      }

      // Check if level is valid
      if (!isValidLogLevel(level)) {
        return {
          isValid: false,
          errorKey: 'logs.autocomplete.invalidLevel',
          errorParams: { level }
        }
      }
    } else if (!seenGlobalLevel) {
      // This is a global level
      if (!isValidLogLevel(part)) {
        return {
          isValid: false,
          errorKey: 'logs.autocomplete.invalidLevel',
          errorParams: { level: part }
        }
      }
      seenGlobalLevel = true
    } else {
      // We have already seen a global level, so they can't have another one
      if (validSubsystems.includes(part)) {
        // If it is a valid subsystem, then we need to display an error that they need to add an = and a level
        return {
          isValid: false,
          errorKey: 'logs.autocomplete.invalidSubsystemLevel',
          errorParams: { subsystem: part, subsystems: validSubsystems.join(', ') }
        }
      }
      return {
        isValid: false,
        errorKey: 'logs.autocomplete.invalidSubsystem',
        errorParams: { subsystem: part, subsystems: validSubsystems.join(', ') }
      }
    }
  }

  return { isValid: true, errorKey: '', errorParams: {} }
}

/**
 * Convert subsystems array to actual log levels object
 */
export function subsystemsToActualLevels (subsystems: LogSubsystem[]): Record<string, string> {
  const actualLevels: Record<string, string> = {}

  // Find global level
  const globalLevel = subsystems.find(({ subsystem }) => subsystem === '*' || subsystem === '(default)')
  const globalLevelValue = globalLevel?.level || 'info'
  actualLevels['(default)'] = globalLevelValue

  // Add subsystem levels (only those that differ from global level)
  subsystems.forEach(({ subsystem, level }) => {
    if (subsystem !== '*' && subsystem !== '(default)' && level !== globalLevelValue) {
      actualLevels[subsystem] = level
    }
  })

  return actualLevels
}

/**
 * Calculate GOLOG_LOG_LEVEL string from actual log levels
 */
export function calculateGologLevelString (actualLevels: Record<string, string>): string | null {
  if (Object.keys(actualLevels).length === 0) {
    return null
  }

  // Use the actual effective global level, fallback to stored global level
  const effectiveGlobalLevel = actualLevels['(default)']
  const parts = [effectiveGlobalLevel]

  // Add subsystems that differ from the effective global level
  Object.entries(actualLevels).forEach(([subsystem, level]) => {
    if (subsystem !== '(default)' && level !== effectiveGlobalLevel) {
      parts.push(`${subsystem}=${level}`)
    }
  })

  return parts.join(',')
}

/**
 * Parse input context for autocomplete functionality
 */
export function parseInputContext (input: string, cursorPos: number): InputContext {
  const parts = input.split(',')
  let currentPartIndex = 0
  let currentPartStart = 0

  // Find which part the cursor is in
  for (let i = 0; i < parts.length; i++) {
    const partEnd = currentPartStart + parts[i].length
    if (cursorPos <= partEnd) {
      currentPartIndex = i
      break
    }
    currentPartStart = partEnd + 1 // +1 for the comma
  }

  const currentPart = parts[currentPartIndex] || ''
  const beforeCursor = input.substring(0, cursorPos)
  const afterCursor = input.substring(cursorPos)

  // Check if we're in a subsystem=level part
  const equalIndex = currentPart.indexOf('=')
  const isInSubsystemPart = equalIndex > 0 && cursorPos > currentPartStart + equalIndex

  // Check if the current part is complete
  let isComplete = false

  if (equalIndex > 0) {
    // This is a subsystem=level part
    const levelAfterEquals = currentPart.substring(equalIndex + 1).trim()
    const isValidLevel = LOG_LEVELS.some(level => level.toLowerCase() === levelAfterEquals.toLowerCase())
    isComplete = levelAfterEquals.length > 0 && isValidLevel
  } else {
    // This is a global level part
    const isValidGlobalLevel = LOG_LEVELS.some(level => level.toLowerCase() === currentPart.trim().toLowerCase())
    isComplete = currentPart.trim().length > 0 && isValidGlobalLevel
  }

  // Check if cursor is at the end of a complete part (ready for comma)
  const isAtEndOfCompletePart = isComplete && cursorPos === currentPartStart + currentPart.length

  return {
    currentPartIndex,
    currentPartStart,
    currentPart,
    beforeCursor,
    afterCursor,
    isInSubsystemPart,
    isComplete,
    isAtEndOfCompletePart
  }
}

/**
 * Check if a string is a valid log level
 */
export function isValidLogLevel (level: string): boolean {
  return LOG_LEVELS.some(validLevel => validLevel.toLowerCase() === level.toLowerCase())
}

/**
 * Get suggestions for autocomplete based on current input context
 */
export function getAutocompleteSuggestions (
  input: string,
  cursorPos: number,
  subsystems: Array<{ name: string; level: string }>
): Array<{ type: 'global' | 'subsystem' | 'level'; value: string; display: string }> {
  const context = parseInputContext(input, cursorPos)
  const suggestions: Array<{ type: 'global' | 'subsystem' | 'level'; value: string; display: string }> = []

  if (context.isInSubsystemPart) {
    // Suggest log levels for subsystem
    LOG_LEVELS.forEach(level => {
      suggestions.push({
        type: 'level',
        value: level,
        display: level
      })
    })
  } else if (context.currentPart.includes('=')) {
    // Incomplete subsystem=level, suggest levels
    LOG_LEVELS.forEach(level => {
      suggestions.push({
        type: 'level',
        value: level,
        display: level
      })
    })
  } else {
    // Suggest global level or subsystems
    if (context.currentPartIndex === 0) {
      // First part - suggest global levels
      LOG_LEVELS.forEach(level => {
        suggestions.push({
          type: 'global',
          value: level,
          display: level
        })
      })
    }

    // Suggest subsystems
    subsystems.forEach(({ name }) => {
      if (name.toLowerCase().includes(context.currentPart.toLowerCase())) {
        suggestions.push({
          type: 'subsystem',
          value: `${name}=`,
          display: name
        })
      }
    })
  }

  return suggestions
}

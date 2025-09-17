// @ts-check
import { describe, it, expect } from '@jest/globals'
import {
  LOG_LEVELS,
  parseGologLevelString,
  validateGologLevelString,
  subsystemsToActualLevels,
  calculateGologLevelString,
  parseInputContext,
  isValidLogLevel,
  getAutocompleteSuggestions
} from './golog-level-utils'

describe('golog-level-utils', () => {
  describe('LOG_LEVELS constant', () => {
    it('should contain all expected log levels', () => {
      expect(LOG_LEVELS).toEqual(['debug', 'info', 'warn', 'error', 'dpanic', 'panic', 'fatal'])
    })

    it('should be an array', () => {
      expect(LOG_LEVELS).toBeInstanceOf(Array)
    })
  })

  describe('parseGologLevelString', () => {
    describe('happy path cases', () => {
      it('should parse empty string', () => {
        const result = parseGologLevelString('')
        expect(result).toEqual([])
      })

      it('should parse whitespace-only string', () => {
        const result = parseGologLevelString('   ')
        expect(result).toEqual([])
      })

      it('should parse global level only', () => {
        const result = parseGologLevelString('debug')
        expect(result).toEqual([{ subsystem: '*', level: 'debug' }])
      })

      it('should parse global level with whitespace', () => {
        const result = parseGologLevelString('  info  ')
        expect(result).toEqual([{ subsystem: '*', level: 'info' }])
      })

      it('should parse subsystem with level', () => {
        const result = parseGologLevelString('ipfs=debug')
        expect(result).toEqual([{ subsystem: 'ipfs', level: 'debug' }])
      })

      it('should parse subsystem with level and whitespace', () => {
        const result = parseGologLevelString('  ipfs  =  debug  ')
        expect(result).toEqual([{ subsystem: 'ipfs', level: 'debug' }])
      })

      it('should parse multiple subsystems', () => {
        const result = parseGologLevelString('ipfs=debug,http=warn,libp2p=error')
        expect(result).toEqual([
          { subsystem: 'ipfs', level: 'debug' },
          { subsystem: 'http', level: 'warn' },
          { subsystem: 'libp2p', level: 'error' }
        ])
      })

      it('should parse global level with subsystems', () => {
        const result = parseGologLevelString('info,ipfs=debug,http=warn')
        expect(result).toEqual([
          { subsystem: 'ipfs', level: 'debug' },
          { subsystem: 'http', level: 'warn' },
          { subsystem: '*', level: 'info' }
        ])
      })

      it('should parse complex mixed configuration', () => {
        const result = parseGologLevelString('warn,ipfs=debug,http=error,libp2p=panic')
        expect(result).toEqual([
          { subsystem: 'ipfs', level: 'debug' },
          { subsystem: 'http', level: 'error' },
          { subsystem: 'libp2p', level: 'panic' },
          { subsystem: '*', level: 'warn' }
        ])
      })

      it('should handle empty subsystem level gracefully', () => {
        const result = parseGologLevelString('ipfs=')
        expect(result).toEqual([])
      })

      it('should handle whitespace-only subsystem level', () => {
        const result = parseGologLevelString('ipfs=   ')
        expect(result).toEqual([])
      })
    })

    describe('edge cases', () => {
      it('should handle multiple commas', () => {
        const result = parseGologLevelString('debug,,,info')
        expect(result).toEqual([{ subsystem: '*', level: 'debug' }])
      })

      it('should handle leading/trailing commas', () => {
        const result = parseGologLevelString(',debug,')
        expect(result).toEqual([{ subsystem: '*', level: 'debug' }])
      })

      it('should handle multiple equals signs', () => {
        const result = parseGologLevelString('ipfs=debug=extra')
        expect(result).toEqual([{ subsystem: 'ipfs', level: 'debug=extra' }])
      })
    })
  })

  describe('validateGologLevelString', () => {
    const validSubsystems = ['ipfs', 'http', 'libp2p', 'dht', 'pubsub']

    describe('happy path cases', () => {
      it('should validate empty string', () => {
        const result = validateGologLevelString('', validSubsystems)
        expect(result).toEqual({
          isValid: false,
          errorKey: 'logs.autocomplete.invalidInput',
          errorParams: {}
        })
      })

      it('should validate valid global level', () => {
        const result = validateGologLevelString('debug', validSubsystems)
        expect(result).toEqual({
          isValid: true,
          errorKey: '',
          errorParams: {}
        })
      })

      it('should validate valid subsystem level', () => {
        const result = validateGologLevelString('ipfs=debug', validSubsystems)
        expect(result).toEqual({
          isValid: true,
          errorKey: '',
          errorParams: {}
        })
      })

      it('should validate multiple valid subsystems', () => {
        const result = validateGologLevelString('ipfs=debug,http=warn', validSubsystems)
        expect(result).toEqual({
          isValid: true,
          errorKey: '',
          errorParams: {}
        })
      })

      it('should validate global level with subsystems', () => {
        const result = validateGologLevelString('info,ipfs=debug,http=warn', validSubsystems)
        expect(result).toEqual({
          isValid: true,
          errorKey: '',
          errorParams: {}
        })
      })

      it('should validate all log levels', () => {
        LOG_LEVELS.forEach(level => {
          const result = validateGologLevelString(`ipfs=${level}`, validSubsystems)
          expect(result.isValid).toBe(true)
        })
      })
    })

    describe('error cases', () => {
      it('should reject invalid subsystem', () => {
        const result = validateGologLevelString('invalid=debug', validSubsystems)
        expect(result).toEqual({
          isValid: false,
          errorKey: 'logs.autocomplete.invalidSubsystem',
          errorParams: { subsystem: 'invalid', subsystems: 'ipfs, http, libp2p, dht, pubsub' }
        })
      })

      it('should reject invalid log level', () => {
        const result = validateGologLevelString('ipfs=invalid', validSubsystems)
        expect(result).toEqual({
          isValid: false,
          errorKey: 'logs.autocomplete.invalidLevel',
          errorParams: { level: 'invalid' }
        })
      })

      it('should reject invalid global level', () => {
        const result = validateGologLevelString('invalid', validSubsystems)
        expect(result).toEqual({
          isValid: false,
          errorKey: 'logs.autocomplete.invalidLevel',
          errorParams: { level: 'invalid' }
        })
      })

      it('should reject subsystem without level', () => {
        const result = validateGologLevelString('ipfs=', validSubsystems)
        expect(result).toEqual({
          isValid: false,
          errorKey: 'logs.autocomplete.invalidSubsystemLevel',
          errorParams: { subsystem: 'ipfs', subsystems: 'ipfs, http, libp2p, dht, pubsub' }
        })
      })

      it('should reject valid subsystem without equals', () => {
        const result = validateGologLevelString('info,ipfs', validSubsystems)
        expect(result).toEqual({
          isValid: false,
          errorKey: 'logs.autocomplete.invalidSubsystemLevel',
          errorParams: { subsystem: 'ipfs', subsystems: 'ipfs, http, libp2p, dht, pubsub' }
        })
      })

      it('should reject multiple global levels', () => {
        const result = validateGologLevelString('debug,info', validSubsystems)
        expect(result).toEqual({
          isValid: false,
          errorKey: 'logs.autocomplete.invalidSubsystem',
          errorParams: { subsystem: 'info', subsystems: 'ipfs, http, libp2p, dht, pubsub' }
        })
      })

      it('should reject invalid subsystem after global level', () => {
        const result = validateGologLevelString('debug,invalid', validSubsystems)
        expect(result).toEqual({
          isValid: false,
          errorKey: 'logs.autocomplete.invalidSubsystem',
          errorParams: { subsystem: 'invalid', subsystems: 'ipfs, http, libp2p, dht, pubsub' }
        })
      })
    })
  })

  describe('subsystemsToActualLevels', () => {
    describe('happy path cases', () => {
      it('should convert global level only', () => {
        const subsystems = [{ subsystem: '*', level: 'debug' }]
        const result = subsystemsToActualLevels(subsystems)
        expect(result).toEqual({ '(default)': 'debug' })
      })

      it('should convert global level with different subsystem levels', () => {
        const subsystems = [
          { subsystem: '*', level: 'info' },
          { subsystem: 'ipfs', level: 'debug' },
          { subsystem: 'http', level: 'error' }
        ]
        const result = subsystemsToActualLevels(subsystems)
        expect(result).toEqual({
          '(default)': 'info',
          ipfs: 'debug',
          http: 'error'
        })
      })

      it('should not include subsystems with same level as global', () => {
        const subsystems = [
          { subsystem: '*', level: 'info' },
          { subsystem: 'ipfs', level: 'info' },
          { subsystem: 'http', level: 'debug' }
        ]
        const result = subsystemsToActualLevels(subsystems)
        expect(result).toEqual({
          '(default)': 'info',
          http: 'debug'
        })
      })

      it('should handle (default) subsystem', () => {
        const subsystems = [
          { subsystem: '(default)', level: 'warn' },
          { subsystem: 'ipfs', level: 'debug' }
        ]
        const result = subsystemsToActualLevels(subsystems)
        expect(result).toEqual({
          '(default)': 'warn',
          ipfs: 'debug'
        })
      })

      it('should use info as default when no global level', () => {
        const subsystems = [
          { subsystem: 'ipfs', level: 'debug' },
          { subsystem: 'http', level: 'error' }
        ]
        const result = subsystemsToActualLevels(subsystems)
        expect(result).toEqual({
          '(default)': 'info',
          ipfs: 'debug',
          http: 'error'
        })
      })
    })

    describe('edge cases', () => {
      it('should handle empty array', () => {
        const result = subsystemsToActualLevels([])
        expect(result).toEqual({ '(default)': 'info' })
      })

      it('should handle multiple global levels (use first)', () => {
        const subsystems = [
          { subsystem: '*', level: 'debug' },
          { subsystem: '(default)', level: 'info' }
        ]
        const result = subsystemsToActualLevels(subsystems)
        expect(result).toEqual({ '(default)': 'debug' })
      })
    })
  })

  describe('calculateGologLevelString', () => {
    describe('happy path cases', () => {
      it('should calculate from global level only', () => {
        const actualLevels = { '(default)': 'debug' }
        const result = calculateGologLevelString(actualLevels)
        expect(result).toBe('debug')
      })

      it('should calculate from global level with subsystems', () => {
        const actualLevels = {
          '(default)': 'info',
          ipfs: 'debug',
          http: 'error'
        }
        const result = calculateGologLevelString(actualLevels)
        expect(result).toBe('info,ipfs=debug,http=error')
      })

      it('should exclude subsystems with same level as global', () => {
        const actualLevels = {
          '(default)': 'info',
          ipfs: 'info',
          http: 'debug'
        }
        const result = calculateGologLevelString(actualLevels)
        expect(result).toBe('info,http=debug')
      })

      it('should handle complex configuration', () => {
        const actualLevels = {
          '(default)': 'warn',
          ipfs: 'debug',
          http: 'error',
          libp2p: 'panic',
          dht: 'warn' // Same as global, should be excluded
        }
        const result = calculateGologLevelString(actualLevels)
        expect(result).toBe('warn,ipfs=debug,http=error,libp2p=panic')
      })
    })

    describe('edge cases', () => {
      it('should return null for empty object', () => {
        const result = calculateGologLevelString({})
        expect(result).toBeNull()
      })

      it('should handle only global level', () => {
        const actualLevels = { '(default)': 'info' }
        const result = calculateGologLevelString(actualLevels)
        expect(result).toBe('info')
      })
    })
  })

  describe('parseInputContext', () => {
    describe('happy path cases', () => {
      it('should parse cursor at start of empty input', () => {
        const result = parseInputContext('', 0)
        expect(result).toEqual({
          currentPartIndex: 0,
          currentPartStart: 0,
          currentPart: '',
          beforeCursor: '',
          afterCursor: '',
          isInSubsystemPart: false,
          isComplete: false,
          isAtEndOfCompletePart: false
        })
      })

      it('should parse cursor in global level', () => {
        const result = parseInputContext('debug', 2)
        expect(result).toEqual({
          currentPartIndex: 0,
          currentPartStart: 0,
          currentPart: 'debug',
          beforeCursor: 'de',
          afterCursor: 'bug',
          isInSubsystemPart: false,
          isComplete: true,
          isAtEndOfCompletePart: false
        })
      })

      it('should parse cursor at end of complete global level', () => {
        const result = parseInputContext('debug', 5)
        expect(result).toEqual({
          currentPartIndex: 0,
          currentPartStart: 0,
          currentPart: 'debug',
          beforeCursor: 'debug',
          afterCursor: '',
          isInSubsystemPart: false,
          isComplete: true,
          isAtEndOfCompletePart: true
        })
      })

      it('should parse cursor in subsystem part', () => {
        const result = parseInputContext('ipfs=debug', 6)
        expect(result).toEqual({
          currentPartIndex: 0,
          currentPartStart: 0,
          currentPart: 'ipfs=debug',
          beforeCursor: 'ipfs=d',
          afterCursor: 'ebug',
          isInSubsystemPart: true,
          isComplete: true,
          isAtEndOfCompletePart: false
        })
      })

      it('should parse cursor in second part', () => {
        const result = parseInputContext('debug,ipfs=info', 8)
        expect(result).toEqual({
          currentPartIndex: 1,
          currentPartStart: 6,
          currentPart: 'ipfs=info',
          beforeCursor: 'debug,ip',
          afterCursor: 'fs=info',
          isInSubsystemPart: false,
          isComplete: true,
          isAtEndOfCompletePart: false
        })
      })

      it('should parse incomplete subsystem level', () => {
        const result = parseInputContext('ipfs=', 5)
        expect(result).toEqual({
          currentPartIndex: 0,
          currentPartStart: 0,
          currentPart: 'ipfs=',
          beforeCursor: 'ipfs=',
          afterCursor: '',
          isInSubsystemPart: true,
          isComplete: false,
          isAtEndOfCompletePart: false
        })
      })
    })

    describe('edge cases', () => {
      it('should handle cursor beyond input length', () => {
        const result = parseInputContext('debug', 10)
        expect(result.currentPartIndex).toBe(0)
        expect(result.currentPart).toBe('debug')
      })

      it('should handle multiple commas', () => {
        const result = parseInputContext('debug,,,info', 8)
        expect(result.currentPartIndex).toBe(3)
        expect(result.currentPart).toBe('info')
      })
    })
  })

  describe('isValidLogLevel', () => {
    describe('happy path cases', () => {
      it('should validate all valid log levels', () => {
        LOG_LEVELS.forEach(level => {
          expect(isValidLogLevel(level)).toBe(true)
        })
      })

      it('should validate case-insensitive levels', () => {
        expect(isValidLogLevel('DEBUG')).toBe(true)
        expect(isValidLogLevel('Debug')).toBe(true)
        expect(isValidLogLevel('debug')).toBe(true)
      })
    })

    describe('error cases', () => {
      it('should reject invalid levels', () => {
        expect(isValidLogLevel('invalid')).toBe(false)
        expect(isValidLogLevel('')).toBe(false)
        expect(isValidLogLevel('debugx')).toBe(false)
        expect(isValidLogLevel('xdebug')).toBe(false)
      })
    })
  })

  describe('getAutocompleteSuggestions', () => {
    const subsystems = [
      { name: 'ipfs', level: 'info' },
      { name: 'http', level: 'warn' },
      { name: 'libp2p', level: 'debug' },
      { name: 'dht', level: 'error' }
    ]

    describe('happy path cases', () => {
      it('should suggest global levels for first part', () => {
        const result = getAutocompleteSuggestions('', 0, subsystems)
        expect(result).toHaveLength(LOG_LEVELS.length + subsystems.length)
        expect(result.some(s => s.type === 'global' && s.value === 'debug')).toBe(true)
        expect(result.some(s => s.type === 'subsystem' && s.value === 'ipfs=')).toBe(true)
      })

      it('should suggest levels for subsystem part', () => {
        const result = getAutocompleteSuggestions('ipfs=', 5, subsystems)
        expect(result).toHaveLength(LOG_LEVELS.length)
        expect(result.every(s => s.type === 'level')).toBe(true)
        expect(result.some(s => s.value === 'debug')).toBe(true)
      })

      it('should suggest levels for incomplete subsystem level', () => {
        const result = getAutocompleteSuggestions('ipfs=de', 7, subsystems)
        expect(result).toHaveLength(LOG_LEVELS.length)
        expect(result.every(s => s.type === 'level')).toBe(true)
      })

      it('should filter subsystems by name', () => {
        const result = getAutocompleteSuggestions('ip', 2, subsystems)
        const subsystemSuggestions = result.filter(s => s.type === 'subsystem')
        expect(subsystemSuggestions).toHaveLength(1)
        expect(subsystemSuggestions[0].value).toBe('ipfs=')
      })

      it('should suggest subsystems for second part', () => {
        const result = getAutocompleteSuggestions('debug,', 6, subsystems)
        expect(result.some(s => s.type === 'subsystem' && s.value === 'ipfs=')).toBe(true)
      })
    })

    describe('edge cases', () => {
      it('should handle empty subsystems array', () => {
        const result = getAutocompleteSuggestions('', 0, [])
        expect(result).toHaveLength(LOG_LEVELS.length)
        expect(result.every(s => s.type === 'global')).toBe(true)
      })

      it('should handle case-insensitive subsystem filtering', () => {
        const result = getAutocompleteSuggestions('IPFS', 4, subsystems)
        const subsystemSuggestions = result.filter(s => s.type === 'subsystem')
        expect(subsystemSuggestions).toHaveLength(1)
        expect(subsystemSuggestions[0].value).toBe('ipfs=')
      })
    })
  })
})

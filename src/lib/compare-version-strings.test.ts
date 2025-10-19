import { cmpVersionStrings } from './compare-version-strings'
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { Spied } from 'jest-mock'

describe('cmpVersionStrings', () => {
  let consoleWarnSpy: Spied<typeof console.warn>

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  describe('numeric version comparisons', () => {
    it('compares identical versions as equal', () => {
      expect(cmpVersionStrings('1.0.0', '1.0.0')).toBe(0)
      expect(cmpVersionStrings('2.1.3', '2.1.3')).toBe(0)
    })

    it('compares version order correctly', () => {
      expect(cmpVersionStrings('1.0.0', '1.0.1')).toBe(-1)
      expect(cmpVersionStrings('1.0.1', '1.0.0')).toBe(1)
      expect(cmpVersionStrings('1.0.0', '1.1.0')).toBe(-1)
      expect(cmpVersionStrings('1.1.0', '1.0.0')).toBe(1)
    })
  })

  describe('version segments', () => {
    it('treats missing segments as equal', () => {
      expect(cmpVersionStrings('1.0', '1.0.0')).toBe(0)
      expect(cmpVersionStrings('1', '1.0.0')).toBe(0)
    })

    it('handles single segment versions', () => {
      expect(cmpVersionStrings('1', '2')).toBe(-1)
      expect(cmpVersionStrings('2', '1')).toBe(1)
      expect(cmpVersionStrings('1', '1')).toBe(0)
    })
  })

  describe('pre-release identifiers', () => {
    it('strips pre-release identifiers and treats as equal', () => {
      expect(cmpVersionStrings('1.0.0-alpha', '1.0.0')).toBe(0)
      expect(cmpVersionStrings('1.0.0-beta', '1.0.0-alpha')).toBe(0)
      expect(cmpVersionStrings('1.0.0-rc1', '1.0.0')).toBe(0)
    })

    it('compares different base versions correctly', () => {
      expect(cmpVersionStrings('1.0.0-alpha', '1.0.1-beta')).toBe(-1)
      expect(cmpVersionStrings('1.0.1-beta', '1.0.0-alpha')).toBe(1)
    })
  })

  describe('build metadata', () => {
    it('ignores build metadata in comparison', () => {
      expect(cmpVersionStrings('1.0.0+build1', '1.0.0+build2')).toBe(0)
      expect(cmpVersionStrings('1.0.0+build1', '1.0.0')).toBe(0)
    })
  })

  describe('non-numeric segments', () => {
    it('compares non-numeric segments lexicographically in last position', () => {
      expect(cmpVersionStrings('1.0.0a', '1.0.0b')).toBe(-1)
      expect(cmpVersionStrings('1.0.0b', '1.0.0a')).toBe(1)
      expect(cmpVersionStrings('1.0.0a', '1.0.0a')).toBe(0)
    })

    it('warns for non-numeric segments in non-last positions', () => {
      expect(cmpVersionStrings('1.a.0', '1.b.0')).toBe(-1)
      expect(cmpVersionStrings('1.b.0', '1.a.0')).toBe(0)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Non-numeric segments in version strings:',
        'a',
        'b'
      )
    })
  })

  describe('edge cases', () => {
    it('handles zero values', () => {
      expect(cmpVersionStrings('0.0.0', '0.0.0')).toBe(0)
      expect(cmpVersionStrings('0.0.0', '0.0.1')).toBe(-1)
      expect(cmpVersionStrings('0.0.1', '0.0.0')).toBe(1)
    })

    it('handles large numbers', () => {
      expect(cmpVersionStrings('999.999.999', '1000.0.0')).toBe(-1)
      expect(cmpVersionStrings('1000.0.0', '999.999.999')).toBe(1)
    })

    it('handles empty strings', () => {
      expect(cmpVersionStrings('', '1.0.0')).toBe(-1)
      expect(cmpVersionStrings('1.0.0', '')).toBe(1)
      expect(cmpVersionStrings('', '')).toBe(0)
    })

    it('handles leading zeros', () => {
      expect(cmpVersionStrings('01.02.03', '1.2.3')).toBe(0)
      expect(cmpVersionStrings('01.02.03', '1.2.4')).toBe(-1)
    })

    it('handles very long version strings', () => {
      const longVersion = '1.2.3.4.5.6.7.8.9.10'
      const longerVersion = '1.2.3.4.5.6.7.8.9.10.11'

      expect(cmpVersionStrings(longVersion, longerVersion)).toBe(-1)
      expect(cmpVersionStrings(longerVersion, longVersion)).toBe(1)
    })

    it('handles mixed pre-release and build metadata', () => {
      expect(cmpVersionStrings('1.0.0-alpha+build1', '1.0.0+build2')).toBe(0)
      expect(cmpVersionStrings('1.0.0-alpha+build1', '1.0.0-beta+build2')).toBe(0)
    })
  })

  describe('real-world examples', () => {
    it('handles IPFS version comparisons', () => {
      expect(cmpVersionStrings('0.20.0', '0.21.0')).toBe(-1)
      expect(cmpVersionStrings('0.21.0', '0.20.0')).toBe(1)
      expect(cmpVersionStrings('0.21.0-rc1', '0.21.0')).toBe(0)
    })

    it('handles semantic versioning patterns', () => {
      expect(cmpVersionStrings('1.0.0', '1.0.1')).toBe(-1)
      expect(cmpVersionStrings('1.1.0', '1.0.9')).toBe(1)
      expect(cmpVersionStrings('2.0.0', '1.9.9')).toBe(1)
    })
  })

  describe('error handling', () => {
    it('handles malformed version strings gracefully', () => {
      expect(cmpVersionStrings('1.a.2', '1.b.2')).toBe(-1)
      expect(cmpVersionStrings('1.b.2', '1.a.2')).toBe(0)
      expect(cmpVersionStrings('1.0.a', '1.0.b')).toBe(-1)
      expect(cmpVersionStrings('1.0.b', '1.0.a')).toBe(1)
    })
  })
})

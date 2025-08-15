import { parseAgentVersion, AgentVersionObject } from './parse-agent-version'
import { describe, it, expect } from '@jest/globals'

describe('parseAgentVersion', () => {
  describe('with kubo agent (supported provider)', () => {
    it('should parse kubo with version and suffix', () => {
      const result = parseAgentVersion('/kubo/0.14.0/desktop')

      const expected: AgentVersionObject = {
        name: 'kubo',
        version: '0.14.0',
        suffix: 'desktop',
        url: 'https://github.com/ipfs/kubo'
      }

      expect(result).toEqual(expected)
    })

    it('should parse kubo with version but no suffix', () => {
      const result = parseAgentVersion('/kubo/0.14.0')

      const expected: AgentVersionObject = {
        name: 'kubo',
        version: '0.14.0',
        suffix: '',
        url: 'https://github.com/ipfs/kubo'
      }

      expect(result).toEqual(expected)
    })

    it('should parse kubo with version and multiple suffix parts', () => {
      const result = parseAgentVersion('/kubo/0.14.0/desktop/stable')

      const expected: AgentVersionObject = {
        name: 'kubo',
        version: '0.14.0',
        suffix: 'desktop/stable',
        url: 'https://github.com/ipfs/kubo'
      }

      expect(result).toEqual(expected)
    })

    it('should parse kubo with only name', () => {
      const result = parseAgentVersion('/kubo')

      const expected: AgentVersionObject = {
        name: 'kubo',
        // @ts-expect-error - version is not provided
        version: undefined,
        suffix: '',
        url: 'https://github.com/ipfs/kubo'
      }

      expect(result).toEqual(expected)
    })

    it('should parse kubo with empty version part', () => {
      const result = parseAgentVersion('/kubo//desktop')

      const expected: AgentVersionObject = {
        name: 'kubo',
        version: 'desktop',
        suffix: '',
        url: 'https://github.com/ipfs/kubo'
      }

      expect(result).toEqual(expected)
    })

    it('should parse kubo with special characters in version', () => {
      const result = parseAgentVersion('/kubo/0.14.0-rc1/desktop-beta')

      const expected: AgentVersionObject = {
        name: 'kubo',
        version: '0.14.0-rc1',
        suffix: 'desktop-beta',
        url: 'https://github.com/ipfs/kubo'
      }

      expect(result).toEqual(expected)
    })
  })

  describe('with unsupported agent', () => {
    it('should parse go-ipfs with version and suffix', () => {
      const result = parseAgentVersion('/go-ipfs/0.14.0/desktop')

      const expected: AgentVersionObject = {
        name: 'go-ipfs',
        version: '0.14.0',
        suffix: 'desktop',
        url: null
      }

      expect(result).toEqual(expected)
    })

    it('should parse go-ipfs with version but no suffix', () => {
      const result = parseAgentVersion('/go-ipfs/0.14.0')

      const expected: AgentVersionObject = {
        name: 'go-ipfs',
        version: '0.14.0',
        suffix: '',
        url: null
      }

      expect(result).toEqual(expected)
    })

    it('should parse go-ipfs with only name', () => {
      const result = parseAgentVersion('/go-ipfs')

      const expected: AgentVersionObject = {
        name: 'go-ipfs',
        // @ts-expect-error - version is not provided
        version: undefined,
        suffix: '',
        url: null
      }

      expect(result).toEqual(expected)
    })

    it('should parse unsupported agent with special characters', () => {
      const result = parseAgentVersion('/unsupported-agent/1.2.3-rc1/beta')

      const expected: AgentVersionObject = {
        name: 'unsupported-agent',
        version: '1.2.3-rc1',
        suffix: 'beta',
        url: null
      }

      expect(result).toEqual(expected)
    })
  })

  describe('with complex agent versions', () => {
    it('should handle multiple slashes and empty parts', () => {
      const result = parseAgentVersion('///kubo///0.14.0///desktop///')

      const expected: AgentVersionObject = {
        name: 'kubo',
        version: '0.14.0',
        suffix: 'desktop',
        url: 'https://github.com/ipfs/kubo'
      }

      expect(result).toEqual(expected)
    })

    it('should handle agent version with spaces', () => {
      const result = parseAgentVersion('/kubo /0.14.0/desktop')

      const expected: AgentVersionObject = {
        name: 'kubo ',
        version: '0.14.0',
        suffix: 'desktop',
        url: null
      }

      expect(result).toEqual(expected)
    })

    it('should handle very long agent version strings', () => {
      const longSuffix = 'a'.repeat(1000)
      const result = parseAgentVersion(`/kubo/0.14.0/${longSuffix}`)

      const expected: AgentVersionObject = {
        name: 'kubo',
        version: '0.14.0',
        suffix: longSuffix,
        url: 'https://github.com/ipfs/kubo'
      }

      expect(result).toEqual(expected)
    })

    it('should handle agent version with only slashes', () => {
      const result = parseAgentVersion('///')

      const expected: AgentVersionObject = {
        // @ts-expect-error - name is not provided
        name: undefined,
        // @ts-expect-error - version is not provided
        version: undefined,
        suffix: '',
        url: null
      }

      expect(result).toEqual(expected)
    })

    it('should handle empty string', () => {
      const result = parseAgentVersion('')

      const expected: AgentVersionObject = {
        // @ts-expect-error - name is not provided
        name: undefined,
        // @ts-expect-error - version is not provided
        version: undefined,
        suffix: '',
        url: null
      }

      expect(result).toEqual(expected)
    })

    it('should handle single slash', () => {
      const result = parseAgentVersion('/')

      const expected: AgentVersionObject = {
        // @ts-expect-error - name is not provided
        name: undefined,
        // @ts-expect-error - version is not provided
        version: undefined,
        suffix: '',
        url: null
      }

      expect(result).toEqual(expected)
    })

    it('should handle double slash', () => {
      const result = parseAgentVersion('//')

      const expected: AgentVersionObject = {
        // @ts-expect-error - name is not provided
        name: undefined,
        // @ts-expect-error - version is not provided
        version: undefined,
        suffix: '',
        url: null
      }

      expect(result).toEqual(expected)
    })
  })

  describe('edge cases', () => {
    it('should handle agent version with dots in name', () => {
      const result = parseAgentVersion('/kubo.test/0.14.0/desktop')

      const expected: AgentVersionObject = {
        name: 'kubo.test',
        version: '0.14.0',
        suffix: 'desktop',
        url: null
      }

      expect(result).toEqual(expected)
    })

    it('should handle agent version with underscores in name', () => {
      const result = parseAgentVersion('/kubo_test/0.14.0/desktop')

      const expected: AgentVersionObject = {
        name: 'kubo_test',
        version: '0.14.0',
        suffix: 'desktop',
        url: null
      }

      expect(result).toEqual(expected)
    })

    it('should handle agent version with hyphens in name', () => {
      const result = parseAgentVersion('/kubo-test/0.14.0/desktop')

      const expected: AgentVersionObject = {
        name: 'kubo-test',
        version: '0.14.0',
        suffix: 'desktop',
        url: null
      }

      expect(result).toEqual(expected)
    })

    it('should handle version with multiple dots', () => {
      const result = parseAgentVersion('/kubo/0.14.0.1/desktop')

      const expected: AgentVersionObject = {
        name: 'kubo',
        version: '0.14.0.1',
        suffix: 'desktop',
        url: 'https://github.com/ipfs/kubo'
      }

      expect(result).toEqual(expected)
    })

    it('should handle suffix with special characters', () => {
      const result = parseAgentVersion('/kubo/0.14.0/desktop-beta_v2.1')

      const expected: AgentVersionObject = {
        name: 'kubo',
        version: '0.14.0',
        suffix: 'desktop-beta_v2.1',
        url: 'https://github.com/ipfs/kubo'
      }

      expect(result).toEqual(expected)
    })

    it('should handle case sensitivity in agent name', () => {
      const result = parseAgentVersion('/KUBO/0.14.0/desktop')

      const expected: AgentVersionObject = {
        name: 'KUBO',
        version: '0.14.0',
        suffix: 'desktop',
        url: null
      }

      expect(result).toEqual(expected)
    })
  })

  describe('return type validation', () => {
    it('should return correct interface structure', () => {
      const result = parseAgentVersion('/kubo/0.14.0/desktop')

      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('version')
      expect(result).toHaveProperty('suffix')
      expect(result).toHaveProperty('url')

      expect(typeof result.name).toBe('string')
      expect(typeof result.version).toBe('string')
      expect(typeof result.suffix).toBe('string')
      expect(typeof result.url === 'string' || result.url === null).toBe(true)
    })

    it('should handle undefined version correctly', () => {
      const result = parseAgentVersion('/kubo')

      expect(result.version).toBeUndefined()
      expect(result.name).toBe('kubo')
      expect(result.suffix).toBe('')
      expect(result.url).toBe('https://github.com/ipfs/kubo')
    })

    it('should handle null url for unsupported agents', () => {
      const result = parseAgentVersion('/unsupported/1.2.3')

      expect(result.url).toBeNull()
      expect(result.name).toBe('unsupported')
      expect(result.version).toBe('1.2.3')
      expect(result.suffix).toBe('')
    })
  })
})

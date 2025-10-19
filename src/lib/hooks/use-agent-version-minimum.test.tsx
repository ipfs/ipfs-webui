import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { useAgentVersionMinimum, type UseAgentVersionMinimumProps } from './use-agent-version-minimum'
import { type AgentVersionObject } from '../parse-agent-version'
import { useIdentity } from '../../contexts/identity-context'
import * as compareVersionStringsModule from '../compare-version-strings'

// Mock the identity context
jest.mock('../../contexts/identity-context', () => ({
  useIdentity: jest.fn()
}))

const mockUseIdentity = useIdentity as jest.MockedFunction<typeof useIdentity>

// Spy on cmpVersionStrings to track calls while using real implementation
const cmpVersionStringsSpy = jest.spyOn(compareVersionStringsModule, 'cmpVersionStrings')

/**
 * Test component to render the hook
 * TODO: when we can upgrade react, we can use `renderHook` from `@testing-library/react` instead.
 */
const TestComponent: React.FC<{ props: UseAgentVersionMinimumProps }> = ({ props }) => {
  const result = useAgentVersionMinimum(props)
  return (
    <div>
      <span data-testid="ok">{result.ok.toString()}</span>
      <span data-testid="parsed">{result.parsed ? JSON.stringify(result.parsed) : 'null'}</span>
    </div>
  )
}

/**
 * Test data constants for consistent version testing
 */
const TEST_VERSIONS = {
  BELOW_MINIMUM: '0.13.0',
  EQUAL_TO_MINIMUM: '0.14.0',
  ABOVE_MINIMUM: '0.15.0',
  WELL_ABOVE_MINIMUM: '0.16.0',
  MINIMUM_REQUIRED: '0.14.0'
} as const

const TEST_AGENTS = {
  KUBO: 'kubo',
  GO_IPFS: 'go-ipfs',
  KUBO_UPPERCASE: 'KUBO'
} as const

const TEST_FLAVORS = {
  DESKTOP: 'desktop',
  CLI: 'cli',
  DESKTOP_UPPERCASE: 'Desktop',
  EMPTY: '',
  COMPLEX: 'desktop-beta_v2.1'
} as const

describe('useAgentVersionMinimum', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Test utilities
   */
  const createMockAgentVersion = (overrides: Partial<AgentVersionObject> = {}): AgentVersionObject => ({
    name: TEST_AGENTS.KUBO,
    version: TEST_VERSIONS.EQUAL_TO_MINIMUM,
    suffix: TEST_FLAVORS.DESKTOP,
    url: 'https://github.com/ipfs/kubo',
    ...overrides
  })

  const setupMockIdentity = (agentVersion: AgentVersionObject | null): void => {
    mockUseIdentity.mockReturnValue({
      agentVersionObject: agentVersion
      // as any - because we don't care about the rest of the Identity type that `useIdentity` returns
    } as any)
  }

  const setupMockIdentitySequence = (...agentVersions: (AgentVersionObject | null)[]): void => {
    agentVersions.forEach(version => {
      mockUseIdentity.mockReturnValueOnce({ agentVersionObject: version } as any)
    })
  }

  const expectHookResult = (
    getByTestId: ReturnType<typeof render>['getByTestId'],
    expectedOk: boolean,
    expectedParsed: AgentVersionObject | null
  ): void => {
    expect(getByTestId('ok')).toHaveTextContent(expectedOk.toString())
    expect(getByTestId('parsed')).toHaveTextContent(
      expectedParsed ? JSON.stringify(expectedParsed) : 'null'
    )
  }

  const createBasicProps = (overrides: Partial<UseAgentVersionMinimumProps> = {}): UseAgentVersionMinimumProps => ({
    minimumVersion: TEST_VERSIONS.MINIMUM_REQUIRED,
    ...overrides
  })

  describe('version comparison', () => {
    it('returns true when agent version exceeds minimum', () => {
      const mockAgentVersion = createMockAgentVersion({ version: TEST_VERSIONS.ABOVE_MINIMUM })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps()} />)

      expectHookResult(getByTestId, true, mockAgentVersion)
      expect(cmpVersionStringsSpy).toHaveBeenCalledWith(TEST_VERSIONS.ABOVE_MINIMUM, TEST_VERSIONS.MINIMUM_REQUIRED)
    })

    it('returns true when agent version equals minimum', () => {
      const mockAgentVersion = createMockAgentVersion({ version: TEST_VERSIONS.EQUAL_TO_MINIMUM })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps()} />)

      expectHookResult(getByTestId, true, mockAgentVersion)
      expect(cmpVersionStringsSpy).toHaveBeenCalledWith(TEST_VERSIONS.EQUAL_TO_MINIMUM, TEST_VERSIONS.MINIMUM_REQUIRED)
    })

    it('returns false when agent version is below minimum', () => {
      const mockAgentVersion = createMockAgentVersion({ version: TEST_VERSIONS.BELOW_MINIMUM })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps()} />)

      expectHookResult(getByTestId, false, mockAgentVersion)
      expect(cmpVersionStringsSpy).toHaveBeenCalledWith(TEST_VERSIONS.BELOW_MINIMUM, TEST_VERSIONS.MINIMUM_REQUIRED)
    })
  })

  describe('agent name filtering', () => {
    it('returns true when required agent matches', () => {
      const mockAgentVersion = createMockAgentVersion({ name: TEST_AGENTS.KUBO, version: TEST_VERSIONS.ABOVE_MINIMUM })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps({ requiredAgent: TEST_AGENTS.KUBO })} />)

      expectHookResult(getByTestId, true, mockAgentVersion)
    })

    it('returns false when required agent does not match', () => {
      const mockAgentVersion = createMockAgentVersion({ name: TEST_AGENTS.GO_IPFS, version: TEST_VERSIONS.ABOVE_MINIMUM })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps({ requiredAgent: TEST_AGENTS.KUBO })} />)

      expectHookResult(getByTestId, false, mockAgentVersion)
      expect(cmpVersionStringsSpy).not.toHaveBeenCalled()
    })

    it('ignores agent requirement when not specified', () => {
      const mockAgentVersion = createMockAgentVersion({ name: TEST_AGENTS.GO_IPFS, version: TEST_VERSIONS.ABOVE_MINIMUM })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps()} />)

      expectHookResult(getByTestId, true, mockAgentVersion)
      expect(cmpVersionStringsSpy).toHaveBeenCalledWith(TEST_VERSIONS.ABOVE_MINIMUM, TEST_VERSIONS.MINIMUM_REQUIRED)
    })
  })

  describe('flavor/suffix filtering', () => {
    it('returns true when required flavor matches', () => {
      const mockAgentVersion = createMockAgentVersion({
        version: TEST_VERSIONS.ABOVE_MINIMUM,
        suffix: TEST_FLAVORS.DESKTOP
      })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps({ requiredFlavor: TEST_FLAVORS.DESKTOP })} />)

      expectHookResult(getByTestId, true, mockAgentVersion)
    })

    it('returns false when required flavor does not match', () => {
      const mockAgentVersion = createMockAgentVersion({
        version: TEST_VERSIONS.ABOVE_MINIMUM,
        suffix: TEST_FLAVORS.CLI
      })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps({ requiredFlavor: TEST_FLAVORS.DESKTOP })} />)

      expectHookResult(getByTestId, false, mockAgentVersion)
      expect(cmpVersionStringsSpy).not.toHaveBeenCalled()
    })

    it('ignores flavor requirement when not specified', () => {
      const mockAgentVersion = createMockAgentVersion({
        version: TEST_VERSIONS.ABOVE_MINIMUM,
        suffix: TEST_FLAVORS.DESKTOP
      })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps()} />)

      expectHookResult(getByTestId, true, mockAgentVersion)
      expect(cmpVersionStringsSpy).toHaveBeenCalledWith(TEST_VERSIONS.ABOVE_MINIMUM, TEST_VERSIONS.MINIMUM_REQUIRED)
    })

    it('handles empty suffix correctly', () => {
      const mockAgentVersion = createMockAgentVersion({
        version: TEST_VERSIONS.ABOVE_MINIMUM,
        suffix: TEST_FLAVORS.EMPTY
      })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps({ requiredFlavor: TEST_FLAVORS.EMPTY })} />)

      expectHookResult(getByTestId, true, mockAgentVersion)
    })

    it('returns false when agent has empty suffix but flavor is required', () => {
      const mockAgentVersion = createMockAgentVersion({
        version: TEST_VERSIONS.ABOVE_MINIMUM,
        suffix: TEST_FLAVORS.EMPTY
      })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps({ requiredFlavor: TEST_FLAVORS.DESKTOP })} />)

      expectHookResult(getByTestId, false, mockAgentVersion)
      expect(cmpVersionStringsSpy).not.toHaveBeenCalled()
    })
  })

  describe('combined filtering', () => {
    it('returns true when both agent and flavor match', () => {
      const mockAgentVersion = createMockAgentVersion({
        name: TEST_AGENTS.KUBO,
        version: TEST_VERSIONS.ABOVE_MINIMUM,
        suffix: TEST_FLAVORS.DESKTOP
      })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps({
        requiredAgent: TEST_AGENTS.KUBO,
        requiredFlavor: TEST_FLAVORS.DESKTOP
      })} />)

      expectHookResult(getByTestId, true, mockAgentVersion)
      expect(cmpVersionStringsSpy).toHaveBeenCalledWith(TEST_VERSIONS.ABOVE_MINIMUM, TEST_VERSIONS.MINIMUM_REQUIRED)
    })

    it('returns false when agent matches but flavor does not', () => {
      const mockAgentVersion = createMockAgentVersion({
        name: TEST_AGENTS.KUBO,
        version: TEST_VERSIONS.ABOVE_MINIMUM,
        suffix: TEST_FLAVORS.CLI
      })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps({
        requiredAgent: TEST_AGENTS.KUBO,
        requiredFlavor: TEST_FLAVORS.DESKTOP
      })} />)

      expectHookResult(getByTestId, false, mockAgentVersion)
      expect(cmpVersionStringsSpy).not.toHaveBeenCalled()
    })

    it('returns false when flavor matches but agent does not', () => {
      const mockAgentVersion = createMockAgentVersion({
        name: TEST_AGENTS.GO_IPFS,
        version: TEST_VERSIONS.ABOVE_MINIMUM,
        suffix: TEST_FLAVORS.DESKTOP
      })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps({
        requiredAgent: TEST_AGENTS.KUBO,
        requiredFlavor: TEST_FLAVORS.DESKTOP
      })} />)

      expectHookResult(getByTestId, false, mockAgentVersion)
      expect(cmpVersionStringsSpy).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('returns false when agentVersionObject is null', () => {
      setupMockIdentity(null)

      const { getByTestId } = render(<TestComponent props={createBasicProps()} />)

      expectHookResult(getByTestId, false, null)
      expect(cmpVersionStringsSpy).not.toHaveBeenCalled()
    })

    it('returns false when agentVersionObject is undefined', () => {
      setupMockIdentity(undefined as any)

      const { getByTestId } = render(<TestComponent props={createBasicProps()} />)

      expectHookResult(getByTestId, false, null)
      expect(cmpVersionStringsSpy).not.toHaveBeenCalled()
    })

    it('performs case-sensitive agent name matching', () => {
      const mockAgentVersion = createMockAgentVersion({
        name: TEST_AGENTS.KUBO_UPPERCASE,
        version: TEST_VERSIONS.ABOVE_MINIMUM
      })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps({ requiredAgent: TEST_AGENTS.KUBO })} />)

      expectHookResult(getByTestId, false, mockAgentVersion)
      expect(cmpVersionStringsSpy).not.toHaveBeenCalled()
    })

    it('performs case-sensitive flavor matching', () => {
      const mockAgentVersion = createMockAgentVersion({
        version: TEST_VERSIONS.ABOVE_MINIMUM,
        suffix: TEST_FLAVORS.DESKTOP_UPPERCASE
      })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps({ requiredFlavor: TEST_FLAVORS.DESKTOP })} />)

      expectHookResult(getByTestId, false, mockAgentVersion)
      expect(cmpVersionStringsSpy).not.toHaveBeenCalled()
    })
  })

  describe('return type validation', () => {
    it('returns correct interface structure', () => {
      const mockAgentVersion = createMockAgentVersion({ version: TEST_VERSIONS.ABOVE_MINIMUM })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps()} />)

      expect(getByTestId('ok')).toBeInTheDocument()
      expect(getByTestId('parsed')).toBeInTheDocument()
      expect(getByTestId('ok')).toHaveTextContent('true')
      expect(getByTestId('parsed')).toHaveTextContent(JSON.stringify(mockAgentVersion))
    })
  })

  describe('version format handling', () => {
    it('handles pre-release versions', () => {
      const mockAgentVersion = createMockAgentVersion({ version: '0.15.0-rc1' })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps()} />)

      expectHookResult(getByTestId, true, mockAgentVersion)
      expect(cmpVersionStringsSpy).toHaveBeenCalledWith('0.15.0-rc1', TEST_VERSIONS.MINIMUM_REQUIRED)
    })

    it('handles build metadata versions', () => {
      const mockAgentVersion = createMockAgentVersion({ version: '0.15.0+build.123' })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps()} />)

      expectHookResult(getByTestId, true, mockAgentVersion)
      expect(cmpVersionStringsSpy).toHaveBeenCalledWith('0.15.0+build.123', TEST_VERSIONS.MINIMUM_REQUIRED)
    })

    it('handles complex suffixes with special characters', () => {
      const mockAgentVersion = createMockAgentVersion({
        version: TEST_VERSIONS.ABOVE_MINIMUM,
        suffix: TEST_FLAVORS.COMPLEX
      })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps({ requiredFlavor: TEST_FLAVORS.COMPLEX })} />)

      expectHookResult(getByTestId, true, mockAgentVersion)
    })
  })

  describe('memoization', () => {
    it('memoizes result when dependencies do not change', () => {
      const mockAgentVersion = createMockAgentVersion({ version: TEST_VERSIONS.ABOVE_MINIMUM })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId, rerender } = render(<TestComponent props={createBasicProps()} />)

      const firstOk = getByTestId('ok').textContent
      const firstParsed = getByTestId('parsed').textContent

      rerender(<TestComponent props={createBasicProps()} />)

      expect(getByTestId('ok').textContent).toBe(firstOk)
      expect(getByTestId('parsed').textContent).toBe(firstParsed)
      expect(cmpVersionStringsSpy).toHaveBeenCalledTimes(1)
    })

    it('recalculates when minimumVersion changes', () => {
      const mockAgentVersion = createMockAgentVersion({ version: TEST_VERSIONS.ABOVE_MINIMUM })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId, rerender } = render(<TestComponent props={createBasicProps()} />)

      const firstOk = getByTestId('ok').textContent

      // Change to a higher minimum version that will make 0.15.0 < 0.16.0
      rerender(<TestComponent props={createBasicProps({ minimumVersion: TEST_VERSIONS.WELL_ABOVE_MINIMUM })} />)

      expect(getByTestId('ok').textContent).not.toBe(firstOk)
      expect(cmpVersionStringsSpy).toHaveBeenCalledTimes(2)
    })

    it('recalculates when agentVersionObject changes', () => {
      const mockAgentVersion1 = createMockAgentVersion({ version: TEST_VERSIONS.ABOVE_MINIMUM })
      const mockAgentVersion2 = createMockAgentVersion({ version: TEST_VERSIONS.WELL_ABOVE_MINIMUM })

      setupMockIdentitySequence(mockAgentVersion1, mockAgentVersion2)

      const { getByTestId, rerender } = render(<TestComponent props={createBasicProps()} />)

      expectHookResult(getByTestId, true, mockAgentVersion1)
      expect(cmpVersionStringsSpy).toHaveBeenCalledTimes(1)

      // This should trigger the second mock value
      rerender(<TestComponent props={createBasicProps()} />)

      expectHookResult(getByTestId, true, mockAgentVersion2)
      expect(cmpVersionStringsSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('injectable cmpVersionStrings', () => {
    it('uses custom cmpVersionStrings function when provided', () => {
      const mockAgentVersion = createMockAgentVersion({ version: TEST_VERSIONS.ABOVE_MINIMUM })
      setupMockIdentity(mockAgentVersion)

      const customCmpVersionStrings = jest.fn().mockReturnValue(-1) // Always return "below minimum"

      const { getByTestId } = render(<TestComponent props={createBasicProps({
        cmpVersionStrings: customCmpVersionStrings as typeof compareVersionStringsModule.cmpVersionStrings
      })} />)

      expectHookResult(getByTestId, false, mockAgentVersion)
      expect(customCmpVersionStrings).toHaveBeenCalledWith(TEST_VERSIONS.ABOVE_MINIMUM, TEST_VERSIONS.MINIMUM_REQUIRED)
      expect(cmpVersionStringsSpy).not.toHaveBeenCalled() // Should not use the default function
    })

    it('uses default cmpVersionStrings when custom function is not provided', () => {
      const mockAgentVersion = createMockAgentVersion({ version: TEST_VERSIONS.ABOVE_MINIMUM })
      setupMockIdentity(mockAgentVersion)

      const { getByTestId } = render(<TestComponent props={createBasicProps()} />)

      expectHookResult(getByTestId, true, mockAgentVersion)
      expect(cmpVersionStringsSpy).toHaveBeenCalledWith(TEST_VERSIONS.ABOVE_MINIMUM, TEST_VERSIONS.MINIMUM_REQUIRED)
    })
  })
})

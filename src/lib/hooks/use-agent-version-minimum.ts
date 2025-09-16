import { useMemo } from 'react'
import { useIdentity } from '../../contexts/identity-context'
import { type AgentVersionObject } from '../parse-agent-version'
import { cmpVersionStrings as defaultCmpVersionStrings } from '../compare-version-strings'

export interface UseAgentVersionMinimumProps {
  /**
   * Minimum required semantic version in x.y.z format (numbers only).
   * Example: "0.28.0"
   */
  minimumVersion: string
  /**
   * Optional required suffix/flavor, e.g. "desktop".
   * If provided, hook returns false unless the agent's suffix exactly matches.
   */
  requiredFlavor?: string
  /**
   * Optional required agent name, e.g. "kubo".
   * If provided, hook returns false unless the agent's name matches.
   */
  requiredAgent?: string
  /**
   * Optional version comparison function. Defaults to the built-in cmpVersionStrings.
   * Useful for testing or custom version comparison logic.
   */
  cmpVersionStrings?: (a: string, b: string) => -1 | 0 | 1
}

export interface UseAgentVersionMinimumResult {
  ok: boolean
  parsed: AgentVersionObject | null
}

/**
 * React hook that gates features based on the current node agent & version and potentially the suffix/flavor.
 */
export function useAgentVersionMinimum (props: UseAgentVersionMinimumProps): UseAgentVersionMinimumResult {
  const { minimumVersion, requiredFlavor, requiredAgent, cmpVersionStrings = defaultCmpVersionStrings } = props
  const { agentVersionObject } = useIdentity()

  const ok = useMemo(() => {
    if (agentVersionObject == null) return false

    // If name is required, enforce it
    if (requiredAgent != null && agentVersionObject.name !== requiredAgent) return false

    // If flavor is required, enforce exact match
    if (requiredFlavor != null && agentVersionObject.suffix !== requiredFlavor) return false

    return cmpVersionStrings(agentVersionObject.version, minimumVersion) >= 0
  }, [agentVersionObject, minimumVersion, requiredFlavor, requiredAgent, cmpVersionStrings])

  return { ok, parsed: agentVersionObject }
}

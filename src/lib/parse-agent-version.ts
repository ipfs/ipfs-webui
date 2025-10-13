export interface AgentVersionObject {
  /**
   * The supported IPFS node agents.
   */
  name: string
  version: string
  /**
   * The suffix of the IPFS node agent. For IPFS-Desktop, the suffix is 'desktop'.
   */
  suffix: string
  /**
   * The URL for the github repo of the IPFS node agent.
   *
   * This is used to link to the release page for the IPFS node agent, and must be specified in the `providers` object
   * below.
   */
  url: string | null
}

const providers: Record<string, { url: string }> = {
  kubo: {
    url: 'https://github.com/ipfs/kubo'
  }
}

const findUrl = (name: string): string | null => {
  const provider = providers[name]
  if (!provider) return null
  return provider.url
}

export function parseAgentVersion (agentVersion: string): AgentVersionObject {
  const parts = agentVersion.split('/').filter(str => !!str)
  const name = parts[0]
  const url = findUrl(name)
  const version = parts[1]
  const suffix = parts.slice(2).join('/')
  return { name, version, suffix, url }
}

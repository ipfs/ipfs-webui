export interface AgentVersionObject {
  name: string
  version: string
  suffix: string
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

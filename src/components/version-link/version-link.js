import React from 'react'

const providers = {
  kubo: {
    url: 'https://github.com/ipfs/kubo'
  }
}

const findUrl = name => {
  const provider = providers[name]
  if (!provider) return null
  return provider.url
}

// formats an ipfs agentVersion string from /kubo/0.14.0/desktop to kubo v0.14.0 desktop
const VersionLink = ({ agentVersion }) => {
  if (!agentVersion) return <span>Unknown</span>
  const parts = agentVersion.split('/').filter(str => !!str)
  const name = parts[0]
  const url = findUrl(name)
  const version = parts[1]
  const suffix = parts.slice(2).join('/')
  if (!url) {
    return (
      <span>
        {name}
        <ReleaseLink agent={name} version={version} />
        {suffix ? <span> {suffix}</span> : ''}
      </span>
    )
  }
  return (
    <span>
      <a href={url} className='link blue' target='_blank' rel='noopener noreferrer'>
        {name}
      </a>
      <ReleaseLink agent={name} version={version} />
      {suffix ? <span> {suffix}</span> : ''}
    </span>
  )
}

const ReleaseLink = ({ agent, version }) => {
  if (!version) return ''
  if (Object.prototype.hasOwnProperty.call(providers, agent)) {
    const releaseUrl = `${providers[agent].url}/releases/tag/v${version}`
    return (
      <a href={releaseUrl} className='link blue ml2' target='_blank' rel='noopener noreferrer'>
        v{version}
      </a>
    )
  }
  return ` v${version}`
}

export default VersionLink

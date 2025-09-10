import React from 'react'
import { parseAgentVersion } from '../../lib/parse-agent-version'

// formats an ipfs agentVersion string from /kubo/0.14.0/desktop to kubo v0.14.0 desktop
const VersionLink: React.FC<{ agentVersion: string }> = ({ agentVersion }) => {
  if (!agentVersion) return <span>Unknown</span>
  const { name, version, suffix, url } = parseAgentVersion(agentVersion)

  return (
    <span>
      <NameLink name={name} url={url} />
      <ReleaseLink version={version} url={url} />
      {suffix ? <span> {suffix}</span> : ''}
    </span>
  )
}

const NameLink: React.FC<{ name: string, url: string | null }> = ({ name, url }) => {
  if (url == null) {
    return <>{name}</>
  }
  return <a href={url} className='link blue' target='_blank' rel='noopener noreferrer'>{name}</a>
}

const ReleaseLink: React.FC<{ version: string, url: string | null }> = ({ version, url }) => {
  if (!version) return <></>
  if (url == null) {
    return <> v{version}</>
  }
  const releaseUrl = `${url}/releases/tag/v${version}`
  return (
    <a href={releaseUrl} className='link blue ml2' target='_blank' rel='noopener noreferrer'>
      v{version}
    </a>
  )
}

export default VersionLink

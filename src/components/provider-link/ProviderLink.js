import React from 'react'

const providers = {
  'ipfs-companion': {
    url: 'https://github.com/ipfs/ipfs-companion'
  },
  kubo: {
    url: 'https://github.com/ipfs/kubo'
  }
}

const findInfo = name => {
  const provider = providers[name]
  return provider || { name }
}

const ProviderLink = ({ name }) => {
  const info = findInfo(name)
  if (!info.url) {
    return <span>{info.name || name}</span>
  }
  return (
    <a href={info.url} className='link blue' target='_blank' rel='noopener noreferrer'>{info.name || name}</a>
  )
}

export default ProviderLink

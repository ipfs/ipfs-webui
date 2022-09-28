import React from 'react'
import Multiaddr from 'multiaddr'

const Address = ({ value }) => {
  if (!value) return null

  // future-proofing interop for multiaddr > 8.x
  value = value.buffer || value

  const ma = Multiaddr(value)
  const protos = ma.protoNames().concat(['ipfs', 'p2p'])
  const parts = ma.toString().split('/')

  return (
    <div className='charcoal-muted monospace'>
      {parts.map((chunk, i) => (
        <span key={i}>
          <span className={protos.includes(chunk) ? 'force-select' : 'force-select charcoal'}>{chunk}</span>
          {i < parts.length - 1 ? '/' : ''}
        </span>
      ))}
    </div>
  )
}

export default Address

import React from 'react'
import Multiaddr from 'multiaddr'

const Address = ({ value, peersMap = false }) => {
  if (!value) return null

  // future-proofing interop for multiaddr > 8.x
  value = value.buffer || value

  const ma = Multiaddr(value)
  const protos = ma.protoNames().concat(['ipfs', 'p2p'])
  const parts = ma.toString().split('/')

  return (
    <div style={{ color: 'rgba(255, 255, 255, 0.6' }} className='w95fa'>
      {parts.map((chunk, i) => (
        <span key={i}>
          <span style={{ color: peersMap ? '#1E1E1E' : (protos.includes(chunk) ? '' : '#fff') }} className='force-select'>{chunk}</span>
          {i < parts.length - 1 ? '/' : ''}
        </span>
      ))}
    </div>
  )
}

export default Address

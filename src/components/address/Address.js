import React from 'react'

const Address = ({ value }) => {
  if (!value) return null
  const parts = value.split('/')
  // used to shift the highlight one right on p2p-circuit addresses
  const d = parts.includes('p2p-circuit') ? 1 : 0
  return (
    <div className='charcoal-muted monospace'>
      {parts.map((chunk, i) => (
        <span key={i}>
          <span className={(i - d) % 2 || (i - d) > 4 || (i - d) === 0 ? 'force-select' : 'force-select charcoal'}>{chunk}</span>
          {i < parts.length - 1 ? '/' : ''}
        </span>
      ))}
    </div>
  )
}

export default Address

import React from 'react'

export const Title = ({ children, ...props }) => (
  <div style={{ color: '#209EEC', fontSize: '14px', fontWeight: '400' }} className='tracked w95fa f6 fw4 mt1 w-100 mb3' {...props}>{ children }</div>
)

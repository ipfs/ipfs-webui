import React from 'react'

export const Title = ({ children, ...props }) => (
  <h2 className='dib tracked ttu f6 fw2 teal-muted hover-aqua link mt0 mb4' {...props}>{ children }</h2>
)

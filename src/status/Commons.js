import React from 'react'

export const Title = ({ children, classes, ...props }) => (
  <h2 className={`ttu tracked f6 fw4 aqua mt0 mb4 ${classes}`} {...props}>{ children }</h2>
)

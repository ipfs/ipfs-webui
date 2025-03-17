import React from 'react'
import 'details-polyfill'

const Details = ({
  summaryText = 'Advanced',
  children,
  onClick,
  ...props
}) => {
  return (
    <details {...props}>
      <summary className='pointer blue outline-0' onClick={onClick}>{summaryText}</summary>
      {children}
    </details>
  )
}

export default Details

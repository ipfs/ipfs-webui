import React from 'react'
import 'details-polyfill'

const Details = ({
  summaryText = 'Advanced',
  children,
  ...props
}) => {
  return (
    <details {...props}>
      <summary className='pointer blue outline-0'>{summaryText}</summary>
      {children}
    </details>
  )
}

export default Details

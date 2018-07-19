import React from 'react'
import ErrorBoundary from '../error/ErrorBoundary'

export const Box = ({
  className = 'pa4',
  style,
  children,
  ...props
}) => {
  return (
    <div className={className} style={{background: '#fbfbfb', ...style}}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </div>
  )
}

export default Box

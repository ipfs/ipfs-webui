import React from 'react'
import ErrorBoundary from '../error/ErrorBoundary'

export const Box = ({
  className = 'pa4',
  style,
  children,
  bg = '#fbfbfb',
  ...props
}) => {
  return (
    <div className={className} style={{ background: bg, ...style }}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </div>
  )
}

export default Box

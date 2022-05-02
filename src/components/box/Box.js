import React from 'react'
import ErrorBoundary from '../error/ErrorBoundary'

export const Box = ({
  className = 'pa4',
  style,
  children
}) => {
  return (
    <section className={className} style={{ background: 'transparent', ...style }}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </section>
  )
}

export default Box

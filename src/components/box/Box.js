import React from 'react'
import ErrorBoundary from '../error/ErrorBoundary.js'

export const Box = ({
  className = 'pa4',
  style,
  children,
  ...props
}) => {
  return (
    <section className={className} style={{ background: '#fbfbfb', ...style }}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </section>
  )
}

export default Box

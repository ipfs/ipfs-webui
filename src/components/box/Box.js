import React from 'react'
import ErrorBoundary from '../error/error-boundary.js'

export const Box = ({
  className = 'pa4',
  style,
  children,
  ...props
}) => {
  return (
    <section className={className} style={{ background: '#fbfbfb', ...style }}>
      <ErrorBoundary resetKeys={[global.location.pathname]}>
        {children}
      </ErrorBoundary>
    </section>
  )
}

export default Box

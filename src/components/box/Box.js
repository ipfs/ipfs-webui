import React from 'react'
import ErrorBoundary from '../error/error-boundary.js'

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {React.CSSProperties} [props.style]
 * @param {React.ReactNode} props.children
 */
export const Box = ({
  className = 'pa4',
  style,
  children
}) => {
  return (
    <section className={className} style={{ background: 'var(--theme-bg-secondary)', ...style }}>
      <ErrorBoundary resetKeys={[globalThis.location?.pathname || '']}>
        {children}
      </ErrorBoundary>
    </section>
  )
}

export default Box

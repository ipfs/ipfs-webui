import React from 'react'
import { useTheme } from '../../hooks/theme'
import ErrorBoundary from '../error/ErrorBoundary.js'

export const Box = ({
  className = 'pa4',
  style,
  themed,
  children,
  ...props
}) => {
  const { isDarkTheme } = useTheme()
  return (
    <section className={className} style={{ background: isDarkTheme ? 'var(--element-bg)' : 'var(--element-bg-light)', ...style }}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </section>
  )
}

export default Box

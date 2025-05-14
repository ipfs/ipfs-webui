import React, { CSSProperties, ReactElement } from 'react'
import ErrorBoundary from '../error/ErrorBoundary.js'

type Props = {
  className?: string
  style?: CSSProperties
  children?: ReactElement | ReactElement[] | string
}

export const Box = ({
  className = 'pa4',
  style,
  children
}: Props) => {
  return (
    <section className={className} style={{ background: '#fbfbfb', ...style }}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </section>
  )
}

export default Box

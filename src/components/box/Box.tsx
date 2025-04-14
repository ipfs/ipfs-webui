import React, { ReactNode } from 'react'
import ErrorBoundary from '../error/ErrorBoundary'

interface BoxProps {
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
  [key: string]: any; // For any additional props
}

export const Box: React.FC<BoxProps> = ({
  className = 'pa4',
  style,
  children,
  ...props
}) => {
  return (
    <section
      className={className}
      style={{ background: '#fbfbfb', ...style }}
      {...props}
    >
      <ErrorBoundary>{children}</ErrorBoundary>
    </section>
  )
}

export default Box

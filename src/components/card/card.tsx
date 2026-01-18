import React from 'react'
import { Box } from '../box/Box'

/**
 * Card root
 */
export const Card: React.FC<{
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}> = ({ className = '', style, children }) => {
  return (
    <Box
      className={`ba b--black-10 br2 bg-white ${className}`}
      style={{ padding: 0, ...style }}
    >
      {children}
    </Box>
  )
}

/**
 * Card header
 */
export const CardHeader: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ className = '', children }) => {
  return (
    <div className={`pa3 bb b--black-10 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Card title
 */
export const CardTitle: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ className = '', children }) => {
  return (
    <h3 className={`f6 fw6 ma0 ${className}`}>
      {children}
    </h3>
  )
}

/**
 * Card description
 */
export const CardDescription: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ className = '', children }) => {
  return (
    <div className={`f7 charcoal-muted mt1 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Card content
 */
export const CardContent: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ className = '', children }) => {
  return (
    <div className={`pa3 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Card footer
 */
export const CardFooter: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ className = '', children }) => {
  return (
    <div className={`pa3 bt b--black-10 ${className}`}>
      {children}
    </div>
  )
}

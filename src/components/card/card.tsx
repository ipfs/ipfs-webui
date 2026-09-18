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
      className={`ba br2 bg-white ${className}`}
      style={{ padding: 0, borderColor: 'var(--theme-border-primary)', ...style }}
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
    <div className={`pa3 bb ${className}`} style={{ borderColor: 'var(--theme-border-primary)' }}>
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
    <div className={`ttu tracked f6 fw4 teal ${className}`}>
      {children}
    </div>
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
    <div className={`f7 gray mt1 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Card action (top-right area)
 */
export const CardAction: React.FC<{
  className?: string
  children: React.ReactNode
}> = ({ className = '', children }) => {
  return (
    <div className={`absolute top-1 right-1 ${className}`}>
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
    <div className={`pa3 bt ${className}`} style={{ borderColor: 'var(--theme-border-primary)' }}>
      {children}
    </div>
  )
}

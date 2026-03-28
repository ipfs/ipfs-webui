import React from 'react'
import { Identicon } from '../identicon/identicon.js'
import ErrorBoundary from '../error/error-boundary.js'

export function cidStartAndEnd (value: string | { toString(): string }) {
  const valueStr = value.toString()
  const chars = value.toString().split('')
  if (chars.length <= 9) {
    return {
      value: valueStr,
      start: valueStr,
      end: ''
    }
  }
  const start = chars.slice(0, 4).join('')
  const end = chars.slice(chars.length - 4).join('')
  return {
    value,
    start,
    end
  }
}

export function shortCid (value: string | { toString(): string }): string {
  const { start, end } = cidStartAndEnd(value)
  return `${start}…${end}`
}

export interface CidProps {
  value: string | { toString(): string }
  title?: string
  style?: React.CSSProperties
  identicon?: boolean
  className?: string
  onClick?: () => void
}

const Cid = React.forwardRef<HTMLElement, CidProps>(({ value, title, style, identicon = false, ...props }, ref) => {
  style = Object.assign({}, {
    textDecoration: 'none',
    marginLeft: identicon ? '5px' : null
  }, style)
  const { start, end } = cidStartAndEnd(value)
  const displayTitle = title || value.toString()
  return (
    <abbr title={displayTitle} style={style} ref={ref} {...props}>
      { identicon && <ErrorBoundary fallback={() => null}><Identicon cid={value.toString()} className='mr2' /></ErrorBoundary> }
      <span>
        <span>{start}</span>
        <span className='o-20'>…</span>
        <span>{end}</span>
      </span>
    </abbr>
  )
})

export default Cid

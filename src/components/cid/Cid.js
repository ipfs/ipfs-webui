import React from 'react'
import Identicon from '../identicon/Identicon.js'

export function cidStartAndEnd (value) {
  const chars = value.split('')
  if (chars.length <= 9) return value
  const start = chars.slice(0, 4).join('')
  const end = chars.slice(chars.length - 4).join('')
  return {
    value,
    start,
    end
  }
}

export function shortCid (value) {
  const { start, end } = cidStartAndEnd(value)
  return `${start}…${end}`
}

const Cid = React.forwardRef(({ value, title, style, identicon = false, ...props }, ref) => {
  style = Object.assign({}, {
    textDecoration: 'none',
    marginLeft: identicon ? '5px' : null
  }, style)
  const { start, end } = cidStartAndEnd(value)
  return (
    <abbr title={title || value} style={style} ref={ref} {...props}>
      { identicon && <Identicon cid={value} className='mr2' /> }
      <span>
        <span>{start}</span>
        <span className='o-20'>…</span>
        <span>{end}</span>
      </span>
    </abbr>
  )
})

export default Cid

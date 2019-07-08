import React from 'react'
import Identicon from 'react-identicons'
import { colors } from 'ipfs-css/theme.json'

const identiconPalette = [colors.navy, colors.aqua, colors.gray, colors.charcoal, colors.red, colors.yellow, colors.teal, colors.green]

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

const Cid = ({ value, title, style, identicon = true, ...props }) => {
  style = Object.assign({}, {
    textDecoration: 'none',
    marginLeft: identicon ? '5px' : null
  }, style)
  const { start, end } = cidStartAndEnd(value)
  return (
    <>
      { identicon && <Identicon string={value} size={20} palette={identiconPalette} /> }
      <abbr title={title || value} style={style} {...props}>
        <span>{start}</span>
        <span className='o-20'>…</span>
        <span>{end}</span>
      </abbr>
    </>
  )
}

export default Cid

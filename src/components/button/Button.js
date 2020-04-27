import React from 'react'
import './Button.css'

const Button = ({ bg = 'bg-teal', color = 'white', fill = 'white', className = '', disabled, danger, minWidth = 140, children, style, ...props }) => {
  const bgClass = danger ? 'bg-red' : disabled ? 'bg-gray-muted' : bg
  const fillClass = danger ? 'fill-white' : disabled ? 'fill-snow' : fill
  const colorClass = danger ? 'white' : disabled ? 'light-gray' : color
  const cls = `Button transition-all sans-serif dib v-mid fw5 nowrap lh-copy bn br1 pa2 pointer focus-outline ${fillClass} ${bgClass} ${colorClass} ${className}`
  return (
    <button className={cls} disabled={disabled} style={{ minWidth, ...style }} {...props}>
      {children}
    </button>
  )
}

export default Button

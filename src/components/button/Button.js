import React from 'react'
import './Button.css'

const Button = ({bg = 'bg-aqua', color = 'white', className = '', disabled, children, ...props}) => {
  const bgClass = disabled ? 'bg-gray' : bg
  const colorClass = disabled ? 'light-gray' : color
  const cls = `Button sans-serif dib v-mid fw5 nowrap lh-copy bn br1 pa2 pointer focus-outline ${bgClass} ${colorClass} ${className}`
  return (
    <button className={cls} disabled={disabled} {...props}>
      {children}
    </button>
  )
}

export default Button

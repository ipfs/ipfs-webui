import React from 'react'
import './Loader.css'

export const Loader = ({ color = 'light', ...props }) => {
  const className = `dib la-ball-triangle-path la-${color} la-sm`
  return (
    <div {...props}>
      <div
        className={className}
        style={{ width: 20, height: 20 }}>
        <div />
        <div />
        <div />
      </div>
    </div>
  )
}

import React from 'react'

const Box = ({
  className = 'pa4',
  style,
  children,
  ...props
}) => {
  return (
    <div className={className} style={{background: '#fbfbfb', ...style}}>{children}</div>
  )
}

export default Box

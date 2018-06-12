import React from 'react'

const Box = ({
  className = 'pa4',
  style = {background: '#fbfbfb'},
  children,
  ...props
}) => {
  return (
    <div className={className} style={style}>{children}</div>
  )
}

export default Box

import React from 'react'
import classNames from 'classnames'

const ContextMenuItem = ({ className, children, ...props }) => (
  <button className={ classNames(className, 'flex items-center nowrap') } role="menuitem" {...props}>
    { children }
  </button>
)

export default ContextMenuItem

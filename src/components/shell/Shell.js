import React from 'react'
import classNames from 'classnames'

/**
 * @param {Object} props
 * @param {string} [props.title]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
const Shell = ({
  title = 'Shell',
  children,
  className
}) => {
  return (
    <div className={classNames('br1 overflow-hidden', className)}>
      <div className='f7 mb0 sans-serif ttu tracked charcoal pv1 pl2 bg-black-20'>{ title }</div>
      <div className='bg-black-70 snow pa2 f7 lh-copy monospace nowrap overflow-x-auto'>
        {children}
      </div>
    </div>
  )
}

export default Shell

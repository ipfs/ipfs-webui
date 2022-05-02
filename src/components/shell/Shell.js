import React from 'react'
import classNames from 'classnames'

const Shell = ({
  title = 'Shell',
  children,
  className,
  ...rest
}) => {
  return (
    <div className={classNames('br1 overflow-hidden', className)} {...rest}>
      <div className='f6 mb0 spacegrotesk ttu tracked gray pv1 pl2'>{title}</div>
      <div className='snow pa2 lh-copy spacegrotesk nowrap overflow-x-auto purple bg-near-purple'
        style={{ padding: '20px', lineHeight: '24px' }}>
        {children}
      </div>
    </div>
  )
}

export default Shell

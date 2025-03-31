import React, { ReactElement } from 'react'
import classNames from 'classnames'

type Props = {
  title?: string
  children: ReactElement | ReactElement[]
  className?: string
}

const Shell = ({
  title = 'Shell',
  children,
  className
}: Props) => {
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

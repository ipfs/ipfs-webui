import React from 'react'

const Shell = ({
  title = 'Shell',
  children
}) => {
  return (
    <div className='mw6 br1 overflow-hidden'>
      <div className='f7 mb0 sans-serif ttu tracked charcoal pv1 pl2 bg-black-20'>Shell</div>
      <div className='bg-black-70 snow pa2 f7 lh-copy monospace'>
        {children}
      </div>
    </div>
  )
}

export default Shell

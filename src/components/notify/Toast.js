import React from 'react'
import CancelIcon from '../../icons/GlyphCancel'

const Toast = ({ error, children, onDismiss }) => {
  const bg = error ? 'bg-yellow' : 'bg-green'
  return (
    <div className='fixed bottom-0 w-100 tc pb2 z-max'>
      <div className={`dib f5 lh-copy avenir pl2 pl4-ns pv2 white br2 ${bg}`}>
        {children}
        <CancelIcon
          className='dib fill-current-color ph3 glow o-80 pointer'
          style={{ height: '28px', verticalAlign: '-8px' }}
          onClick={onDismiss} />
      </div>
    </div>
  )
}

export default Toast

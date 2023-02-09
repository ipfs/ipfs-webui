import React from 'react'
import CancelIcon from '../../icons/GlyphSmallCancel.js'

const Toast = ({ error, children, onDismiss }) => {
  const bg = error ? 'bg-yellow' : 'bg-green'
  return (
    <div className='fixed bottom-0 tc pb2 z-max' style={{ left: '50% ', transform: 'translateX(-50%)' }}>
      <div className={`flex items-center f5 lh-copy avenir pl2 pl4-ns pv2 white br2 ${bg}`}>
        {children}
        <CancelIcon
          className='fill-current-color ph3 glow o-80 pointer'
          style={{ height: '28px', transform: 'scale(1.5)' }}
          onClick={onDismiss} />
      </div>
    </div>
  )
}

export default Toast

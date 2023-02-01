import React from 'react'
import Button from '../button/Button.js'

const AnalyticsBanner = ({ className, label, yesLabel, onYes }) => {
  return (
    <div className={`f6 pv3 pv2-ns ph3 tc bg-snow charcoal flex ${className}`}>
      <span className='fw4 lh-copy dib mb2 tl'>
        {label}
      </span>
      <span className='dib'>
        <Button className='ml3 mv1 tc' bg={'bg-green'} onClick={onYes}>{yesLabel}</Button>
      </span>
    </div>
  )
}

export default AnalyticsBanner

import React from 'react'
import Button from '../button/Button'

const Ask = ({ className }) => {
  return (
    <div className={`pv3 pv2-ns ph3 tc bg-snow charcoal ${className}`}>
      <span className='fw5 lh-copy dib'>Help improve this app by sending anonymous usage data.</span>
      <span className='dib pt3 pt0-ns'>
        <Button className='ml3' bg={'bg-green'}>Enable</Button>
        <Button className='ml3' color='charcoal' bg={'bg-snow-muted'}>No thanks</Button>
      </span>
    </div>
  )
}

export default Ask

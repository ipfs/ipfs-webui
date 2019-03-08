import React from 'react'
import { connect } from 'redux-bundler-react'

export const TourHelper = ({ doEnableTours, size = 23 }) => {
  const handleClick = () => {
    doEnableTours()
  }

  return (
    <span className='dib mr1 ml4-m pointer' onClick={handleClick}>
      <svg className='fill-aqua o-60 glow' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 44' width={size} height={size}>
        <path d='m22,0c-12.2,0-22,9.8-22,22s9.8,22 22,22 22-9.8 22-22-9.8-22-22-22zm2,34c0,0.6-0.4,1-1,1h-2c-0.6,0-1-0.4-1-1v-2c0-0.6 0.4-1 1-1h2c0.6,0 1,0.4 1,1v2zm2.7-8.9c-1.4,1.2-2.4,2-2.7,3.1-0.1,0.5-0.5,0.8-1,0.8h-2c-0.6,0-1.1-0.5-1-1.1 0.4-2.9 2.5-4.5 4.2-5.9 1.8-1.4 2.8-2.3 2.8-4 0-2.8-2.2-5-5-5s-5,2.2-5,5c0,0.2 0,0.4 0,0.6 0.1,0.5-0.2,1-0.7,1.1l-1.9,.6c-0.6,0.2-1.2-0.2-1.3-0.8-0.1-0.5-0.1-1-0.1-1.5 0-5 4-9 9-9s9,4 9,9c0,3.7-2.4,5.6-4.3,7.1z' />
      </svg>
    </span>
  )
}

export default connect(
  'doEnableTours',
  TourHelper
)

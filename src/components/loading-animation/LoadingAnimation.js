import React from 'react'
import './LoadingAnimation.css'

const LoadingAnimation = ({ loading, children }) => {
  if (!loading) return children

  return (
    <div className='LoadingAnimation'>
      <div className='LoadingAnimationSwipe'>
        { children }
      </div>
    </div>
  )
}

export default LoadingAnimation

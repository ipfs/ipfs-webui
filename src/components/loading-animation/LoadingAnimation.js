import React from 'react'
import classnames from 'classnames'
import './LoadingAnimation.css'

const LoadingAnimation = ({ loading, children }) => {
  const wrapperAnimClass = classnames({ 'loading': loading }, ['wrapper'])

  return (
    <div className={wrapperAnimClass}>
      { children }
    </div>
  )
}

export default LoadingAnimation

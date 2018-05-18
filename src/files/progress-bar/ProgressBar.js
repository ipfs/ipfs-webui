import React from 'react'
import PropTypes from 'prop-types'
import './ProgressBar.css'

const ProgressBar = ({bg, className, progress, ...props}) => {
  return (
    <div className={`ProgressBar w-100 h1 sans-serif br-pill dib ${className}`} {...props}>
      <div className={`br-pill h1 ${bg}`} style={{width: `${progress}%`}} />
    </div>
  )
}

ProgressBar.propTypes = {
  className: PropTypes.string,
  bg: PropTypes.string,
  progress: PropTypes.number.isRequired
}

ProgressBar.defaultProps = {
  className: '',
  bg: 'bg-aqua'
}

export default ProgressBar

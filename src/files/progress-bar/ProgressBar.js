import React from 'react'
import PropTypes from 'prop-types'
import './ProgressBar.css'

const ProgressBar = ({bg, className, width, progress, ...props}) => {
  return (
    <div className={`ProgressBar h1 sans-serif br-pill dib ${className} ${width}`} {...props}>
      <div className={`br-pill h1 ${bg}`} style={{width: `${progress}%`}} />
    </div>
  )
}

ProgressBar.propTypes = {
  className: PropTypes.string,
  bg: PropTypes.string,
  width: PropTypes.string,
  progress: PropTypes.number.isRequired
}

ProgressBar.defaultProps = {
  className: '',
  width: 'w-100',
  bg: 'bg-aqua'
}

export default ProgressBar

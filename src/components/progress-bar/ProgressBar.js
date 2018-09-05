import React from 'react'
import PropTypes from 'prop-types'

const ProgressBar = ({ bg, className, style, width, progress, ...props }) => {
  return (
    <div className={`ProgressBar h1 sans-serif br-pill dib ${className} ${width}`} style={{ background: '#DDE6EB', ...style }} {...props}>
      <div className={`br-pill h-100 ${bg}`} style={{ width: `${progress}%` }} />
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

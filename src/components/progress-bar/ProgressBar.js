import React from 'react'
import PropTypes from 'prop-types'

const ProgressBar = ({ bg, br, className, style, width, height, progress, ...props }) => {
  return (
    <div className={`ProgressBar sans-serif ${br} dib ${className} ${width} ${height}`} style={{ background: '#DDE6EB', ...style }} {...props}>
      <div className={`${br} h-100 ${bg}`} style={{ width: `${progress}%` }} />
    </div>
  )
}

ProgressBar.propTypes = {
  className: PropTypes.string,
  bg: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  br: PropTypes.string,
  progress: PropTypes.number.isRequired
}

ProgressBar.defaultProps = {
  className: '',
  width: 'w-100',
  height: 'h1',
  bg: 'bg-aqua',
  br: 'br-pill'
}

export default ProgressBar

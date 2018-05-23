import React from 'react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import ProgressBar from '../progress-bar/ProgressBar'
import GlyphSmallCancel from '../../icons/GlyphSmallCancel'

export default function Status ({progress, cancel, speed, className, ...props}) {
  return (
    <div className={`mw5 flex items-center ${className}`} {...props}>
      <div className='flex-grow-1'>
        <div className='flex f7 justify-between'>
          <span>↑ {filesize(speed)}/s</span>
          <GlyphSmallCancel onClick={cancel} width='0.5rem' height='0.5rem' className='pointer' fill='#F26148' viewBox='37 40 27 27' />
        </div>
        <ProgressBar progress={progress} />
      </div>
      <div className='ml3'>
        {progress}%
      </div>
    </div>
  )
}

Status.propTypes = {
  progress: PropTypes.number.isRequired,
  cancel: PropTypes.func.isRequired,
  speed: PropTypes.number.isRequired,
  className: PropTypes.string
}

Status.defaultProps = {
  className: ''
}

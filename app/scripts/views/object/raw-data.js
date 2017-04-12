import React, {PropTypes} from 'react'
import {Buffer} from 'safe-buffer'

const RawData = ({data, limit = 10000}) => {
  const buf = new Buffer(data.substr(0, limit), 'utf-8')
  const content = `data:text/plain;charset=utf8;base64,${buf.toString('base64')}`

  return (
    <iframe src={content} className='panel-inner' />
  )
}

RawData.propTypes = {
  data: PropTypes.string.isRequired,
  limit: PropTypes.number
}

export default RawData

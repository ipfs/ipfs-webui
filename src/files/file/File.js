import React from 'react'
import PropTypes from 'prop-types'
import prettyBytes from 'pretty-bytes'
import Checkbox from '../../components/checkbox/Checkbox'
import ProgressBar from '../progress-bar/ProgressBar'
import StrokeFolder from '../../icons/StrokeFolder'
import StrokeDocument from  '../../icons/StrokeDocument'
import './File.css'

const File = (props) => {
  let {selected, name, status, size, hash, onSelect} = props

  let className = 'File flex bt'

  if (props.selected) {
    className += ' selected'
  }

  if (status !== null) {
    size = 'N/A'
    status = <ProgressBar width='w-75' progress={status} />
  } else {
    size = prettyBytes(size)
  }

  const select = (select) => {
    onSelect(hash, select)
  }

  return (
    <div className={className}>
      <div className='pa2 w2'>
        <Checkbox checked={selected} onChange={select} />
      </div>
      <div className='name flex-grow-1 pa2 w-40'>
        {name}
      </div>
      <div className='status pa2 w-30'>{status}</div>
      <div className='size pa2 w-10'>{size}</div>
      <div className='pa2 w-10'>Peers</div>
    </div>
  ) 
}

File.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  hash: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  status: PropTypes.number,

  onSelect: PropTypes.func.isRequired
}

File.defaultProps = {
  status: null
}

export default File

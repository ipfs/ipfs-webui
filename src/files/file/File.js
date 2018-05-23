import React from 'react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import Checkbox from '../../components/checkbox/Checkbox'
import FileIcon from '../file-icon/FileIcon'
import Status from '../status/Status'
import './File.css'

const File = (props) => {
  let {selected, name, type, speed, status, size, hash, onSelect, onNavigate, onCancel} = props

  let className = 'File flex items-center bt pv2'

  if (props.selected) {
    className += ' selected'
  }

  if (status !== null) {
    size = 'N/A'
    status = <Status progress={status} cancel={onCancel} speed={speed} />
  } else {
    size = filesize(size)
  }

  if (type === 'directory') {
    size = ''
  }

  const select = (select) => {
    onSelect(hash, select)
  }

  return (
    <div className={className}>
      <div className='pa2 w2'>
        <Checkbox checked={selected} onChange={select} />
      </div>
      <div className='name flex items-center flex-grow-1 pa2 w-40'>
        <div className='dib icon'>
          <FileIcon name={name} type={type} />
        </div>
        <span className='pointer' onClick={onNavigate}>{name}</span>
      </div>
      <div className='status pa2 w-30'>{status}</div>
      <div className='size pa2 w-10'>{size}</div>
    </div>
  )
}

File.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  hash: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  speed: PropTypes.number,
  status: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onCancel: PropTypes.func
}

File.defaultProps = {
  status: null
}

export default File

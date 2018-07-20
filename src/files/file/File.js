import React from 'react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import Checkbox from '../../components/checkbox/Checkbox'
import FileIcon from '../file-icon/FileIcon'
import Tooltip from '../../components/tooltip/Tooltip'
import './File.css'

function File ({selected, hash, name, type, size, onSelect, onInspect, onNavigate}) {
  let className = 'File flex items-center bt pv2'

  if (selected) {
    className += ' selected'
  }

  if (type === 'directory') {
    size = ''
  } else {
    size = filesize(size, { round: 0 })
  }

  const select = (select) => {
    onSelect(name, select)
  }

  return (
    <div className={className}>
      <div className='pa2 w2'>
        <Checkbox checked={selected} onChange={select} />
      </div>
      <div className='name relative flex items-center flex-grow-1 pa2 w-40'>
        <div className='pointer dib icon flex-shrink-0' onClick={onNavigate}>
          <FileIcon name={name} type={type} />
        </div>
        <div className='f6'>
          <Tooltip text={name}>
            <div onClick={onNavigate} className='pointer truncate'>{name}</div>
          </Tooltip>

          <Tooltip text={hash}>
            <div onClick={onInspect} className='pointer mt1 gray truncate monospace'>{hash}</div>
          </Tooltip>
        </div>
      </div>
      <div className='size pa2 w-10 monospace dn db-l'>{size}</div>
    </div>
  )
}

File.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  hash: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onInspect: PropTypes.func.isRequired
}

export default File

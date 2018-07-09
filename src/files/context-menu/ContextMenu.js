import React from 'react'
import PropTypes from 'prop-types'
import StrokeCopy from '../../icons/StrokeCopy'
import StrokeShare from '../../icons/StrokeShare'
import StrokePencil from '../../icons/StrokePencil'
import StrokeIpld from '../../icons/StrokeIpld'
import StrokeTrash from '../../icons/StrokeTrash'
import StrokeDownload from '../../icons/StrokeDownload'

function Option ({onClick, children}) {
  return (
    <div className='flex pointer items-center pa2 bg-animate hover-bg-near-white' onClick={onClick}>
      {children}
    </div>
  )
}

export default class ContextMenu extends React.Component {
  static propTypes = {
    onDelete: PropTypes.func.isRequired,
    onRename: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    onInspect: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired,
    onCopyHash: PropTypes.func.isRequired,
    top: PropTypes.number,
    left: PropTypes.number
  }

  static defaultProps = {
    top: 0,
    left: 0
  }

  render () {
    const { top, left, onDelete, onRename, onDownload, onInspect, onCopyHash, onShare } = this.props

    return (
      <div className='bg-white z-max fixed sans-serif charcoal br2' style={{
        top: `${top}px`,
        left: `${left}px`,
        boxShadow: 'rgba(105, 196, 205, 0.5) 0px 1px 10px 0px',
        width: '200px'
      }}>
        <Option onClick={onDelete}>
          <StrokeTrash className='w2 mr2 fill-aqua' />
          Delete
        </Option>
        <Option onClick={onRename}>
          <StrokePencil className='w2 mr2 fill-aqua' />
          Rename
        </Option>
        <Option onClick={onDownload}>
          <StrokeDownload className='w2 mr2 fill-aqua' />
          Download
        </Option>
        <Option onClick={onInspect}>
          <StrokeIpld className='w2 mr2 fill-aqua' />
          Inspect
        </Option>
        <Option onClick={onCopyHash}>
          <StrokeCopy className='w2 mr2 fill-aqua' />
          Copy Hash
        </Option>
        <Option onClick={onShare}>
          <StrokeShare className='w2 mr2 fill-aqua' />
          Share
        </Option>
      </div>
    )
  }
}

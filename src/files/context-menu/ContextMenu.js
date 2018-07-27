import React from 'react'
import PropTypes from 'prop-types'
import StrokeCopy from '../../icons/StrokeCopy'
import StrokeShare from '../../icons/StrokeShare'
import StrokePencil from '../../icons/StrokePencil'
import StrokeIpld from '../../icons/StrokeIpld'
import StrokeTrash from '../../icons/StrokeTrash'
import StrokeDownload from '../../icons/StrokeDownload'

const Option = ({onClick, children}) => (
  <div className='flex pointer items-center pa2 bg-animate hover-bg-near-white' onClick={onClick}>
    {children}
  </div>
)

const Menu = ({onDelete, onRename, onDownload, onInspect, onCopyHash, onShare}) => (
  <div className={`bg-white z-max sans-serif charcoal br1 absolute top-0 right-0`} style={{
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

const ContextMenu = ({ open, onDismiss, ...props }) => (
  <div className={`relative ${open ? null : 'dn'}`}>
    <div onClick={onDismiss} className='fixed w-100 h-100 top-0 left-0 right-0 bottom-0' />
    <Menu {...props} />
  </div>
)

ContextMenu.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onInspect: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onCopyHash: PropTypes.func.isRequired
}

ContextMenu.defaultProps = {
  top: 0,
  left: 0,
  right: 'auto',
  className: ''
}

export default ContextMenu

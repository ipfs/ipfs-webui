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

// `open` is used to show and hide the menu
// `top` is used to move the menu and arrow down.
const Container = ({open, children}) => (
  <div style={{
    display: open ? null : 'none',
    position: 'relative'
  }}>
    {children}
  </div>
)

// Invisible click grabber, to detect when the user clicks away.
const Overlay = ({onClick}) => {
  return (
    <div onClick={onClick} style={{
      position: 'fixed',
      width: '100%',
      height: '100%',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0}} data-id='dropdown-overlay' />
  )
}

const Menu = ({top, left, right, onDelete, onRename, onDownload, onInspect, onCopyHash, onShare, className}) => {
  return (
    <div className={`bg-white z-max sans-serif charcoal br2 ${className}`} style={{
      top: top,
      left: left,
      right: right,
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

const ContextMenu = ({ open, onDismiss, ...props }) => (
  <Container open={open} >
    <Overlay onClick={onDismiss} />
    <Menu {...props} />
  </Container>
)

ContextMenu.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onInspect: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onCopyHash: PropTypes.func.isRequired,
  top: PropTypes.any,
  left: PropTypes.any,
  right: PropTypes.any
}

ContextMenu.defaultProps = {
  top: 0,
  left: 0,
  right: 'auto',
  className: ''
}

export default ContextMenu

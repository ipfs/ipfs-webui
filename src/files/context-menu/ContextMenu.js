import React from 'react'
import PropTypes from 'prop-types'
import { CopyToClipboard } from 'react-copy-to-clipboard'
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

const Menu = ({onDismiss, hash, ...props}) => {
  const wrap = (name) => () => {
    onDismiss()
    props[name]()
  }

  return (
    <div className={`bg-white z-max sans-serif charcoal br1 absolute top-0 right-0`} style={{
      boxShadow: 'rgba(105, 196, 205, 0.5) 0px 1px 10px 0px',
      width: '200px'
    }}>
      <Option onClick={wrap('onDelete')}>
        <StrokeTrash className='w2 mr2 fill-aqua' />
        Delete
      </Option>
      <Option onClick={wrap('onRename')}>
        <StrokePencil className='w2 mr2 fill-aqua' />
        Rename
      </Option>
      <Option onClick={wrap('onDownload')}>
        <StrokeDownload className='w2 mr2 fill-aqua' />
        Download
      </Option>
      <Option onClick={wrap('onInspect')}>
        <StrokeIpld className='w2 mr2 fill-aqua' />
        Inspect
      </Option>
      <CopyToClipboard text={hash} onCopy={onDismiss}>
        <Option>
          <StrokeCopy className='w2 mr2 fill-aqua' />
          Copy Hash
        </Option>
      </CopyToClipboard>
      <Option onClick={wrap('onShare')}>
        <StrokeShare className='w2 mr2 fill-aqua' />
        Share
      </Option>
    </div>
  )
}

const ContextMenu = ({ open, onDismiss, ...props }) => (
  <div className={`relative ${open ? null : 'dn'}`}>
    <div onClick={onDismiss} className='fixed z-9999 w-100 h-100 top-0 left-0 right-0 bottom-0' />
    <Menu onDismiss={onDismiss} {...props} />
  </div>
)

ContextMenu.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onInspect: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  hash: PropTypes.string.isRequired
}

ContextMenu.defaultProps = {
  top: 0,
  left: 0,
  right: 'auto',
  className: ''
}

export default ContextMenu

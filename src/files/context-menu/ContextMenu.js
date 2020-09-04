import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Dropdown, DropdownMenu, Option } from '../dropdown/Dropdown'
import StrokeCopy from '../../icons/StrokeCopy'
import StrokeShare from '../../icons/StrokeShare'
import StrokePencil from '../../icons/StrokePencil'
import StrokeIpld from '../../icons/StrokeIpld'
import StrokeTrash from '../../icons/StrokeTrash'
import StrokeDownload from '../../icons/StrokeDownload'
import StrokePin from '../../icons/StrokePin'
import { cliCmdKeys } from '../../bundles/files/consts'

class ContextMenu extends React.Component {
  constructor (props) {
    super(props)
    this.dropdownMenuRef = React.createRef()
  }

  state = {
    dropdown: false
  }

  wrap = (name, cliOptions) => () => {
    if (name === 'onCliTutorMode' && cliOptions) {
      this.props.doSetCliOptions(cliOptions)
    }
    this.props.handleClick()
    this.props[name]()
  }

  componentDidUpdate () {
    if (this.props.autofocus && this.props.isOpen) {
      if (!this.dropdownMenuRef.current) return

      const firstButton = this.dropdownMenuRef.current.querySelector('button')
      if (!firstButton) return

      firstButton.focus()
    }
  }

  render () {
    const {
      t, onRename, onDelete, onDownload, onInspect, onShare,
      translateX, translateY, className,
      isDirectory, isMfs, isUnknown, pinned, isCliTutorModeEnabled
    } = this.props
    return (
      <Dropdown className={className}>
        <DropdownMenu
          ref={this.dropdownMenuRef}
          top={-8}
          arrowMarginRight='11px'
          left='calc(100% - 200px)'
          translateX={-translateX}
          translateY={-translateY}
          open={this.props.isOpen}
          onDismiss={this.props.handleClick}>
          { !isDirectory && onShare &&
            <Option onClick={this.wrap('onShare')}>
              <StrokeShare className='w2 mr2 fill-aqua' />
              {t('actions.share')}
            </Option>
          }
          <CopyToClipboard text={String(this.props.cid)} onCopy={this.props.handleClick}>
            <Option>
              <StrokeCopy className='w2 mr2 fill-aqua' />
              {t('actions.copyHash')}
            </Option>
          </CopyToClipboard>
          { onInspect &&
            <Option onClick={this.wrap('onInspect')}>
              <StrokeIpld className='w2 mr2 fill-aqua' />
              {t('actions.inspect')}
            </Option>
          }
          <Option onClick={this.wrap(pinned ? 'onUnpin' : 'onPin')} isCliTutorModeEnabled={isCliTutorModeEnabled}
            onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.PIN_OBJECT)}>
            <StrokePin className='w2 mr2 fill-aqua' />
            { pinned ? t('actions.unpin') : t('actions.pin') }
          </Option>
          { !isDirectory && !isUnknown && onDownload &&
            <Option onClick={this.wrap('onDownload')} isCliTutorModeEnabled={isCliTutorModeEnabled}
              onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.DOWNLOAD_OBJECT_COMMAND)}>
              <StrokeDownload className='w2 mr2 fill-aqua' />
              {t('actions.download')}
            </Option>
          }
          { !isDirectory && !isUnknown && isMfs && onRename &&
            <Option onClick={this.wrap('onRename')} isCliTutorModeEnabled={isCliTutorModeEnabled}
              onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.RENAME_IPFS_OBJECT)}>
              <StrokePencil className='w2 mr2 fill-aqua' />
              {t('actions.rename')}
            </Option>
          }
          { !isDirectory && !isUnknown && isMfs && onDelete &&
            <Option onClick={this.wrap('onDelete')} isCliTutorModeEnabled={isCliTutorModeEnabled}
              onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.DELETE_FILE_FROM_IPFS)}
            >
              <StrokeTrash className='w2 mr2 fill-aqua' />
              {t('actions.delete')}
            </Option>
          }
        </DropdownMenu>
      </Dropdown>
    )
  }
}

ContextMenu.propTypes = {
  isMfs: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isUnknown: PropTypes.bool.isRequired,
  hash: PropTypes.string,
  isDirectory: PropTypes.bool,
  pinned: PropTypes.bool,
  handleClick: PropTypes.func,
  translateX: PropTypes.number.isRequired,
  translateY: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  onDelete: PropTypes.func,
  onRename: PropTypes.func,
  onDownload: PropTypes.func,
  onInspect: PropTypes.func,
  onShare: PropTypes.func,
  className: PropTypes.string,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired,
  autofocus: PropTypes.bool
}

ContextMenu.defaultProps = {
  isMfs: false,
  isOpen: false,
  isDirectory: false,
  isUnknown: false,
  top: 0,
  left: 0,
  right: 'auto',
  translateX: 0,
  translateY: 0,
  className: ''
}

export default withTranslation('files', { withRef: true })(ContextMenu)

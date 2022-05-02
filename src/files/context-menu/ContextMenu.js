/* eslint-disable space-before-function-paren */
import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Dropdown, DropdownMenu, Option } from '../dropdown/Dropdown'
import { cliCmdKeys } from '../../bundles/files/consts'
import FilecopyIcon from '../../icons/retro/files/FilecopyIcon'
import FileDeleteIcon from '../../icons/retro/files/FileDeleteIcon'
import FileEditIcon from '../../icons/retro/files/FileEditIcon'
import FileShowIcon from '../../icons/retro/files/FileShowIcon'
import FileShareIcon from '../../icons/retro/files/FileShareIcon'
import FilePinIcon from '../../icons/retro/files/FilepinIcon'
import FiledownloadIcon from '../../icons/retro/files/FiledowloadIcon'
class ContextMenu extends React.Component {
  constructor(props) {
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

  componentDidUpdate() {
    if (this.props.autofocus && this.props.isOpen) {
      if (!this.dropdownMenuRef.current) return

      const firstButton = this.dropdownMenuRef.current.querySelector('button')
      if (!firstButton) return

      firstButton.focus()
    }
  }

  render() {
    const {
      t, onRename, onRemove, onDownload, onInspect, onShare,
      translateX, translateY, className, isMfs, isUnknown, isCliTutorModeEnabled
    } = this.props
    return (
      <Dropdown className={className}>
        <DropdownMenu
          ref={this.dropdownMenuRef}
          width={160}
          top={-20}
          translateX={-translateX}
          translateY={-translateY}
          open={this.props.isOpen}
          onDismiss={this.props.handleClick}>

          <CopyToClipboard text={String(this.props.cid)} onCopy={this.props.handleClick}>
            <Option>
              <FilecopyIcon />&nbsp;&nbsp;
              {t('actions.copyHash')}
            </Option>
          </CopyToClipboard>
          {onInspect &&
            <Option onClick={this.wrap('onInspect')}>
              <FileShowIcon />&nbsp;&nbsp;
              {t('app:actions.inspect')}
            </Option>
          }
          <Option onClick={this.wrap('onPinning')} isCliTutorModeEnabled={isCliTutorModeEnabled}
            onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.PIN_OBJECT)}>
            <FilePinIcon />&nbsp;&nbsp;
            {t('app:actions.setPinning')}
          </Option>
          {!isUnknown && onDownload &&
            <Option onClick={this.wrap('onDownload')} isCliTutorModeEnabled={isCliTutorModeEnabled}
              onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.DOWNLOAD_OBJECT_COMMAND)}>
              <FiledownloadIcon />&nbsp;&nbsp;
              {t('app:actions.download')}
            </Option>
          }
          {!isUnknown && isMfs && onRename &&
            <Option onClick={this.wrap('onRename')} isCliTutorModeEnabled={isCliTutorModeEnabled}
              onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.RENAME_IPFS_OBJECT)}>
              <FileEditIcon />&nbsp;&nbsp;&nbsp;&nbsp;
              {t('app:actions.rename')}
            </Option>
          }
          {!isUnknown && isMfs && onRemove &&
            <Option onClick={this.wrap('onRemove')} isCliTutorModeEnabled={isCliTutorModeEnabled}
              onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.REMOVE_FILE_FROM_IPFS)}>
              <FileDeleteIcon color={'white'}/>&nbsp;&nbsp;&nbsp;&nbsp;
              {t('app:actions.remove')}
            </Option>
          }
          {onShare &&
            <Option onClick={this.wrap('onShare')}>
              <FileShareIcon />&nbsp;&nbsp;
              {t('actions.share')}
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
  pinned: PropTypes.bool,
  handleClick: PropTypes.func,
  translateX: PropTypes.number.isRequired,
  translateY: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  onRemove: PropTypes.func,
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
  isUnknown: false,
  top: 0,
  left: 0,
  right: 'auto',
  translateX: 0,
  translateY: 0,
  className: ''
}

export default withTranslation('files', { withRef: true })(ContextMenu)

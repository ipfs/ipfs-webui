import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Dropdown, DropdownMenu, Option } from '../dropdown/Dropdown.js'
import StrokeCopy from '../../icons/StrokeCopy.js'
import StrokeShare from '../../icons/StrokeShare.js'
import StrokeSpeaker from '../../icons/StrokeSpeaker.js'
import StrokePencil from '../../icons/StrokePencil.js'
import StrokeIpld from '../../icons/StrokeIpld.js'
import StrokeTrash from '../../icons/StrokeTrash.js'
import StrokeDownload from '../../icons/StrokeDownload.js'
import StrokeData from '../../icons/StrokeData.js'
import StrokePin from '../../icons/StrokePin.js'
import { cliCmdKeys } from '../../bundles/files/consts.js'

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
      t, onRename, onRemove, onDownload, onInspect, onShare, onDownloadCar, onPublish,
      translateX, translateY, className, isMfs, isUnknown, isCliTutorModeEnabled
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
          { onShare &&
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
              {t('app:actions.inspect')}
            </Option>
          }
          <Option onClick={this.wrap('onPinning')} isCliTutorModeEnabled={isCliTutorModeEnabled}
            onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.PIN_OBJECT)}>
            <StrokePin className='w2 mr2 fill-aqua' />
            { t('app:actions.setPinning') }
          </Option>
          { !isUnknown && onDownload &&
            <Option onClick={this.wrap('onDownload')} isCliTutorModeEnabled={isCliTutorModeEnabled}
              onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.DOWNLOAD_OBJECT_COMMAND)}>
              <StrokeDownload className='w2 mr2 fill-aqua' />
              {t('app:actions.download')}
            </Option>
          }
          { !isUnknown && onDownloadCar &&
            <Option onClick={this.wrap('onDownloadCar')} isCliTutorModeEnabled={isCliTutorModeEnabled}
              onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.DOWNLOAD_CAR_COMMAND)}>
              <StrokeData className='w2 mr2 fill-aqua' />
              {t('app:actions.downloadCar')}
            </Option>
          }
          { !isUnknown && isMfs && onRename &&
            <Option onClick={this.wrap('onRename')} isCliTutorModeEnabled={isCliTutorModeEnabled}
              onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.RENAME_IPFS_OBJECT)}>
              <StrokePencil className='w2 mr2 fill-aqua' />
              {t('app:actions.rename')}
            </Option>
          }
          { !isUnknown && isMfs && onRemove &&
            <Option onClick={this.wrap('onRemove')} isCliTutorModeEnabled={isCliTutorModeEnabled}
              onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.REMOVE_FILE_FROM_IPFS)}>
              <StrokeTrash className='w2 mr2 fill-aqua' />
              {t('app:actions.remove')}
            </Option>
          }
          { onPublish &&
            <Option onClick={this.wrap('onPublish')} isCliTutorModeEnabled={isCliTutorModeEnabled}
              onCliTutorMode={this.wrap('onCliTutorMode', cliCmdKeys.PUBLISH_WITH_IPNS)}>
              <StrokeSpeaker className='w2 mr2 fill-aqua' />
              {t('actions.publishWithIpns')}
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
  onDownloadCar: PropTypes.func,
  onInspect: PropTypes.func,
  onShare: PropTypes.func,
  onPublish: PropTypes.func,
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

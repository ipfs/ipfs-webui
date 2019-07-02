import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Dropdown, DropdownMenu, Option } from '../dropdown/Dropdown'
import GlyphDots from '../../icons/GlyphDots'
import StrokeCopy from '../../icons/StrokeCopy'
import StrokeShare from '../../icons/StrokeShare'
import StrokePencil from '../../icons/StrokePencil'
import StrokeIpld from '../../icons/StrokeIpld'
import StrokeTrash from '../../icons/StrokeTrash'
import StrokeDownload from '../../icons/StrokeDownload'
import StrokePin from '../../icons/StrokePin'

class ContextMenu extends React.Component {
  static propTypes = {
    isMfs: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    hash: PropTypes.string,
    isUpperDir: PropTypes.bool,
    pinned: PropTypes.bool,
    handleClick: PropTypes.func,
    translateX: PropTypes.number.isRequired,
    translateY: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
    showDots: PropTypes.bool,
    onDelete: PropTypes.func,
    onRename: PropTypes.func,
    onDownload: PropTypes.func,
    onInspect: PropTypes.func,
    onShare: PropTypes.func,
    className: PropTypes.string,
    t: PropTypes.func.isRequired,
    tReady: PropTypes.bool.isRequired
  }

  static defaultProps = {
    isMfs: false,
    isOpen: false,
    isUpperDir: false,
    top: 0,
    left: 0,
    right: 'auto',
    translateX: 0,
    translateY: 0,
    showDots: true,
    className: ''
  }

  state = {
    dropdown: false
  }

  wrap = (name, hash = false) => () => {
    this.props.handleClick()
    this.props[name]()
  }

  render () {
    const {
      t, onRename, onDelete, onDownload, onInspect, onShare,
      translateX, translateY, className, showDots,
      isUpperDir, isMfs, pinned
    } = this.props

    return (
      <Dropdown className={className}>
        { showDots && <GlyphDots width='1.5rem' className='fill-gray-muted pointer hover-fill-gray transition-all' onClick={this.props.handleClick} /> }
        <DropdownMenu
          top={-8}
          arrowMarginRight='11px'
          left='calc(100% - 200px)'
          translateX={-translateX}
          translateY={-translateY}
          open={this.props.isOpen}
          onDismiss={this.props.handleClick}>
          { !isUpperDir && isMfs && onDelete &&
            <Option onClick={this.wrap('onDelete')}>
              <StrokeTrash className='w2 mr2 fill-aqua' />
              {t('actions.delete')}
            </Option>
          }
          { !isUpperDir && isMfs && onRename &&
            <Option onClick={this.wrap('onRename')}>
              <StrokePencil className='w2 mr2 fill-aqua' />
              {t('actions.rename')}
            </Option>
          }
          { !isUpperDir && onDownload &&
            <Option onClick={this.wrap('onDownload')}>
              <StrokeDownload className='w2 mr2 fill-aqua' />
              {t('actions.download')}
            </Option>
          }
          { onInspect &&
            <Option onClick={this.wrap('onInspect')}>
              <StrokeIpld className='w2 mr2 fill-aqua' />
              {t('actions.inspect')}
            </Option>
          }
          <Option onClick={this.wrap(pinned ? 'onUnpin' : 'onPin')}>
            <StrokePin className='w2 mr2 fill-aqua' />
            { pinned ? t('actions.unpin') : t('actions.pin') }
          </Option>
          <CopyToClipboard text={this.props.hash} onCopy={this.props.handleClick}>
            <Option>
              <StrokeCopy className='w2 mr2 fill-aqua' />
              {t('actions.copyHash')}
            </Option>
          </CopyToClipboard>
          { !isUpperDir && onShare &&
            <Option onClick={this.wrap('onShare')}>
              <StrokeShare className='w2 mr2 fill-aqua' />
              {t('actions.share')}
            </Option>
          }
        </DropdownMenu>
      </Dropdown>
    )
  }
}

export default translate('files')(ContextMenu)

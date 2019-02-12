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

class ContextMenu extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    handleClick: PropTypes.func,
    translateX: PropTypes.number,
    translateY: PropTypes.number,
    left: PropTypes.number,
    showDots: PropTypes.bool,
    onDelete: PropTypes.func,
    onRename: PropTypes.func,
    onDownload: PropTypes.func,
    onInspect: PropTypes.func,
    onShare: PropTypes.func,
    hash: PropTypes.string,
    className: PropTypes.string,
    t: PropTypes.func.isRequired,
    tReady: PropTypes.bool.isRequired
  }

  static defaultProps = {
    isOpen: false,
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

  wrap = (name) => () => {
    this.props.handleClick()
    this.props[name]()
  }

  render () {
    const { t, onRename, onDelete, onDownload, onInspect, onShare, translateX, translateY, className, showDots } = this.props

    return (
      <Dropdown className={className}>
        { showDots && <GlyphDots width='1.5rem' className='fill-gray-muted pointer hover-fill-gray transition-all' onClick={this.props.handleClick} /> }
        <DropdownMenu
          top={-8}
          arrowMarginRight='11px'
          left='calc(100% - 200px + 0.5rem)'
          translateX={-translateX}
          translateY={-translateY}
          open={this.props.isOpen}
          onDismiss={this.props.handleClick}>
          { onDelete &&
            <Option onClick={this.wrap('onDelete')}>
              <StrokeTrash className='w2 mr2 fill-aqua' />
              {t('actions.delete')}
            </Option>
          }
          { onRename &&
            <Option onClick={this.wrap('onRename')}>
              <StrokePencil className='w2 mr2 fill-aqua' />
              {t('actions.rename')}
            </Option>
          }
          { onDownload &&
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
          <CopyToClipboard text={this.props.hash} onCopy={this.props.handleClick}>
            <Option>
              <StrokeCopy className='w2 mr2 fill-aqua' />
              {t('actions.copyHash')}
            </Option>
          </CopyToClipboard>
          { onShare &&
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

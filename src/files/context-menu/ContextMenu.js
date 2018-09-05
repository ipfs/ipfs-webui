import React from 'react'
import PropTypes from 'prop-types'
import GlyphDots from '../../icons/GlyphDots'
import { Dropdown, DropdownMenu, Option } from '../dropdown/Dropdown'

import { CopyToClipboard } from 'react-copy-to-clipboard'
import StrokeCopy from '../../icons/StrokeCopy'
import StrokeShare from '../../icons/StrokeShare'
import StrokePencil from '../../icons/StrokePencil'
import StrokeIpld from '../../icons/StrokeIpld'
import StrokeTrash from '../../icons/StrokeTrash'
import StrokeDownload from '../../icons/StrokeDownload'

export default class ContextMenu extends React.Component {
  static propTypes = {
    onDelete: PropTypes.func,
    onRename: PropTypes.func,
    onDownload: PropTypes.func,
    onInspect: PropTypes.func,
    onShare: PropTypes.func,
    hash: PropTypes.string.isRequired
  }

  static defaultProps = {
    top: 0,
    left: 0,
    right: 'auto',
    className: ''
  }

  state = {
    dropdown: false
  }

  toggleDropdown = () => {
    this.setState(s => ({ dropdown: !s.dropdown }))
  }

  wrap = (name) => () => {
    this.toggleDropdown()
    this.props[name]()
  }

  render () {
    const { onRename, onDelete, onDownload, onInspect, onShare } = this.props

    return (
      <Dropdown>
        <GlyphDots width='1.5rem' className='fill-gray-muted pointer hover-fill-gray transition-all' onClick={this.toggleDropdown} />
        <DropdownMenu
          top={-8}
          arrowMarginRight='11px'
          left='calc(100% - 200px + 0.5rem)'
          open={this.state.dropdown}
          onDismiss={this.toggleDropdown} >
          { onDelete &&
            <Option onClick={this.wrap('onDelete')}>
              <StrokeTrash className='w2 mr2 fill-aqua' />
              Delete
            </Option>
          }
          { onRename &&
            <Option onClick={this.wrap('onRename')}>
              <StrokePencil className='w2 mr2 fill-aqua' />
              Rename
            </Option>
          }
          { onDownload &&
            <Option onClick={this.wrap('onDownload')}>
              <StrokeDownload className='w2 mr2 fill-aqua' />
              Download
            </Option>
          }
          { onInspect &&
            <Option onClick={this.wrap('onInspect')}>
              <StrokeIpld className='w2 mr2 fill-aqua' />
              Inspect
            </Option>
          }
          <CopyToClipboard text={this.props.hash} onCopy={this.toggleDropdown}>
            <Option>
              <StrokeCopy className='w2 mr2 fill-aqua' />
              Copy Hash
            </Option>
          </CopyToClipboard>
          { onShare &&
            <Option onClick={this.wrap('onShare')}>
              <StrokeShare className='w2 mr2 fill-aqua' />
              Share
            </Option>
          }
        </DropdownMenu>
      </Dropdown>
    )
  }
}

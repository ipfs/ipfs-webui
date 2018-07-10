import React from 'react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import Checkbox from '../../components/checkbox/Checkbox'
import FileIcon from '../file-icon/FileIcon'
import Status from '../status/Status'
import './File.css'

const Tooltip = ({className = '', show, children, ...props}) => {
  return (
    <div className={`nowrap white bg-navy-muted br2 pa1 f6 absolute ${show ? 'db' : 'dn'} ${className}`} {...props}>
      <span style={{
        width: '17px',
        height: '17px',
        transform: 'translate(-50%, -50%) rotate(45deg)',
        borderRadius: '2px 0px 0px',
        left: '50%',
        zIndex: -1
      }} className='db bg-navy-muted absolute' />
      {children}
    </div>
  )
}

class File extends React.Component {
  state = {
    overflow: false,
    displayTooltip: false
  }

  onResize = () => {
    if (this.state.overflow !== (this.el.offsetWidth < this.el.scrollWidth)) {
      this.setState((s) => ({ overflow: !s.overflow }))
    }
  }

  onMouseOver = () => {
    this.setState({ displayTooltip: true })
  }

  onMouseLeave = () => {
    this.setState({ displayTooltip: false })
  }

  componentDidMount () {
    window.addEventListener('resize', this.onResize)
    this.onResize()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
  }

  render () {
    let {selected, name, type, speed, status, size, onSelect, onNavigate, onCancel} = this.props

    let className = 'File flex items-center bt pv2'

    if (selected) {
      className += ' selected'
    }

    if (status !== null) {
      size = 'N/A'
      status = <Status progress={status} cancel={onCancel} speed={speed} />
    } else {
      size = filesize(size)
    }

    if (type === 'directory') {
      size = ''
    }

    const select = (select) => {
      onSelect(name, select)
    }

    return (
      <div className={className}>
        <div className='pa2 w2'>
          <Checkbox checked={selected} onChange={select} />
        </div>
        <div className='name relative flex items-center flex-grow-1 pa2 w-40'>
          <div className='pointer dib icon flex-shrink-0' onClick={onNavigate}>
            <FileIcon name={name} type={type} />
          </div>
          <span className='pointer truncate'
            ref={(e) => { this.el = e }}
            onClick={onNavigate}
            onMouseOver={this.onMouseOver}
            onMouseLeave={this.onMouseLeave}
          >{name}</span>
          { this.state.overflow &&
            <Tooltip style={{
              bottom: '-10px',
              left: 'calc(50% + 1.125rem)',
              transform: 'translateX(-50%)'
            }} show={this.state.displayTooltip}>{name}</Tooltip>
          }
        </div>
        <div className='status pa2 w-30'>{status}</div>
        <div className='size pa2 w-10'>{size}</div>
      </div>
    )
  }
}

File.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  hash: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  speed: PropTypes.number,
  status: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onCancel: PropTypes.func
}

File.defaultProps = {
  status: null
}

export default File

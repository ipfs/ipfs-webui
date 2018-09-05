import React from 'react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import GlyphSmallCancel from '../../icons/GlyphSmallCancel'
import StrokeShare from '../../icons/StrokeShare'
import StrokePencil from '../../icons/StrokePencil'
import StrokeIpld from '../../icons/StrokeIpld'
import StrokeTrash from '../../icons/StrokeTrash'
import StrokeDownload from '../../icons/StrokeDownload'

const styles = {
  bar: {
    background: '#F0F6FA',
    borderColor: '#CFE0E2',
    color: '#59595A'
  },
  count: {
    backgroundColor: '#69C4CD',
    color: '#F9FAFB',
    width: '38px',
    height: '38px'
  },
  countNumber: {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  size: {
    color: '#A4BFCC'
  }
}

export default class SelectedActions extends React.Component {
  static propTypes = {
    count: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    unselect: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    share: PropTypes.func.isRequired,
    download: PropTypes.func.isRequired,
    rename: PropTypes.func.isRequired,
    inspect: PropTypes.func.isRequired,
    downloadProgress: PropTypes.number
  }

  static defaultActions = {
    className: ''
  }

  state = {
    force100: false
  }

  componentDidUpdate (prev) {
    if (this.props.downloadProgress === 100 && prev.downloadProgress !== 100) {
      this.setState({ force100: true })
      setTimeout(() => {
        this.setState({ force100: false })
      }, 2000)
    }
  }

  get downloadText () {
    if (this.state.force100) {
      return 'Finished!'
    }

    switch (this.props.downloadProgress) {
      case 100:
        return 'Finished!'
      case null:
        return 'Download'
      default:
        return this.props.downloadProgress.toFixed(0) + '%'
    }
  }

  render () {
    let { count, size, unselect, remove, share, download, downloadProgress, rename, inspect, className, style, ...props } = this.props

    const text = (count > 1) ? 'Files selected' : 'File selected'

    let singleFileAction = 'disabled o-50'
    let singleFileTooltip = {
      title: 'Only available for individual files'
    }

    if (count === 1) {
      singleFileAction = 'pointer grow'
      singleFileTooltip = {}
    }

    return (
      <div className={`sans-serif bt w-100 pa3 ${className}`} style={{ ...styles.bar, ...style }} {...props}>
        <div className='flex items-center justify-between'>
          <div className='w5-l'>
            <div className='flex items-center'>
              <div className='mr3 relative f3 fw6 flex-shrink-0 dib br-100' style={styles.count}>
                <span className='absolute' style={styles.countNumber}>{count}</span>
              </div>
              <div className='dn db-l'>
                <p className='ma0'>{text}</p>
                <p className='ma0 mt1 f6' style={styles.size}>Total size: {filesize(size)}</p>
              </div>
            </div>
          </div>
          <div className='flex'>
            <div className='pointer grow tc mh2' onClick={share}>
              <StrokeShare className='w3' fill='#A4BFCC' />
              <p className='ma0 f6'>Share</p>
            </div>
            <div className='pointer grow tc mh2' onClick={download}>
              <StrokeDownload className='w3' fill='#A4BFCC' />
              <p className='ma0 f6'>{this.downloadText}</p>
            </div>
            <div className='pointer grow tc mh2' onClick={remove}>
              <StrokeTrash className='w3' fill='#A4BFCC' />
              <p className='ma0 f6'>Delete</p>
            </div>
            <div className={`tc mh2 ${singleFileAction}`} onClick={(count === 1) ? inspect : null} {...singleFileTooltip}>
              <StrokeIpld className='w3' fill='#A4BFCC' />
              <p className='ma0 f6'>Inspect</p>
            </div>
            <div className={`tc mh2 ${singleFileAction}`} onClick={(count === 1) ? rename : null} {...singleFileTooltip}>
              <StrokePencil className='w3' fill='#A4BFCC' />
              <p className='ma0 f6'>Rename</p>
            </div>
          </div>
          <div className='w5-l'>
            <span onClick={unselect} className='pointer flex items-center justify-end'>
              <span className='mr2 dn db-l'>Deselect all</span>
              <span className='mr2 dn db-m'>Clear</span>
              <GlyphSmallCancel onClick={unselect} className='w1' fill='#F26148' viewBox='37 40 27 27' />
            </span>
          </div>
        </div>
      </div>
    )
  }
}

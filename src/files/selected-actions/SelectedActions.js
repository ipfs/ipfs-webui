import React from 'react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import { translate } from 'react-i18next'
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

class SelectedActions extends React.Component {
  static propTypes = {
    count: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    unselect: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    share: PropTypes.func.isRequired,
    download: PropTypes.func.isRequired,
    rename: PropTypes.func.isRequired,
    inspect: PropTypes.func.isRequired,
    downloadProgress: PropTypes.number,
    t: PropTypes.func.isRequired,
    tReady: PropTypes.bool.isRequired
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
      return this.props.t('finished')
    }

    switch (this.props.downloadProgress) {
      case 100:
        return this.props.t('finished')
      case null:
        return this.props.t('actions.download')
      default:
        return this.props.downloadProgress.toFixed(0) + '%'
    }
  }

  render () {
    let { t, tReady, count, size, unselect, remove, share, download, downloadProgress, rename, inspect, className, style, ...props } = this.props

    let singleFileAction = 'disabled o-50'
    let singleFileTooltip = { title: t('individualFilesOnly') }
    let singleSvgClass = 'w3'

    if (count === 1) {
      singleFileAction = 'pointer'
      singleFileTooltip = {}
      singleSvgClass = 'w3 pointer hover-fill-navy-muted'
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
                <p className='ma0'>{t('filesSelected', { count })}</p>
                <p className='ma0 mt1 f6' style={styles.size}>{t('totalSize', { size: filesize(size) })}</p>
              </div>
            </div>
          </div>
          <div className='flex'>
            <div className='pointer tc mh2' onClick={share}>
              <StrokeShare className='w3 pointer hover-fill-navy-muted' fill='#A4BFCC' />
              <p className='ma0 f6'>{t('actions.share')}</p>
            </div>
            <div className='pointer tc mh2' onClick={download}>
              <StrokeDownload className='w3 pointer hover-fill-navy-muted' fill='#A4BFCC' />
              <p className='ma0 f6'>{this.downloadText}</p>
            </div>
            <div className='pointer tc mh2' onClick={remove}>
              <StrokeTrash className='w3 pointer hover-fill-navy-muted' fill='#A4BFCC' />
              <p className='ma0 f6'>{t('actions.delete')}</p>
            </div>
            <div className={`tc mh2 ${singleFileAction}`} onClick={(count === 1) ? inspect : null} {...singleFileTooltip}>
              <StrokeIpld className={singleSvgClass} fill='#A4BFCC' />
              <p className='ma0 f6'>{t('actions.inspect')}</p>
            </div>
            <div className={`tc mh2 ${singleFileAction}`} onClick={(count === 1) ? rename : null} {...singleFileTooltip}>
              <StrokePencil className={singleSvgClass} fill='#A4BFCC' />
              <p className='ma0 f6'>{t('actions.rename')}</p>
            </div>
          </div>
          <div className='w5-l'>
            <span onClick={unselect} className='pointer flex items-center justify-end'>
              <span className='mr2 dn db-l'>{t('actions.unselectAll')}</span>
              <span className='mr2 dn db-m'>{t('actions.clear')}</span>
              <GlyphSmallCancel onClick={unselect} className='w1' fill='#F26148' viewBox='37 40 27 27' />
            </span>
          </div>
        </div>
      </div>
    )
  }
}

export default translate('files')(SelectedActions)

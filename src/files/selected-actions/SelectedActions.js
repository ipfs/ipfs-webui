/* eslint-disable space-before-function-paren */
import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { humanSize } from '../../lib/files'
import { withTranslation } from 'react-i18next'
import './SelectedActions.css'

import RetroContainer from '../../components/common/atoms/RetroContainer'
import RetroSeparator from '../../components/common/atoms/RetroSeparator'
import RetroButton from '../../components/common/atoms/RetroButton'
// import CloseMark from '../../icons/retro/CloseMark'
import FileRedCloseIcon from '../../icons/retro/files/FileRedCloseIcon'
import FileEditIcon from '../../icons/retro/files/FileEditIcon'
import FileShowIcon from '../../icons/retro/files/FileShowIcon'
import FilePinIcon from '../../icons/retro/files/FilepinIcon'
import FileDeleteIcon from '../../icons/retro/files/FileDeleteIcon'
import FiledownloadIcon from '../../icons/retro/files/FiledowloadIcon'
import FileShareIcon from '../../icons/retro/files/FileShareIcon'

const styles = {
  bar: {
    border: 'none'
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
    color: '#7E7E7E'
  }
}

// const classes = {
//   svg: (v) => v ? 'w3 pointer hover-fill-navy-muted' : 'w3',
//   action: (v) => v ? 'pointer' : 'disabled o-50'
// }

class SelectedActions extends React.Component {
  constructor(props) {
    super(props)
    this.containerRef = React.createRef()
  }

  static propTypes = {
    count: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    unselect: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    setPinning: PropTypes.func.isRequired,
    share: PropTypes.func.isRequired,
    download: PropTypes.func.isRequired,
    rename: PropTypes.func.isRequired,
    inspect: PropTypes.func.isRequired,
    downloadProgress: PropTypes.number,
    t: PropTypes.func.isRequired,
    tReady: PropTypes.bool.isRequired,
    isMfs: PropTypes.bool.isRequired,
    animateOnStart: PropTypes.bool
  }

  static defaultProps = {
    className: ''
  }

  state = {
    force100: false
  }

  componentDidUpdate(prev) {
    if (this.props.downloadProgress === 100 && prev.downloadProgress !== 100) {
      this.setState({ force100: true })
      setTimeout(() => {
        this.setState({ force100: false })
      }, 2000)
    }
  }

  componentDidMount() {
    this.containerRef.current && this.containerRef.current.focus()
  }

  get downloadText() {
    if (this.state.force100) {
      return this.props.t('finished')
    }

    if (!this.props.downloadProgress) {
      return this.props.t('app:actions.download')
    }

    if (this.props.downloadProgress === 100) {
      return this.props.t('finished')
    }

    return this.props.downloadProgress.toFixed(0) + '%'
  }

  render() {
    const { t, tReady, animateOnStart, count, size, unselect, remove, share, setPinning, download, downloadProgress, rename, inspect, className, style, isMfs, ...props } = this.props

    const isSingle = count === 1

    let singleFileTooltip = { title: t('individualFilesOnly') }

    if (count === 1) {
      singleFileTooltip = {}
    }

    return (
      <div className={classNames('spacegrotesk bt w-100 selectedActions', className, animateOnStart && 'selectedActionsAnimated')} style={{ ...styles.bar, ...style }} {...props}>
        <RetroContainer className='flex flex-column items-center justify-between' bgColor='#110D21'>
          <RetroSeparator className='mh1 w-100' colors={['#fff5']} />
          <div className='flex w-100 h3 pv2 w95fa' role="menu" aria-label={t('menuOptions')} ref={this.containerRef} tabIndex="0">
            <div className='w-100 w95fa'>
              <div className='flex items-center ph3 w-100'>
                <div className='white spacegrotesk-bold filelist-selected-count-container'>
                  <span className='filelist-selected-count-text' style={{ fontSize: 20 }}>{count}</span>
                </div>
                <div className='f6 ml2'>
                  <p className='ma0 mt1 white spacegrotesk'> {t('filesSelected', { count })}</p>
                  <p className='ma0 mt1 white spacegrotesk' style={styles.size}>{t('totalSize', { size: humanSize(size) })}</p>
                </div>
              </div>
            </div>
            <RetroButton flat role="menuitem" border='none' width={'100px'} minwidth={'100px'} className='tc mh2' onClick={share}>
              {/* <p className='ma0 f6'>{t('actions.share')}</p> */}
              <FileShareIcon />
            </RetroButton>
            {/* <RetroSeparator inset vertical side='r' /> */}
            <RetroButton flat role="menuitem" border='none' className='tc mh2' width={'100px'} minwidth={'100px'} onClick={download}>
              {/* <p className='ma0 f6'>{this.downloadText}</p> */}
              <FiledownloadIcon />
            </RetroButton>
            {/* <RetroSeparator inset vertical side='r' /> */}
            <RetroButton flat role="menuitem" border='none' disabled={!isMfs} className='tc mh2' width={'100px'} minwidth={'100px'} onClick={isMfs ? remove : null}>
              {/* <p className='ma0 f6'>{t('app:actions.remove')}</p> */}
              <FileDeleteIcon color='white' />
            </RetroButton>
            {/* <RetroSeparator inset vertical side='r' /> */}
            <RetroButton flat role="menuitem" border='none' disabled={!isSingle} width={'100px'} minwidth={'100px'} className='tc mh2' onClick={isSingle ? setPinning : null}>
              {/* <p className='ma0 f6'>{t('app:actions.setPinning')}</p> */}
              <FilePinIcon />
            </RetroButton>
            {/* <RetroSeparator inset vertical side='r' /> */}
            <RetroButton flat role="menuitem" border='none' disabled={!isSingle} width={'100px'} minwidth={'100px'} className='tc mh2' onClick={isSingle ? inspect : null} {...singleFileTooltip}>
              {/* <p className='ma0 f6'>{t('app:actions.inspect')}</p> */}
              <FileShowIcon />
            </RetroButton>
            {/* <RetroSeparator inset vertical side='r' /> */}
            <RetroButton flat role="menuitem" border='none' disabled={!(isSingle && isMfs)} width={'100px'} minwidth={'100px'} className='tc mh2' onClick={(isSingle && isMfs) ? rename : null} {...singleFileTooltip}>
              {/* <p className='ma0 f6'>{t('app:actions.rename')}</p> */}
              <FileEditIcon />
            </RetroButton>
            <RetroSeparator inset vertical side='r' height='25px' margin='auto' colors={['#312F62', '#312F62']} />
            <RetroButton flat border='none' onClick={unselect} width={'100px'} minwidth={'100px'} className='flex items-center justify-end f4' style={{ outline: 'none !important', height: 14 }}>
              {/* <span className='mr2 dn db-l'>{t('app:actions.unselectAll')}</span>
              <span className='mr2 dn db-m'>{t('app:actions.clear')}</span> */}
              <FileRedCloseIcon />
            </RetroButton>
          </div>
        </RetroContainer>
      </div>
    )
  }
}

export default withTranslation('files')(SelectedActions)

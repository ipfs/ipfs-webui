import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { humanSize } from '../../lib/files.js'
import { withTranslation } from 'react-i18next'
import StrokePin from '../../icons/StrokePin.js'
import GlyphSmallCancel from '../../icons/GlyphSmallCancel.js'
import StrokeShare from '../../icons/StrokeShare.js'
import StrokePencil from '../../icons/StrokePencil.js'
import StrokeIpld from '../../icons/StrokeIpld.js'
import StrokeTrash from '../../icons/StrokeTrash.js'
import StrokeDownload from '../../icons/StrokeDownload.js'
import './SelectedActions.css'

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

const classes = {
  svg: (v) => v ? 'w3 pointer hover-fill-navy-muted' : 'w3',
  action: (v) => v ? 'pointer' : 'disabled o-50'
}

class SelectedActions extends React.Component {
  constructor (props) {
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

  componentDidMount () {
    this.containerRef.current && this.containerRef.current.focus()
  }

  render () {
    const { t, tReady, animateOnStart, count, size, unselect, remove, share, setPinning, download, rename, inspect, className, style, isMfs, ...props } = this.props

    const isSingle = count === 1

    let singleFileTooltip = { title: t('individualFilesOnly') }

    if (count === 1) {
      singleFileTooltip = {}
    }

    return (
      <div className={classNames('sans-serif bt w-100 pa3 ph4-l selectedActions', className, animateOnStart && 'selectedActionsAnimated')} style={{ ...styles.bar, ...style }} {...props}>
        <div className='flex items-center justify-between'>
          <div className='w5-l'>
            <div className='flex items-center'>
              <div className='mr3 relative f3 fw6 flex-shrink-0 dib br-100' style={styles.count}>
                <span className='absolute' style={styles.countNumber}>{count}</span>
              </div>
              <div className='dn db-l f6'>
                <p className='ma0'>{t('filesSelected', { count })}</p>
                <p className='ma0 mt1' style={styles.size}>{t('totalSize', { size: humanSize(size) })}</p>
              </div>
            </div>
          </div>
          <div className='flex' role="menu" aria-label={t('menuOptions')} ref={ this.containerRef } tabIndex="0">
            <button role="menuitem" className='tc mh2' onClick={share}>
              <StrokeShare className='w3 hover-fill-navy-muted' fill='#A4BFCC' aria-hidden="true"/>
              <p className='ma0 f6'>{t('actions.share')}</p>
            </button>
            <button role="menuitem" className='tc mh2' onClick={download}>
              <StrokeDownload className='w3 hover-fill-navy-muted' fill='#A4BFCC' aria-hidden="true"/>
              <p className='ma0 f6'>{t('app:actions.download')}</p>
            </button>
            <button role="menuitem" className={classNames('tc mh2', classes.action(isMfs))} onClick={isMfs ? remove : null}>
              <StrokeTrash className={classes.svg(isMfs)} fill='#A4BFCC' aria-hidden="true"/>
              <p className='ma0 f6'>{t('app:actions.remove')}</p>
            </button>
            <button role="menuitem" className={classNames('tc mh2', classes.action(isSingle))} onClick={isSingle ? setPinning : null}>
              <StrokePin className={classes.svg(isSingle)} fill='#A4BFCC' aria-hidden="true"/>
              <p className='ma0 f6'>{t('app:actions.setPinning')}</p>
            </button>
            <button role="menuitem" className={classNames('tc mh2', classes.action(isSingle))} onClick={isSingle ? inspect : null} {...singleFileTooltip}>
              <StrokeIpld className={classes.svg(isSingle)} fill='#A4BFCC' aria-hidden="true"/>
              <p className='ma0 f6'>{t('app:actions.inspect')}</p>
            </button>
            <button role="menuitem" className={classNames('tc mh2', classes.action(isSingle && isMfs))} onClick={(isSingle && isMfs) ? rename : null} {...singleFileTooltip}>
              <StrokePencil className={classes.svg(isSingle && isMfs)} fill='#A4BFCC' aria-hidden="true"/>
              <p className='ma0 f6'>{t('app:actions.rename')}</p>
            </button>
          </div>
          <div>
            <button onClick={unselect} className='flex items-center justify-end f6 charcoal'>
              {/* TODO: Should we go back to the files list when we tab out of here? */}
              <span className='mr2 dn db-l'>{t('app:actions.unselectAll')}</span>
              <span className='mr2 dn db-m'>{t('app:actions.clear')}</span>
              <GlyphSmallCancel onClick={unselect} className='fill-charcoal w1 o-70' viewBox='37 40 27 27' />
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default withTranslation('files')(SelectedActions)

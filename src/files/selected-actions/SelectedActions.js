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
    background: 'var(--theme-bg-tertiary)',
    borderColor: 'var(--theme-border-selectedActions)',
    color: 'var(--theme-text-darkGray)'
  },
  count: {
    backgroundColor: 'var(--theme-button-selectedActionsCount)',
    color: 'var(--theme-text-selectedActionsCount)',
    width: '38px',
    height: '38px'
  },
  countNumber: {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  size: {
    color: 'var(--theme-text-selectedActionsSize)'
  }
}

const classes = {
  svg: (v) => v ? 'w3 pointer' : 'w3',
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
          <div className='flex' role="menu" aria-label={t('menuOptions')} ref={ this.containerRef }>
            <button role="menuitem" className='tc mh2' onClick={share} onMouseEnter={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.fill = 'var(--theme-text-primary)' }} onMouseLeave={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.fill = 'var(--theme-text-selectedActionsSize)' }}>
              <StrokeShare className='w3' style={{ fill: 'var(--theme-text-selectedActionsSize)' }} aria-hidden="true"/>
              <p className='ma0 f6'>{t('actions.share')}</p>
            </button>
            <button role="menuitem" className='tc mh2' onClick={download} onMouseEnter={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.fill = 'var(--theme-text-primary)' }} onMouseLeave={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.fill = 'var(--theme-text-selectedActionsSize)' }}>
              <StrokeDownload className='w3' style={{ fill: 'var(--theme-text-selectedActionsSize)' }} aria-hidden="true"/>
              <p className='ma0 f6'>{t('app:actions.download')}</p>
            </button>
            <button role="menuitem" className={classNames('tc mh2', classes.action(isMfs))} onClick={isMfs ? remove : null} onMouseEnter={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg && isMfs) svg.style.fill = 'var(--theme-text-primary)' }} onMouseLeave={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.fill = 'var(--theme-text-selectedActionsSize)' }}>
              <StrokeTrash className={classes.svg(isMfs)} style={{ fill: 'var(--theme-text-selectedActionsSize)' }} aria-hidden="true"/>
              <p className='ma0 f6'>{t('app:actions.remove')}</p>
            </button>
            <button role="menuitem" className={classNames('tc mh2', classes.action(isSingle))} onClick={isSingle ? setPinning : null} onMouseEnter={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg && isSingle) svg.style.fill = 'var(--theme-text-primary)' }} onMouseLeave={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.fill = 'var(--theme-text-selectedActionsSize)' }}>
              <StrokePin className={classes.svg(isSingle)} style={{ fill: 'var(--theme-text-selectedActionsSize)' }} aria-hidden="true"/>
              <p className='ma0 f6'>{t('app:actions.setPinning')}</p>
            </button>
            <button role="menuitem" className={classNames('tc mh2', classes.action(isSingle))} onClick={isSingle ? inspect : null} {...singleFileTooltip} onMouseEnter={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg && isSingle) svg.style.fill = 'var(--theme-text-primary)' }} onMouseLeave={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.fill = 'var(--theme-text-selectedActionsSize)' }}>
              <StrokeIpld className={classes.svg(isSingle)} style={{ fill: 'var(--theme-text-selectedActionsSize)' }} aria-hidden="true"/>
              <p className='ma0 f6'>{t('app:actions.inspect')}</p>
            </button>
            <button role="menuitem" className={classNames('tc mh2', classes.action(isSingle && isMfs))} onClick={(isSingle && isMfs) ? rename : null} {...singleFileTooltip} onMouseEnter={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg && isSingle && isMfs) svg.style.fill = 'var(--theme-text-primary)' }} onMouseLeave={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.fill = 'var(--theme-text-selectedActionsSize)' }}>
              <StrokePencil className={classes.svg(isSingle && isMfs)} style={{ fill: 'var(--theme-text-selectedActionsSize)' }} aria-hidden="true"/>
              <p className='ma0 f6'>{t('app:actions.rename')}</p>
            </button>
          </div>
          <div>
            <button onClick={unselect} className='flex items-center justify-end f6' style={{ color: 'var(--theme-text-primary)' }}>
              {/* TODO: Should we go back to the files list when we tab out of here? */}
              <span className='mr2 dn db-l'>{t('app:actions.unselectAll')}</span>
              <span className='mr2 dn db-m'>{t('app:actions.clear')}</span>
              <GlyphSmallCancel onClick={unselect} className='w1 o-70' style={{ fill: 'var(--theme-text-primary)' }} viewBox='37 40 27 27' />
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default withTranslation('files')(SelectedActions)

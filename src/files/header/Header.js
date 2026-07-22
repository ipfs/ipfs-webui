import React from 'react'
import classNames from 'classnames'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import { humanSize } from '../../lib/files.js'
// Components
import Breadcrumbs from '../breadcrumbs/Breadcrumbs.js'
import FileInput from '../file-input/FileInput.js'
import Button from '../../components/button/button.tsx'
// Icons
import GlyphDots from '../../icons/GlyphDots.js'
import GlyphPinCloud from '../../icons/GlyphPinCloud.js'
import '../PendingAnimation.css'

const BarOption = ({ children, text, isLink = false, className = '', ...etc }) => (
  <div className={classNames(className, 'tc pa3', etc.onClick && 'pointer')} {...etc}>
    <span className='nowrap db f4' style={{ color: 'var(--theme-text-primary)' }}>{children}</span>
    <span className={`nowrap db ttu f6 montserrat fw4 ${isLink ? 'link' : ''}`} style={{ color: isLink ? 'var(--theme-text-link)' : 'var(--theme-text-secondary)' }}>{text}</span>
  </div>
)

// Tweak human-readable size format to be more compact
const size = (s) => humanSize(s, {
  round: s >= 1073741824 ? 1 : 0, // show decimal > 1GiB
  spacer: ''
})

class Header extends React.Component {
  handleContextMenu = (ev) => {
    const pos = this.dotsWrapper.getBoundingClientRect()
    this.props.handleContextMenu(ev, 'TOP', {
      ...this.props.files,
      // TODO: change to "pinning" and not "pinned"
      pinned: this.props.pins.includes(this.props.files.cid.toString())
    }, pos)
  }

  handleBreadCrumbsContextMenu = (ev, breadcrumbsRef, file) => {
    const pos = breadcrumbsRef.getBoundingClientRect()
    this.props.handleContextMenu(ev, 'TOP', file, pos)
  }

  render () {
    const {
      currentDirectorySize,
      hasUpperDirectory,
      files,
      filesPathInfo,
      filesSize,
      onNavigate,
      repoSize,
      pendingPins,
      failedPins,
      completedPins,
      t,
      children
    } = this.props

    const pinsInQueue = pendingPins.length + failedPins.length + completedPins.length
    const filefound = files && files.type !== 'not-found'
    return (
      <div className='db flex-l justify-between items-center mb3'>
        <div className='flex items-center w-100 justify-between mr3'>
          <div className='breadheader overflow-hidden mr1'>
            <Breadcrumbs className="joyride-files-breadcrumbs" path={filefound ? files.path : '/404'}
            onClick={onNavigate} onContextMenuHandle={(...args) => this.handleBreadCrumbsContextMenu(...args)}
            onAddFiles={this.props.onAddFiles} onMove={this.props.onMove}/>
        </div>
        { children }
        </div>
        <div className='flex justify-between items-center joyride-files-add' style={{ background: 'var(--theme-bg-tertiary)' }}>
          { pinsInQueue > 0 && <a href='#/pins' alt={t('pinningQueue')} title={t('pinningQueue')} className='ml3'>
            <GlyphPinCloud
              style={{ width: '3rem', fill: 'var(--theme-button-teal)' }}
              className='PendingAnimation' />
          </a> }

          <BarOption title={t('currentLocationDescription')} text={hasUpperDirectory ? t('currentLocation') : t('currentLocationRoot')}>
            { hasUpperDirectory
              ? (
                <span>
                  { size(currentDirectorySize) }<span className='f5 gray'>/{ size(filesSize) }</span>
                </span>
                )
              : size(filesSize) }
          </BarOption>

          <BarOption title={t('localDatastoreDescription')} text={t('localDatastore')}>
            { size(repoSize) }
          </BarOption>

          <div className='pa3'>
            <div className='ml-auto flex items-center'>
              { (files && files.type === 'directory' && filesPathInfo.isMfs)
                ? <FileInput
                  onNewFolder={this.props.onNewFolder}
                  onAddFiles={this.props.onAddFiles}
                  onAddByPath={this.props.onAddByPath}
                  onAddByCar={this.props.onAddByCar}
                  onBulkCidImport={this.props.onBulkCidImport}
                  onCliTutorMode={this.props.onCliTutorMode}
                />
                : <div ref={el => { this.dotsWrapper = el }}>
                  <Button bg='bg-navy'
                    color='white'
                    fill='fill-aqua'
                    className='f6 relative flex justify-center items-center tc'
                    minWidth='100px'
                    disabled={!files || filesPathInfo.isRoot || files.type === 'unknown'}
                    onClick={this.handleContextMenu}>
                    <GlyphDots className='w1 mr2' />
                    { t('app:actions.more') }
                  </Button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  'selectPins',
  'selectHasUpperDirectory',
  'selectFilesSize',
  'selectRepoSize',
  'selectRepoNumObjects',
  'selectFilesPathInfo',
  'selectCurrentDirectorySize',
  'selectPendingPins',
  'selectFailedPins',
  'selectCompletedPins',
  withTranslation('files')(Header)
)

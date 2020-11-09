import React from 'react'
import filesize from 'filesize'
import classNames from 'classnames'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
// Components
import Breadcrumbs from '../breadcrumbs/Breadcrumbs'
import FileInput from '../file-input/FileInput'
import Button from '../../components/button/Button'
// Icons
import GlyphDots from '../../icons/GlyphDots'

const BarOption = ({ children, text, isLink = false, className = '', ...etc }) => (
  <div className={classNames(className, 'tc pa3', etc.onClick && 'pointer')} {...etc}>
    <span className='nowrap db f4 charcoal'>{children}</span>
    <span className={`nowrap db ttu f6 montserrat fw4 ${isLink ? 'link' : 'charcoal-muted'}`}>{text}</span>
  </div>
)

function humanSize (size) {
  if (!size) return 'N/A'

  return filesize(size || 0, {
    round: size >= 1000000000 ? 1 : 0, spacer: ''
  })
}

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
      t
    } = this.props

    return (
      <div className='db flex-l justify-between items-center'>
        <div className='mb3 overflow-hidden mr2'>
          <Breadcrumbs className="joyride-files-breadcrumbs" path={files ? files.path : '/404'}
            onClick={onNavigate} onContextMenuHandle={(...args) => this.handleBreadCrumbsContextMenu(...args)}
            onAddFiles={this.props.onAddFiles} onMove={this.props.onMove}/>
        </div>

        <div className='mb3 flex justify-between items-center bg-snow-muted joyride-files-add'>
          <BarOption title={t('filesDescription')} text={t('app:terms:files')}>
            { hasUpperDirectory
              ? (
                <span>
                  { humanSize(currentDirectorySize) }<span className='f5 gray'>/{ humanSize(filesSize) }</span>
                </span>
              )
              : humanSize(filesSize) }
          </BarOption>

          <BarOption title={t('allBlocksDescription')} text={t('allBlocks')}>
            { humanSize(repoSize) }
          </BarOption>

          <div className='pa3'>
            <div className='ml-auto flex items-center'>
              { (files && files.type === 'directory' && filesPathInfo.isMfs)
                ? <FileInput
                  onNewFolder={this.props.onNewFolder}
                  onAddFiles={this.props.onAddFiles}
                  onAddByPath={this.props.onAddByPath}
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
  withTranslation('files')(Header)
)

import React from 'react'
import filesize from 'filesize'
import SimplifyNumber from 'simplify-number'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
// Components
import Breadcrumbs from '../breadcrumbs/Breadcrumbs'
import FileInput from '../file-input/FileInput'
import Button from '../../components/button/Button'
// Icons
import GlyphDots from '../../icons/GlyphDots'

function BarOption ({ children, title, isLink = false, className = '', ...etc }) {
  className += ' tc pa3'

  if (etc.onClick) className += ' pointer'

  return (
    <div className={className} {...etc}>
      <span className='nowrap db f4 navy'>{children}</span>
      <span className={`db ttl ${isLink ? 'navy underline' : 'gray'}`}>{title}</span>
    </div>
  )
}

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
      pinned: this.props.pins.includes(this.props.files.hash)
    }, pos)
  }

  render () {
    const {
      files,
      t,
      pins,
      filesPathInfo,
      filesSize,
      repoNumObjects,
      repoSize,
      onNavigate
    } = this.props

    return (
      <div className='db flex-l justify-between items-center'>
        <div className='mb3 overflow-hidden mr2'>
          <Breadcrumbs className="joyride-files-breadcrumbs" path={files ? files.path : '/404'} onClick={onNavigate} />
        </div>

        <div className='mb3 flex justify-between items-center bg-snow-muted joyride-files-add'>
          <BarOption title={t('files')} isLink onClick={() => { onNavigate('/files') }}>
            { humanSize(filesSize) }
          </BarOption>

          <BarOption title={t('pins')} isLink onClick={() => { onNavigate('/pins') }}>
            { pins ? SimplifyNumber(pins.length) : '-' }
          </BarOption>

          <BarOption title={t('blocks')}>
            { repoNumObjects ? SimplifyNumber(repoNumObjects, { decimal: 0 }) : 'N/A' }
          </BarOption>

          <BarOption title={t('repo')}>
            { humanSize(repoSize) }
          </BarOption>

          <div className='pa3'>
            <div className='ml-auto flex items-center'>
              { (files && files.type === 'directory' && filesPathInfo.isMfs)
                ? <FileInput
                  onNewFolder={this.props.onNewFolder}
                  onAddFiles={this.props.onAddFiles}
                  onAddByPath={this.props.onAddByPath} />
                : <div ref={el => { this.dotsWrapper = el }}>
                  <Button bg='bg-navy'
                    color='white'
                    fill='fill-aqua'
                    className='f6 relative flex justify-center items-center'
                    minWidth='100px'
                    disabled={!files || filesPathInfo.isRoot || files.type === 'unknown'}
                    onClick={this.handleContextMenu}>
                    <GlyphDots className='w1 mr2' />
                    { t('more') }
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
  'selectFilesSize',
  'selectRepoSize',
  'selectRepoNumObjects',
  'selectFilesPathInfo',
  withTranslation('files')(Header)
)

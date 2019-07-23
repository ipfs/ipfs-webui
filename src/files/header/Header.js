import React from 'react'
import SimplifyNumber from 'simplify-number'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
// Components
import Breadcrumbs from '../breadcrumbs/Breadcrumbs'
import FileInput from '../file-input/FileInput'
import Button from '../../components/button/Button'
// Icons
import GlyphDots from '../../icons/GlyphDots'
import GlyphHome from '../../icons/GlyphHome'

function BarOption ({ children, title, className = '', ...etc }) {
  className += ' tc pa3'

  if (etc.onClick) className += ' pointer'

  return (
    <div className={className} {...etc}>
      <span className='db f4 navy'>{children}</span>
      <span className='db ttl gray'>{title}</span>
    </div>
  )
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
      files, writeFilesProgress, t,
      pins,
      filesPathInfo,
      repoNumObjects,
      onNavigate
    } = this.props

    return (
      <div className='db flex-l justify-between items-center'>
        <div className='mb3 flex items-center'>
          <Breadcrumbs path={files ? files.path : '/404'} onClick={onNavigate} />
        </div>

        <div className='mb3 flex justify-between items-center bg-snow-muted'>
          <BarOption title={t('blocks')}>
            { repoNumObjects ? SimplifyNumber(repoNumObjects, { decimal: 0 }) : 'N/A' }
          </BarOption>

          <BarOption title={t('pins')} onClick={() => { onNavigate('/pins') }}>
            { pins ? SimplifyNumber(pins.length) : '-' }
          </BarOption>

          <BarOption title={t('files')} onClick={() => { onNavigate('/files') }}>
            <GlyphHome viewBox='20 20 60 60' className='w1 h1 fill-navy' />
          </BarOption>

          <div className='pa3'>
            <div className='ml-auto flex items-center'>
              { (files && files.type === 'directory' && filesPathInfo.isMfs)
                ? <FileInput
                  onNewFolder={this.props.onNewFolder}
                  onAddFiles={this.props.onAddFiles}
                  onAddByPath={this.props.onAddByPath}
                  addProgress={writeFilesProgress} />
                : <div ref={el => { this.dotsWrapper = el }}>
                  <Button bg='bg-navy'
                    color='white'
                    fill='fill-aqua'
                    className='f6 relative flex justify-center items-center'
                    minWidth='100px'
                    disabled={!files || filesPathInfo.isRoot}
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
  'selectRepoSize',
  'selectRepoNumObjects',
  'selectFilesPathInfo',
  'selectWriteFilesProgress',
  translate('files')(Header)
)

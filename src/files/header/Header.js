import React from 'react'
import SimplifyNumber from 'simplify-number'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import { MFS_PATH } from '../../bundles/files'
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
    this.props.handleContextMenu(ev, 'TOP', this.props.files, pos)
  }

  render () {
    const {
      files, writeFilesProgress, t,
      pins,
      filesIsMfs,
      repoNumObjects,
      onNavigate
    } = this.props

    const writableFiles = files && files.type === 'directory' && filesIsMfs
    const actionableFiles = files && files.path !== MFS_PATH && files.path !== '/ipfs' && files.path !== '/ipns'

    return (
      <div className='db flex-l justify-between'>
        <div className='mb3'>
          <div className='flex items-center'>
            <Breadcrumbs path={files ? files.path : '/404'} onClick={onNavigate} />
          </div>
          <span className='db f7 mid-gray'>CID: <span className='gray'>{files && files.hash ? files.hash : t('hashUnavailable')}</span></span>
        </div>

        <div className='mb3 flex justify-between items-center bg-snow-muted'>
          <BarOption title={t('blocks')}>
            { repoNumObjects ? SimplifyNumber(repoNumObjects) : 'N/A' }
          </BarOption>

          <BarOption title={t('pins')} onClick={() => { onNavigate('/ipfs') }}>
            { pins ? SimplifyNumber(pins.length) : '-' }
          </BarOption>

          <BarOption title={t('files')} onClick={() => { onNavigate('/') }}>
            <GlyphHome viewBox='25 25 105 105' className='w1 h1 fill-navy' />
          </BarOption>

          <div className='pa3'>
            <div className='ml-auto flex items-center'>
              { writableFiles
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
                    disabled={!actionableFiles}
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
  'selectFilesIsMfs',
  'selectWriteFilesProgress',
  translate('files')(Header)
)

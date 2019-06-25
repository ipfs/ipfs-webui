import React from 'react'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import { MFS_PATH } from '../../bundles/files'
// Components
import Breadcrumbs from '../breadcrumbs/Breadcrumbs'
import FileInput from '../file-input/FileInput'
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
    const dotsPosition = this.dotsWrapper.getBoundingClientRect()
    this.props.handleContextMenu(ev, 'LEFT', this.props.files, dotsPosition)
  }

  render () {
    const {
      files, writeFilesProgress, t,
      // repoSize,
      pins,
      filesIsMfs,
      repoNumObjects,
      doFilesNavigateTo
    } = this.props

    const writableFiles = files.type === 'directory' && filesIsMfs
    const actionableFiles = files.path !== MFS_PATH && files.path !== '/ipfs' && files.path !== '/ipns'

    return (
      <div className='db flex-l justify-between'>
        <div className='mb3'>
          <Breadcrumbs path={files.path} onClick={doFilesNavigateTo} />
          <span className='db f7 mid-gray'>CID: <span className='gray'>{files && files.hash ? files.hash : t('hashUnavailable')}</span></span>
        </div>

        <div className='mb3 flex justify-between bg-snow-muted'>
          { /* TODO: see https://www.npmjs.com/package/simplify-number  */ }
          <BarOption title={t('blocks')}>
            { repoNumObjects || 'N/A' }
          </BarOption>

          <BarOption title={t('pins')} onClick={() => { doFilesNavigateTo('/ipfs') }}>
            { pins ? pins.length : 'N/A' }
          </BarOption>

          <BarOption title={t('home')} onClick={() => { doFilesNavigateTo('/') }}>
            <GlyphHome viewBox='25 25 105 105' className='w1 h1 fill-navy' />
          </BarOption>

          <div className='pa3'>
            { writableFiles &&
              <div className='ml-auto flex items-center'>
                <FileInput
                  onNewFolder={this.props.onNewFolder /* TODO: hide on click */ }
                  onAddFiles={this.props.onAdd}
                  onAddByPath={this.props.onAddByPath}
                  addProgress={writeFilesProgress} />
              </div>
            }

            { !writableFiles && actionableFiles &&
              <div ref={el => { this.dotsWrapper = el }} className='ml-auto' style={{ width: '1.5rem' }}> {/* to render correctly in Firefox */}
                <GlyphDots className='fill-gray-muted pointer hover-fill-gray transition-all' onClick={this.handleContextMenu} />
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  'doFilesNavigateTo',
  'selectFiles',
  'selectPins',
  'selectRepoSize',
  'selectRepoNumObjects',
  'selectFilesIsMfs',
  'selectWriteFilesProgress',
  translate('files')(Header)
)

import React from 'react'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import { MFS_PATH } from '../../bundles/files'
// Components
import Breadcrumbs from '../breadcrumbs/Breadcrumbs'
import FileInput from '../file-input/FileInput'
// Icons
import GlyphDots from '../../icons/GlyphDots'

function BarOption ({ children, className = '', ...etc }) {
  className += ' tc pa3'

  if (etc.onClick) className += ' pointer'

  return (
    <div className={className} {...etc}>
      {children}
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
      <div className='flex-ns justify-between'>
        <div className='mb3'>
          <Breadcrumbs path={files.path} onClick={doFilesNavigateTo} />
          <span className='db f7 mid-gray'>CID: <span className='gray'>{files && files.hash ? files.hash : t('hashUnavailable')}</span></span>
        </div>
        
        <div className='mb3 flex justify-between bg-snow-muted'>
          { /* TODO: see https://www.npmjs.com/package/simplify-number  */ }
          <BarOption>
            <span className='db f4'>{repoNumObjects || 'N/A' }</span>
            <span className='db gray'>blocks</span>
          </BarOption>

          <BarOption onClick={() => { doFilesNavigateTo('/ipfs') }}>
            <span className='db f4'>{ pins ? pins.length : 'N/A' }</span>
            <span className='db gray'>pins</span>
          </BarOption>

          <BarOption onClick={() => { doFilesNavigateTo('/') }}>
            Home
          </BarOption>
        
          { writableFiles &&
            <div className='ml-auto flex items-center'>
              <FileInput
                onNewFolder={this.props.onNewFolder}
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

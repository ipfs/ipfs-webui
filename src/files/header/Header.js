import React from 'react'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
// Components
import Breadcrumbs from '../breadcrumbs/Breadcrumbs'
import FileInput from '../file-input/FileInput'
import Button from '../../components/button/Button'
// Icons
import GlyphDots from '../../icons/GlyphDots'
import FolderIcon from '../../icons/StrokeFolder'

function BarOption ({ children, className = '', ...etc }) {
  className += ' pa3'

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
      filesIsMfs,
      repoNumObjects,
      doFilesNavigateTo
    } = this.props

    const writableFiles = files.type === 'directory' && filesIsMfs
    const actionableFiles = files.path !== '/mfs' && files.path !== '/ipfs' && files.path !== '/ipns'

    return (
      <div>
        <div className='mb4 flex justify-between bg-snow-muted'>
          <BarOption>
            <span className='b'>{repoNumObjects || 'N/A' }</span> Blocks
          </BarOption>

          <BarOption onClick={() => { doFilesNavigateTo('/ipfs') }}>
            <span className='b'>N/A</span> Pins
          </BarOption>

          <BarOption onClick={() => { doFilesNavigateTo('/') }}>
            MFS
          </BarOption>
        </div>

        <div className='flex flex-wrap items-center mb3'>
          <Breadcrumbs path={files.path} onClick={doFilesNavigateTo} />

          { writableFiles &&
            <div className='ml-auto flex items-center'>
              <Button
                className='mr3 f6 pointer'
                color='charcoal-muted'
                bg='bg-transparent'
                onClick={this.props.onNewFolder}>
                <FolderIcon viewBox='10 15 80 80' height='20px' className='fill-charcoal-muted w2 v-mid' />
                <span className='fw3'>{t('newFolder')}</span>
              </Button>
              <FileInput
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
  'selectRepoSize',
  'selectRepoNumObjects',
  'selectFilesIsMfs',
  'selectWriteFilesProgress',
  translate('files')(Header)
)

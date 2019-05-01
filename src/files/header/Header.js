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

class Header extends React.Component {
  handleContextMenu = (ev) => {
    const dotsPosition = this.dotsWrapper.getBoundingClientRect()
    this.props.handleContextMenu(ev, 'LEFT', this.props.files, dotsPosition)
  }

  render () {
    const {
      files, writeFilesProgress, t,
      doFilesNavigateTo
    } = this.props

    return (
      <div className='flex flex-wrap items-center mb3'>
        <Breadcrumbs path={files.path} onClick={doFilesNavigateTo} />

        { files.type === 'directory'
          ? (
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
          ) : (
            <div ref={el => { this.dotsWrapper = el }} className='ml-auto' style={{ width: '1.5rem' }}> {/* to render correctly in Firefox */}
              <GlyphDots className='fill-gray-muted pointer hover-fill-gray transition-all' onClick={this.handleContextMenu} />
            </div>
          )}
      </div>
    )
  }
}

export default connect(
  'doFilesNavigateTo',
  'selectFiles',
  'selectWriteFilesProgress',
  translate('files')(Header)
)

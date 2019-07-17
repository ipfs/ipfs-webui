import React from 'react'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { filesToStreams } from '../../lib/files'
// Icons
import DocumentIcon from '../../icons/StrokeDocument'
import FolderIcon from '../../icons/StrokeFolder'
import NewFolderIcon from '../../icons/StrokeNewFolder'
import DecentralizationIcon from '../../icons/StrokeDecentralization'
// Components
import { Dropdown, DropdownMenu, Option } from '../dropdown/Dropdown'
import Button from '../../components/button/Button'

const AddButton = translate('files')(({ progress = null, disabled, t, tReady, i18n, lng, ...props }) => {
  const sending = progress !== null

  return (
    <Button bg='bg-navy' color='white' disabled={sending || disabled} className='f6 relative' minWidth='100px' {...props}>
      <div className='absolute top-0 left-0 1 pa2 w-100 z-2'>
        { sending ? `${progress.toFixed(0)}%` : (<span><span className='aqua'>+</span> {t('addToIPFS')}</span>) }
      </div>&nbsp;
      { sending &&
        <div className='transition-all absolute top-0 br1 left-0 h-100 z-1' style={{ width: `${progress}%`, background: 'rgba(0,0,0,0.1)' }} /> }
    </Button>
  )
})

class FileInput extends React.Component {
  state = {
    dropdown: false,
    force100: false
  }

  toggleDropdown = () => {
    this.setState(s => ({ dropdown: !s.dropdown }))
  }

  onAddFolder = async () => {
    const { isIpfsDesktop, doDesktopSelectDirectory, onAddFiles } = this.props

    this.toggleDropdown()

    if (!isIpfsDesktop) {
      return this.folderInput.click()
    }

    const files = await doDesktopSelectDirectory()
    if (files) {
      onAddFiles(files)
    }
  }

  onAddFile = async () => {
    this.toggleDropdown()
    return this.filesInput.click()
  }

  componentDidUpdate (prev) {
    if (this.props.writeFilesProgress === 100 && prev.writeFilesProgress !== 100) {
      this.setState({ force100: true })
      setTimeout(() => {
        this.setState({ force100: false })
      }, 2000)
    }
  }

  onInputChange = (input) => async () => {
    this.props.onAddFiles(await filesToStreams(input.files))
    input.value = null
  }

  onAddByPath = () => {
    this.props.onAddByPath()
    this.toggleDropdown()
  }

  onNewFolder = () => {
    this.props.onNewFolder()
    this.toggleDropdown()
  }

  render () {
    let { progress, t } = this.props
    if (this.state.force100) {
      progress = 100
    }

    return (
      <div className={this.props.className}>
        <Dropdown>
          <AddButton disabled={this.props.disabled} progress={progress} onClick={this.toggleDropdown} />
          <DropdownMenu
            top={3}
            open={this.state.dropdown}
            onDismiss={this.toggleDropdown} >
            <Option onClick={this.onAddFile}>
              <DocumentIcon className='fill-aqua w2 mr1' />
              {t('addFile')}
            </Option>
            <Option onClick={this.onAddFolder}>
              <FolderIcon className='fill-aqua w2 mr1' />
              {t('addFolder')}
            </Option>
            <Option onClick={this.onAddByPath}>
              <DecentralizationIcon className='fill-aqua w2 mr1' />
              {t('addByPath')}
            </Option>
            <Option onClick={this.onNewFolder}>
              <NewFolderIcon className='fill-aqua w2 h2 mr1' />
              {t('newFolder')}
            </Option>
          </DropdownMenu>
        </Dropdown>

        <input
          type='file'
          className='dn'
          multiple
          ref={el => { this.filesInput = el }}
          onChange={this.onInputChange(this.filesInput)} />

        <input
          type='file'
          className='dn'
          multiple
          webkitdirectory='true'
          ref={el => { this.folderInput = el }}
          onChange={this.onInputChange(this.folderInput)} />
      </div>
    )
  }
}

FileInput.propTypes = {
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired,
  onAddFiles: PropTypes.func.isRequired,
  onAddByPath: PropTypes.func.isRequired,
  onNewFolder: PropTypes.func.isRequired,
  writeFilesProgress: PropTypes.number,
  isIpfsDesktop: PropTypes.bool.isRequired,
  doDesktopSelectDirectory: PropTypes.func
}

export default connect(
  'selectIsIpfsDesktop',
  'selectWriteFilesProgress',
  'doDesktopSelectDirectory',
  translate('files')(FileInput)
)

import React from 'react'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
// Icons
import DocumentIcon from '../../icons/StrokeDocument'
import FolderIcon from '../../icons/StrokeFolder'
import NewFolderIcon from '../../icons/StrokeNewFolder'
import DecentralizationIcon from '../../icons/StrokeDecentralization'
// Components
import { Dropdown, DropdownMenu, Option } from '../dropdown/Dropdown'
import Button from '../../components/button/Button'

const AddButton = withTranslation('files')(
  ({ t, onClick }) => (
    <Button id='import-button' bg='bg-navy' color='white' className='f6 flex justify-center items-center' minWidth='100px' onClick={onClick}>
      <span><span className='aqua'>+</span> {t('importToIPFS')}</span>
    </Button>
  )
)

class FileInput extends React.Component {
  state = {
    dropdown: false
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

  onInputChange = (input) => async () => {
    this.props.onAddFiles(input.files)
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
    const { t } = this.props

    return (
      <div className={this.props.className}>
        <Dropdown>
          <AddButton onClick={this.toggleDropdown} />
          <DropdownMenu
            top={3}
            open={this.state.dropdown}
            onDismiss={this.toggleDropdown} >
            <Option onClick={this.onAddFile} id='add-file'>
              <DocumentIcon className='fill-aqua w2 mr1' />
              {t('addFile')}
            </Option>
            <Option onClick={this.onAddFolder} id='add-folder'>
              <FolderIcon className='fill-aqua w2 mr1' />
              {t('addFolder')}
            </Option>
            <Option onClick={this.onAddByPath} id='add-by-path'>
              <DecentralizationIcon className='fill-aqua w2 mr1' />
              {t('addByPath')}
            </Option>
            <Option onClick={this.onNewFolder} id='add-new-folder'>
              <NewFolderIcon className='fill-aqua w2 h2 mr1' />
              {t('newFolder')}
            </Option>
          </DropdownMenu>
        </Dropdown>

        <input
          id='file-input'
          type='file'
          className='dn'
          multiple
          ref={el => { this.filesInput = el }}
          onChange={this.onInputChange(this.filesInput)} />

        <input
          id='directory-input'
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
  onAddFiles: PropTypes.func.isRequired,
  onAddByPath: PropTypes.func.isRequired,
  onNewFolder: PropTypes.func.isRequired,
  isIpfsDesktop: PropTypes.bool.isRequired,
  doDesktopSelectDirectory: PropTypes.func
}

export default connect(
  'selectIsIpfsDesktop',
  'doDesktopSelectDirectory',
  withTranslation('files')(FileInput)
)

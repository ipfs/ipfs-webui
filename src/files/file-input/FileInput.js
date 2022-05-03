/* eslint-disable space-before-function-paren */
import React from 'react'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { normalizeFiles } from '../../lib/files'
// Components
import { Dropdown, DropdownMenu, Option } from '../dropdown/Dropdown'
import { cliCmdKeys } from '../../bundles/files/consts'
import RetroText from '../../components/common/atoms/RetroText'
import FullGradientButton from '../../components/common/atoms/FullGradientButton'
import SectionIcon from '../../icons/retro/SectionIcon'
import FileMenuIcon from '../../icons/retro/files/FileMenuIcon'
import FileMenuFolderIcon from '../../icons/retro/files/FileMenuFolder'
import FileMenuLocationIcon from '../../icons/retro/files/FileMenuLocation'
import FileMenuAddIcon from '../../icons/retro/files/FileMenuAddIcon'

const AddButton = withTranslation('app')(
  ({ t, onClick, active }) => (
    <FullGradientButton active={active} id='import-button' color='white' className='f6 flex justify-center items-center' minWidth='100px' onClick={onClick}>
      <RetroText className='spacegrotesk white'>
        {t('actions.import')}
        <SectionIcon color={'white'} style={{ position: 'relative', left: '5px', transform: 'rotate(90deg)' }} />
      </RetroText>

    </FullGradientButton>
  )
)

class FileInput extends React.Component {
  state = {
    dropdown: false
  }

  toggleDropdown = () => {
    this.setState(s => ({ dropdown: !s.dropdown }))
  }

  onAddFolder = () => {
    this.toggleDropdown()
    return this.folderInput.click()
  }

  onAddFile = async () => {
    this.toggleDropdown()
    return this.filesInput.click()
  }

  onInputChange = (input) => async () => {
    this.props.onAddFiles(normalizeFiles(input.files))
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

  onCliTutorMode = async (cliOptions) => {
    await this.props.doSetCliOptions(cliOptions)
    this.props.onCliTutorMode()
    this.toggleDropdown()
  }

  render() {
    const { t, isCliTutorModeEnabled } = this.props

    return (
      <div className={this.props.className}>
        <Dropdown>
          <AddButton active={this.state.dropdown} onClick={this.toggleDropdown} />
          <DropdownMenu
            top={-10}
            width={160}
            open={this.state.dropdown}
            onDismiss={this.toggleDropdown} >
            <Option onClick={this.onAddFile} id='add-file' onCliTutorMode={() => this.onCliTutorMode(cliCmdKeys.ADD_FILE)}
              isCliTutorModeEnabled={isCliTutorModeEnabled}>
              <FileMenuIcon />&nbsp;&nbsp;&nbsp;
              {t('app:terms.file')}
            </Option>
            <Option onClick={this.onAddFolder} id='add-folder' onCliTutorMode={() => this.onCliTutorMode(cliCmdKeys.ADD_DIRECTORY)}
              isCliTutorModeEnabled={isCliTutorModeEnabled}>
              <FileMenuFolderIcon />&nbsp;&nbsp;&nbsp;
              {t('app:terms.folder')}
            </Option>
            <Option onClick={this.onAddByPath} id='add-by-path' onCliTutorMode={() => this.onCliTutorMode(cliCmdKeys.FROM_IPFS)}
              isCliTutorModeEnabled={isCliTutorModeEnabled}>
              <FileMenuLocationIcon />&nbsp;&nbsp;&nbsp;&nbsp;
              {t('addByPath')}
            </Option>
            <Option onClick={this.onNewFolder} id='add-new-folder' onCliTutorMode={() => this.onCliTutorMode(cliCmdKeys.CREATE_NEW_DIRECTORY)}
              isCliTutorModeEnabled={isCliTutorModeEnabled}>
              <FileMenuAddIcon />&nbsp;&nbsp;&nbsp;
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
  onNewFolder: PropTypes.func.isRequired
}

export default connect(
  'selectIsCliTutorModeEnabled',
  'doOpenCliTutorModal',
  'doSetCliOptions',
  withTranslation('files')(FileInput)
)

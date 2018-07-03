import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../components/button/Button'
import DocumentIcon from '../../icons/StrokeDocument'
import FolderIcon from '../../icons/StrokeFolder'
import {Dropdown, DropdownMenu} from '@tableflip/react-dropdown'

export default class FileInput extends React.Component {
  static propTypes = {
    onAddFiles: PropTypes.func.isRequired
  }

  state = {
    open: false
  }

  toggleOpen = () => {
    this.setState(s => ({ open: !s.open }))
  }

  onFilesInputChange = () => {
    this.props.onAddFiles(this.filesInput.files)
    this.filesInput.value = null
  }

  onFolderInputChange = () => {
    this.props.onAddFiles(this.folderInput.files)
    this.folderInput.value = null
  }

  render () {
    return (
      <div>
        <Dropdown>
          <Button className='f7' onClick={this.toggleOpen}>+ Add to IPFS</Button>
          <DropdownMenu open={this.state.open} width={200} onDismiss={this.toggleOpen} alignRight className='bg-aqua-muted' >
            <nav className='flex flex-column pa2'>
              <a className='dim ma2 pointer flex items-center' onClick={() => this.filesInput.click()}>
                <DocumentIcon className='fill-aqua w2 mr1' />
                Add file
              </a>
              <a className='dim ma2 pointer flex items-center' onClick={() => this.folderInput.click()}>
                <FolderIcon className='fill-aqua w2 mr1' />
                Add folder
              </a>
            </nav>
          </DropdownMenu>
        </Dropdown>

        <input
          type='file'
          className='dn'
          multiple
          ref={el => { this.filesInput = el }}
          onChange={this.onFilesInputChange} />

        <input
          type='file'
          className='dn'
          multiple
          webkitdirectory='true'
          ref={el => { this.folderInput = el }}
          onChange={this.onFolderInputChange} />
      </div>
    )
  }
}

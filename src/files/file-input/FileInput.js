import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../components/button/Button'

import {Dropdown, DropdownMenu} from '@tableflip/react-dropdown'

export default class FileInput extends React.Component {
  static propTypes = {
    onAddFiles: PropTypes.func.isRequired,
    onAddFolder: PropTypes.func.isRequired,
    onAddPath: PropTypes.func.isRequired
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
            <nav className='flex flex-column pa3'>
              <a className='pointer' onClick={() => this.filesInput.click()}>Add file</a>
              <a className='pointer' onClick={() => this.folderInput.click()}>Add folder</a>
              <a href='#'>Add by IPFS Path</a>
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

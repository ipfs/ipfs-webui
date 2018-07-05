import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../components/button/Button'
import DocumentIcon from '../../icons/StrokeDocument'
import FolderIcon from '../../icons/StrokeFolder'
import DecentralizationIcon from '../../icons/StrokeDecentralization'
import {Dropdown, DropdownMenu} from '@tableflip/react-dropdown'

import Overlay from '../overlay/Overlay'
import ByPathModal from './ByPathModal'

export default class FileInput extends React.Component {
  static propTypes = {
    onAddFiles: PropTypes.func.isRequired,
    onAddByPath: PropTypes.func.isRequired
  }

  state = {
    dropdown: false,
    modal: false
  }

  toggleDropdown = () => {
    this.setState(s => ({ dropdown: !s.dropdown }))
  }

  toggleModal = () => {
    this.setState(s => ({ modal: !s.modal }))
  }

  onInputChange = (input) => () => {
    this.props.onAddFiles(input.files)
    input.value = null
    this.toggleDropdown()
  }

  onAddByPath = (path) => {
    this.props.onAddByPath(path)
    this.toggleModal()
  }

  render () {
    return (
      <div>
        <Dropdown>
          <Button className='f7' onClick={this.toggleDropdown}>+ Add to IPFS</Button>
          <DropdownMenu
            top={3}
            className='br2 charcoal'
            boxShadow='rgba(105, 196, 205, 0.5) 0px 1px 10px 0px'
            width={200}
            alignRight
            open={this.state.dropdown}
            onDismiss={this.toggleDropdown} >
            <nav className='flex flex-column pa2'>
              <a className='dim ma2 pointer flex items-center' onClick={() => this.filesInput.click()}>
                <DocumentIcon className='fill-aqua w2 mr1' />
                Add file
              </a>
              <a className='dim ma2 pointer flex items-center' onClick={() => this.folderInput.click()}>
                <FolderIcon className='fill-aqua w2 mr1' />
                Add folder
              </a>
              <a className='dim ma2 pointer flex items-center' onClick={this.toggleModal}>
                <DecentralizationIcon className='fill-aqua w2 mr1' />
                Add by path
              </a>
            </nav>
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

        <Overlay show={this.state.modal} onLeave={this.toggleModal}>
          <ByPathModal
            className='outline-0'
            onCancel={this.toggleModal}
            onSubmit={this.onAddByPath} />
        </Overlay>
      </div>
    )
  }
}

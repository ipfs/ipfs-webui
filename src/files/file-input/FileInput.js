import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../components/button/Button'
import DocumentIcon from '../../icons/StrokeDocument'
import FolderIcon from '../../icons/StrokeFolder'
import DecentralizationIcon from '../../icons/StrokeDecentralization'
import {Dropdown, DropdownMenu} from '@tableflip/react-dropdown'
import Overlay from '../../components/overlay/Overlay'
import ByPathModal from './ByPathModal'
import NewFolderModal from './NewFolderModal'

const Option = ({children, onClick, className = '', ...props}) => (
  <a className={`bg-animate hover-bg-near-white pa2 pointer flex items-center ${className}`} onClick={onClick} {...props}>
    {children}
  </a>
)

export default class FileInput extends React.Component {
  static propTypes = {
    onMakeDir: PropTypes.func.isRequired,
    onAddFiles: PropTypes.func.isRequired,
    onAddByPath: PropTypes.func.isRequired
  }

  state = {
    dropdown: false,
    byPathModal: false,
    newFolderModal: false
  }

  toggleDropdown = () => {
    this.setState(s => ({ dropdown: !s.dropdown }))
  }

  toggleModal = (which) => () => {
    if (!this.state[`${which}Modal`]) {
      this.toggleDropdown()
    }

    this.setState(s => {
      s[`${which}Modal`] = !s[`${which}Modal`]
      return s
    })
  }

  onInputChange = (input) => () => {
    this.props.onAddFiles(input.files)
    input.value = null
    this.toggleDropdown()
  }

  onAddByPath = (path) => {
    this.props.onAddByPath(path)
    this.toggleModal('byPath')()
  }

  onMakeDir = (path) => {
    this.props.onMakeDir(path)
    this.toggleModal('newFolder')()
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
            <nav className='flex flex-column'>
              <Option onClick={() => this.filesInput.click()}>
                <DocumentIcon className='fill-aqua w2 mr1' />
                Add file
              </Option>
              <Option onClick={() => this.folderInput.click()}>
                <FolderIcon className='fill-aqua w2 mr1' />
                Add folder
              </Option>
              <Option onClick={this.toggleModal('byPath')}>
                <DecentralizationIcon className='fill-aqua w2 mr1' />
                Add by path
              </Option>
              <Option className='bt border-snow' onClick={this.toggleModal('newFolder')}>
                <FolderIcon className='fill-aqua w2 mr1' />
                New folder
              </Option>
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

        <Overlay show={this.state.byPathModal} onLeave={this.toggleModal('byPath')}>
          <ByPathModal
            className='outline-0'
            onCancel={this.toggleModal('byPath')}
            onSubmit={this.onAddByPath} />
        </Overlay>

        <Overlay show={this.state.newFolderModal} onLeave={this.toggleModal('newFolder')}>
          <NewFolderModal
            className='outline-0'
            onCancel={this.toggleModal('newFolder')}
            onSubmit={this.onMakeDir} />
        </Overlay>
      </div>
    )
  }
}

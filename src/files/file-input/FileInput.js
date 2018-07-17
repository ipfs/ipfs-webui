import React from 'react'
import PropTypes from 'prop-types'
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

const AddButton = ({ progress = null, ...props }) => {
  const sending = progress !== null
  let cls = 'Button f7 relative transition-all sans-serif dib v-mid fw5 nowrap lh-copy bn br1 pa2 focus-outline'
  if (sending) {
    cls += ' bg-grey light-grey'
  } else {
    cls += ' pointer bg-aqua white'
  }

  return (
    <button disabled={sending} className={cls} style={{width: '120px'}} {...props}>
      <div className='absolute top-0 left-0 1 pa2 w-100 z-2'>
        {sending ? `${progress.toFixed(0)}%` : '+ Add to IPFS'}
      </div>&nbsp;

      { sending &&
        <div className='transition-all absolute top-0 br1 left-0 h-100 z-1' style={{width: `${progress}%`, background: 'rgba(0,0,0,0.1)'}} />
      }
    </button>
  )
}

export default class FileInput extends React.Component {
  static propTypes = {
    onMakeDir: PropTypes.func.isRequired,
    onAddFiles: PropTypes.func.isRequired,
    onAddByPath: PropTypes.func.isRequired,
    addProgress: PropTypes.number
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
      <div className={this.props.className}>
        <Dropdown>
          <AddButton progress={this.props.addProgress} onClick={this.toggleDropdown} />
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

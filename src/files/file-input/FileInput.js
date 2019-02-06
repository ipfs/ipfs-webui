import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { translate } from 'react-i18next'
// Icons
import DocumentIcon from '../../icons/StrokeDocument'
import FolderIcon from '../../icons/StrokeFolder'
import DecentralizationIcon from '../../icons/StrokeDecentralization'
// Components
import { Dropdown, DropdownMenu, Option } from '../dropdown/Dropdown'
import Button from '../../components/button/Button'
import Overlay from '../../components/overlay/Overlay'
import ByPathModal from './ByPathModal'

const AddButton = translate('files')(({ progress = null, t, tReady, i18n, lng, ...props }) => {
  const sending = progress !== null
  const cls = classnames({
    'bg-grey light-grey': sending,
    'pointer bg-green white': !sending
  }, ['f6 relative'])

  return (
    <Button disabled={sending} className={cls} minWidth='120px' {...props}>
      <div className='absolute top-0 left-0 1 pa2 w-100 z-2'>
        { sending ? `${progress.toFixed(0)}%` : `+ ${t('addToIPFS')}` }
      </div>&nbsp;

      { sending &&
        <div className='transition-all absolute top-0 br1 left-0 h-100 z-1' style={{ width: `${progress}%`, background: 'rgba(0,0,0,0.1)' }} /> }
    </Button>
  )
})

class FileInput extends React.Component {
  static propTypes = {
    onAddFiles: PropTypes.func.isRequired,
    onAddByPath: PropTypes.func.isRequired,
    addProgress: PropTypes.number,
    t: PropTypes.func.isRequired,
    tReady: PropTypes.bool.isRequired
  }

  state = {
    dropdown: false,
    byPathModal: false,
    force100: false
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

  componentDidUpdate (prev) {
    if (this.props.addProgress === 100 && prev.addProgress !== 100) {
      this.setState({ force100: true })
      setTimeout(() => {
        this.setState({ force100: false })
      }, 2000)
    }
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

  render () {
    let { progress, t } = this.props
    if (this.state.force100) {
      progress = 100
    }

    return (
      <div className={this.props.className}>
        <Dropdown>
          <AddButton progress={progress} onClick={this.toggleDropdown} />
          <DropdownMenu
            top={3}
            open={this.state.dropdown}
            onDismiss={this.toggleDropdown} >
            <Option onClick={() => this.filesInput.click()}>
              <DocumentIcon className='fill-aqua w2 mr1' />
              {t('addFile')}
            </Option>
            <Option onClick={() => this.folderInput.click()}>
              <FolderIcon className='fill-aqua w2 mr1' />
              {t('addFolder')}
            </Option>
            <Option onClick={this.toggleModal('byPath')}>
              <DecentralizationIcon className='fill-aqua w2 mr1' />
              {t('addByPath')}
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

        <Overlay show={this.state.byPathModal} onLeave={this.toggleModal('byPath')}>
          <ByPathModal
            className='outline-0'
            onCancel={this.toggleModal('byPath')}
            onSubmit={this.onAddByPath} />
        </Overlay>
      </div>
    )
  }
}

export default translate('files')(FileInput)

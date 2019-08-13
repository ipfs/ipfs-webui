import React from 'react'
import PropTypes from 'prop-types'
import { join } from 'path'
import { withTranslation } from 'react-i18next'
import Overlay from '../../components/overlay/Overlay'
// Modals
import NewFolderModal from './new-folder-modal/NewFolderModal'
import ShareModal from './share-modal/ShareModal'
import RenameModal from './rename-modal/RenameModal'
import DeleteModal from './delete-modal/DeleteModal'
import AddByPathModal from './add-by-path-modal/AddByPathModal'
// Constants
const NEW_FOLDER = 'new_folder'
const SHARE = 'share'
const RENAME = 'rename'
const DELETE = 'delete'
const ADD_BY_PATH = 'add_by_path'

export {
  NEW_FOLDER,
  SHARE,
  RENAME,
  DELETE,
  ADD_BY_PATH
}

class Modals extends React.Component {
  state = {
    readyToShow: false,
    rename: {
      folder: false,
      path: '',
      filename: ''
    },
    delete: {
      files: 0,
      folder: 0,
      paths: []
    },
    link: ''
  }

  onAddByPath = (path) => {
    this.props.onAddByPath(path)
    this.leave()
  }

  makeDir = (path) => {
    this.props.onMakeDir(join(this.props.root, path))
    this.leave()
  }

  rename = (newName) => {
    const { filename, path } = this.state.rename
    const { onMove } = this.props

    if (newName !== '' && newName !== filename) {
      onMove(path, path.replace(filename, newName))
    }

    this.leave()
  }

  delete = () => {
    const { paths } = this.state.delete

    this.props.onDelete(paths)
    this.leave()
  }

  leave = () => {
    this.setState({ readyToShow: false })
    this.props.done()
  }

  componentDidUpdate (prev) {
    const { show, files, t, onShareLink } = this.props

    if (show === prev.show) {
      return
    }

    switch (show) {
      case SHARE:
        this.setState({
          link: t('generating'),
          readyToShow: true
        })

        onShareLink(files).then(link => this.setState({ link }))
        break

      case RENAME:
        const file = files[0]

        this.setState({
          readyToShow: true,
          rename: {
            folder: file.type === 'directory',
            path: file.path,
            filename: file.path.split('/').pop()
          }
        })
        break

      case DELETE:
        let filesCount = 0
        let foldersCount = 0

        files.forEach(file => file.type === 'file' ? filesCount++ : foldersCount++)

        this.setState({
          readyToShow: true,
          delete: {
            files: filesCount,
            folders: foldersCount,
            paths: files.map(f => f.path)
          }
        })
        break
      default:
        this.setState({ readyToShow: true })
    }
  }

  render () {
    const { show } = this.props
    const { readyToShow, link, rename } = this.state

    return (
      <div>
        <Overlay show={show === NEW_FOLDER && readyToShow} onLeave={this.leave}>
          <NewFolderModal
            className='outline-0'
            onCancel={this.leave}
            onSubmit={this.makeDir} />
        </Overlay>

        <Overlay show={show === SHARE && readyToShow} onLeave={this.leave}>
          <ShareModal
            className='outline-0'
            link={link}
            onLeave={this.leave} />
        </Overlay>

        <Overlay show={show === RENAME && readyToShow} onLeave={this.leave}>
          <RenameModal
            className='outline-0'
            { ...rename }
            onCancel={this.leave}
            onSubmit={this.rename} />
        </Overlay>

        <Overlay show={show === DELETE && readyToShow} onLeave={this.leave}>
          <DeleteModal
            className='outline-0'
            { ...this.state.delete }
            onCancel={this.leave}
            onDelete={this.delete} />
        </Overlay>

        <Overlay show={show === ADD_BY_PATH && readyToShow} onLeave={this.leave}>
          <AddByPathModal
            className='outline-0'
            onSubmit={this.onAddByPath}
            onCancel={this.leave} />
        </Overlay>
      </div>
    )
  }
}

Modals.propTypes = {
  t: PropTypes.func.isRequired,
  show: PropTypes.string,
  files: PropTypes.array,
  onAddByPath: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onMakeDir: PropTypes.func.isRequired,
  onShareLink: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default withTranslation('files')(Modals)

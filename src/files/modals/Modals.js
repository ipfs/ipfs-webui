import React from 'react'
import PropTypes from 'prop-types'
import { join } from 'path'
import { withTranslation } from 'react-i18next'
import Overlay from '../../components/overlay/Overlay.js'
// Modals
import NewFolderModal from './new-folder-modal/NewFolderModal.js'
import ShareModal from './share-modal/ShareModal.js'
import RenameModal from './rename-modal/RenameModal.js'
import PinningModal from './pinning-modal/PinningModal.js'
import RemoveModal from './remove-modal/RemoveModal.js'
import AddByPathModal from './add-by-path-modal/AddByPathModal.js'
import PublishModal from './publish-modal/PublishModal.js'
import CliTutorMode from '../../components/cli-tutor-mode/CliTutorMode.js'
import { cliCommandList, cliCmdKeys } from '../../bundles/files/consts.js'
import { realMfsPath } from '../../bundles/files/actions.js'
// Constants
const NEW_FOLDER = 'new_folder'
const SHARE = 'share'
const RENAME = 'rename'
const DELETE = 'delete'
const ADD_BY_PATH = 'add_by_path'
const CLI_TUTOR_MODE = 'cli_tutor_mode'
const PINNING = 'pinning'
const PUBLISH = 'publish'

export {
  NEW_FOLDER,
  SHARE,
  RENAME,
  DELETE,
  ADD_BY_PATH,
  CLI_TUTOR_MODE,
  PINNING,
  PUBLISH
}

class Modals extends React.Component {
  state = {
    readyToShow: false,
    rename: {
      folder: false,
      path: '',
      filename: ''
    },
    pinning: {
      file: null
    },
    publish: {
      file: null
    },
    delete: {
      filesCount: 0,
      folderCount: 0,
      files: []
    },
    link: '',
    command: 'ipfs --help'
  }

  onAddByPath = (path, name) => {
    this.props.onAddByPath(path, name)
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

  delete = (args) => {
    const { files } = this.state.delete

    this.props.onRemove({ files, ...args })
    this.leave()
  }

  leave = () => {
    this.setState({ readyToShow: false })
    this.props.done()
  }

  onPinningSet = (...pinningServices) => {
    this.props.onPinningSet(...pinningServices)
    this.leave()
  }

  publish = async (key) => {
    const file = this.state.publish.file
    const cid = file.cid.toString()
    await this.props.onPublish(cid, key)
  }

  componentDidUpdate (prev) {
    const { show, files, t, onShareLink, cliOptions, root } = this.props

    if (show === prev.show) {
      return
    }

    switch (show) {
      case SHARE: {
        this.setState({
          link: t('generating'),
          readyToShow: true
        })

        onShareLink(files).then(link => this.setState({ link }))
        break
      }
      case RENAME: {
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
      }
      case DELETE: {
        let filesCount = 0
        let foldersCount = 0

        files.forEach(file => file.type === 'file' ? filesCount++ : foldersCount++)

        this.setState({
          readyToShow: true,
          delete: {
            files,
            filesCount,
            foldersCount
          }
        })
        break
      }
      case NEW_FOLDER:
      case ADD_BY_PATH:
        this.setState({ readyToShow: true })
        break
      case CLI_TUTOR_MODE:
        this.setState({ command: this.cliCommand(cliOptions, files, root) }, () => {
          this.setState({ readyToShow: true })
        })
        break
      case PINNING: {
        const file = files[0]

        return this.setState({
          readyToShow: true,
          pinning: { file }
        })
      }
      case PUBLISH: {
        const file = files[0]

        return this.setState({
          readyToShow: true,
          publish: { file }
        })
      }
      default:
        // do nothing
    }
  }

  cliCommand = (action, files, root) => {
    let activeCid = ''
    let fileName = ''
    let isPinned = ''
    let path = ''
    // @TODO: handle multi-select
    if (files) {
      activeCid = files[0].cid
      fileName = files[0].name
      isPinned = files[0].pinned
      path = realMfsPath(files[0].path)
    }

    // @TODO: ensure path is set for all actions
    switch (action) {
      case cliCmdKeys.ADD_FILE:
      case cliCmdKeys.ADD_DIRECTORY:
      case cliCmdKeys.CREATE_NEW_DIRECTORY:
      case cliCmdKeys.FROM_IPFS:
        return cliCommandList[action](root.substring('/files'.length))
      case cliCmdKeys.DELETE_FILE_FROM_IPFS:
      case cliCmdKeys.REMOVE_FILE_FROM_IPFS:
        return cliCommandList[action](path)
      case cliCmdKeys.DOWNLOAD_OBJECT_COMMAND:
        return cliCommandList[action](activeCid)
      case cliCmdKeys.RENAME_IPFS_OBJECT:
        return cliCommandList[action](path, fileName)
      case cliCmdKeys.PIN_OBJECT:
        return cliCommandList[action](activeCid, isPinned ? 'rm' : 'add')
      default:
        return cliCommandList[action]()
    }
  }

  render () {
    const { show, t } = this.props
    const { readyToShow, link, rename, command } = this.state
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
          <RemoveModal
            className='outline-0'
            { ...this.state.delete }
            onCancel={this.leave}
            onRemove={this.delete} />
        </Overlay>

        <Overlay show={show === ADD_BY_PATH && readyToShow} onLeave={this.leave}>
          <AddByPathModal
            className='outline-0'
            onSubmit={this.onAddByPath}
            onCancel={this.leave} />
        </Overlay>

        <Overlay show={show === CLI_TUTOR_MODE && readyToShow} onLeave={this.leave}>
          <CliTutorMode onLeave={this.leave} filesPage={true} command={command} t={t}/>
        </Overlay>

        <Overlay show={show === PINNING && readyToShow} onLeave={this.leave}>
          <PinningModal
            file={this.state.pinning.file}
            className='outline-0'
            onCancel={this.leave}
            onPinningSet={this.onPinningSet} />
        </Overlay>

        <Overlay show={show === PUBLISH && readyToShow} onLeave={this.leave}>
          <PublishModal
            file={this.state.publish.file}
            className='outline-0'
            onLeave={this.leave}
            onSubmit={this.publish} />
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
  onRemove: PropTypes.func.isRequired,
  onPublish: PropTypes.func.isRequired
}

export default withTranslation('files')(Modals)

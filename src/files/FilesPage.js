import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import Breadcrumbs from './breadcrumbs/Breadcrumbs'
import FilesList from './files-list/FilesList'
import FilePreview from './file-preview/FilePreview'
import FileInput from './file-input/FileInput'
import Overlay from '../components/overlay/Overlay'
import ShareModal from './share-modal/ShareModal'
import Errors from './errors/Errors'
import downloadFile from './download-file'
import { join } from 'path'

class FilesPage extends React.Component {
  static propTypes = {
    files: PropTypes.object,
    filesErrors: PropTypes.array.isRequired,
    filesPathFromHash: PropTypes.string,
    writeFilesProgress: PropTypes.number,
    gatewayUrl: PropTypes.string.isRequired,
    navbarWidth: PropTypes.number.isRequired,
    doUpdateHash: PropTypes.func.isRequired,
    doFilesDelete: PropTypes.func.isRequired,
    doFilesMove: PropTypes.func.isRequired,
    doFilesWrite: PropTypes.func.isRequired,
    doFilesAddPath: PropTypes.func.isRequired,
    doFilesDownloadLink: PropTypes.func.isRequired,
    doFilesMakeDir: PropTypes.func.isRequired
  }

  state = {
    downloadAbort: null,
    downloadProgress: null,
    share: {
      isOpen: false,
      link: ''
    }
  }

  makeDir = (path) => this.props.doFilesMakeDir(join(this.props.files.path, path))

  componentDidMount () {
    this.props.doFilesFetch()
  }

  componentDidUpdate (prev) {
    const { filesPathFromHash } = this.props

    if (prev.files === null || filesPathFromHash !== prev.filesPathFromHash) {
      this.props.doFilesFetch()
    }
  }

  download = async (files) => {
    const { doFilesDownloadLink } = this.props
    const { downloadProgress, downloadAbort } = this.state

    if (downloadProgress !== null) {
      downloadAbort()
      return
    }

    const updater = (v) => this.setState({ downloadProgress: v })
    const { url, filename } = await doFilesDownloadLink(files)
    const { abort } = await downloadFile(url, filename, updater)
    this.setState({ downloadAbort: abort })
  }

  add = (raw, root = '') => {
    const { files, doFilesWrite } = this.props

    if (root === '') {
      root = files.path
    }

    doFilesWrite(root, raw)
  }

  addByPath = (path) => {
    const { doFilesAddPath, files } = this.props
    doFilesAddPath(files.path, path)
  }

  inspect = (hash) => {
    const { doUpdateHash } = this.props

    if (Array.isArray(hash)) {
      hash = hash[0].hash
    }

    doUpdateHash(`/explore/ipfs/${hash}`)
  }

  share = async (files) => {
    this.setState({
      share: {
        isOpen: true,
        link: await this.props.doFilesShareLink(files)
      }
    })
  }

  closeShare = () => {
    this.setState({
      share: {
        isOpen: false,
        link: ''
      }
    })
  }

  render () {
    const {
      files,
      writeFilesProgress,
      navbarWidth,
      doFilesDismissErrors,
      doFilesMove,
      doFilesDelete,
      doFilesNavigateTo,
      filesErrors: errors
    } = this.props

    return (
      <div data-id='FilesPage'>
        <Helmet>
          <title>Files - IPFS</title>
        </Helmet>
        { files &&
          <div>
            <Errors errors={errors} onDismiss={doFilesDismissErrors} />

            <div className='flex flex-wrap items-center justify-between mb3'>
              <Breadcrumbs className='mb3' path={files.path} onClick={doFilesNavigateTo} />

              { files.type === 'directory' &&
                <FileInput
                  className='mb3'
                  onMakeDir={this.makeDir}
                  onAddFiles={this.add}
                  onAddByPath={this.addByPath}
                  addProgress={writeFilesProgress} />
              }
            </div>

            { files.type === 'directory' ? (
              <FilesList
                maxWidth={`calc(100% - ${navbarWidth}px)`}
                root={files.path}
                files={files.content}
                upperDir={files.upper}
                downloadProgress={this.state.downloadProgress}
                onShare={this.share}
                onInspect={this.inspect}
                onDownload={this.download}
                onAddFiles={this.add}
                onNavigate={doFilesNavigateTo}
                onDelete={doFilesDelete}
                onMove={doFilesMove}
              />
            ) : (
              <FilePreview {...files} gatewayUrl={this.props.gatewayUrl} />
            )}
          </div>
        }

        <Overlay show={this.state.share.isOpen} onLeave={this.closeShare}>
          <ShareModal
            className='outline-0'
            link={this.state.share.link}
            onLeave={this.closeShare} />
        </Overlay>
      </div>
    )
  }
}

export default connect(
  'doUpdateHash',
  'doFilesDelete',
  'doFilesMove',
  'doFilesWrite',
  'doFilesAddPath',
  'doFilesDownloadLink',
  'doFilesShareLink',
  'doFilesMakeDir',
  'doFilesFetch',
  'doFilesDismissErrors',
  'doFilesNavigateTo',
  'selectFiles',
  'selectFilesErrors',
  'selectGatewayUrl',
  'selectWriteFilesProgress',
  'selectNavbarWidth',
  'selectFilesPathFromHash',
  FilesPage
)

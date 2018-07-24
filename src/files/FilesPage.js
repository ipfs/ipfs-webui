import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import Breadcrumbs from './breadcrumbs/Breadcrumbs'
import FilesList from './files-list/FilesList'
import FilePreview from './file-preview/FilePreview'
import FileInput from './file-input/FileInput'
import downloadFile from './download-file'
import { join } from 'path'
import ms from 'milliseconds'

const action = (name) => {
  return (...args) => {
    console.log(name, args)
  }
}

class FilesPage extends React.Component {
  static propTypes = {
    routeInfo: PropTypes.object.isRequired,
    files: PropTypes.object,
    filesErrors: PropTypes.array.isRequired,
    ipfsReady: PropTypes.bool,
    writeFilesProgress: PropTypes.number,
    gatewayUrl: PropTypes.string.isRequired,
    actionBarWidth: PropTypes.string.isRequired,
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
    downloadProgress: null
  }

  makeDir = (path) => this.props.doFilesMakeDir(join(this.props.files.path, path))

  navigate = (path) => {
    const link = path.split('/').map(p => encodeURIComponent(p)).join('/')
    this.props.doUpdateHash(`/files${link}`)
  }

  updateFiles = async () => {
    if (this.props.ipfsReady) {
      const path = decodeURIComponent(this.props.routeInfo.params.path)
      await this.props.doFilesFetch(path)
    }
  }

  componentDidMount () {
    this.updateFiles()
    setInterval(this.updateFiles, ms.minutes(1))
  }

  componentDidUpdate (prev) {
    const { ipfsReady, routeInfo } = this.props

    if (ipfsReady && (prev.files === null || routeInfo.params.path !== prev.routeInfo.params.path)) {
      this.updateFiles()
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

  add = async (raw, root = '') => {
    const { files, doFilesWrite } = this.props

    if (root === '') {
      root = files.path
    }

    await doFilesWrite(root, raw)
  }

  addByPath = async (path) => {
    const { doFilesAddPath, files } = this.props
    await doFilesAddPath(files.path, path)
  }

  inspect = (hash) => {
    const { doUpdateHash } = this.props

    if (Array.isArray(hash)) {
      hash = hash[0].hash
    }

    doUpdateHash(`/explore/ipfs/${hash}`)
  }

  render () {
    const { files, writeFilesProgress, actionBarWidth, doFilesMove, doFilesDelete } = this.props

    return (
      <div data-id='FilesPage'>
        <Helmet>
          <title>Files - IPFS</title>
        </Helmet>
        { files &&
          <div>
            <div className='flex flex-wrap items-center justify-between mb3'>
              <Breadcrumbs className='mb3' path={files.path} onClick={this.navigate} />

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
                maxWidth={actionBarWidth}
                root={files.path}
                files={files.content}
                downloadProgress={this.state.downloadProgress}
                onShare={action('Share')}
                onInspect={this.inspect}
                onDownload={this.download}
                onAddFiles={this.add}
                onNavigate={this.navigate}
                onDelete={doFilesDelete}
                onMove={doFilesMove}
              />
            ) : (
              <FilePreview {...files} gatewayUrl={this.props.gatewayUrl} />
            )}
          </div>
        }
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
  'doFilesMakeDir',
  'doFilesFetch',
  'selectFiles',
  'selectFilesErrors',
  'selectGatewayUrl',
  'selectIpfsReady',
  'selectRouteInfo',
  'selectWriteFilesProgress',
  'selectActionBarWidth',
  FilesPage
)

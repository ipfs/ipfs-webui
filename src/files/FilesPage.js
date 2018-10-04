import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import downloadFile from './download-file'
import { join } from 'path'
import { translate } from 'react-i18next'

// Components
import Breadcrumbs from './breadcrumbs/Breadcrumbs'
import FilesList from './files-list/FilesList'
import FilePreview from './file-preview/FilePreview'
import FileInput from './file-input/FileInput'
import Overlay from '../components/overlay/Overlay'
import ShareModal from './share-modal/ShareModal'
import RenameModal from './rename-modal/RenameModal'
import DeleteModal from './delete-modal/DeleteModal'
import Box from '../components/box/Box'

const defaultState = {
  downloadAbort: null,
  downloadProgress: null,
  share: {
    isOpen: false,
    link: ''
  },
  rename: {
    isOpen: false,
    path: '',
    filename: ''
  },
  delete: {
    isOpen: false,
    paths: [],
    files: 0,
    folders: 0
  }
}

class FilesPage extends React.Component {
  static propTypes = {
    ipfsProvider: PropTypes.string,
    files: PropTypes.object,
    filesErrors: PropTypes.array,
    filesPathFromHash: PropTypes.string,
    filesSorting: PropTypes.object.isRequired,
    writeFilesProgress: PropTypes.number,
    gatewayUrl: PropTypes.string.isRequired,
    navbarWidth: PropTypes.number.isRequired,
    doUpdateHash: PropTypes.func.isRequired,
    doFilesDelete: PropTypes.func.isRequired,
    doFilesMove: PropTypes.func.isRequired,
    doFilesWrite: PropTypes.func.isRequired,
    doFilesAddPath: PropTypes.func.isRequired,
    doFilesDownloadLink: PropTypes.func.isRequired,
    doFilesMakeDir: PropTypes.func.isRequired,
    doFilesUpdateSorting: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    tReady: PropTypes.bool.isRequired
  }

  state = defaultState

  resetState = (field) => this.setState({ [field]: defaultState[field] })

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

  showShareModal = (files) => {
    this.setState({
      share: {
        isOpen: true,
        link: 'Generating...'
      }
    })

    this.props.doFilesShareLink(files).then(link => {
      this.setState({
        share: {
          isOpen: true,
          link: link
        }
      })
    })
  }

  showRenameModal = ([file]) => {
    this.setState({
      rename: {
        folder: file.type === 'directory',
        isOpen: true,
        path: file.path,
        filename: file.path.split('/').pop()
      }
    })
  }

  rename = (newName) => {
    const { filename, path } = this.state.rename
    this.resetState('rename')

    if (newName !== '' && newName !== filename) {
      this.props.doFilesMove([path, path.replace(filename, newName)])
    }
  }

  showDeleteModal = (files) => {
    let filesCount = 0
    let foldersCount = 0

    files.forEach(file => file.type === 'file' ? filesCount++ : foldersCount++)

    this.setState({
      delete: {
        isOpen: true,
        files: filesCount,
        folders: foldersCount,
        paths: files.map(f => f.path)
      }
    })
  }

  delete = () => {
    const { paths } = this.state.delete

    this.resetState('delete')
    this.props.doFilesDelete(paths)
  }

  render () {
    const {
      ipfsProvider,
      files,
      writeFilesProgress,
      navbarWidth,
      doFilesMove,
      doFilesNavigateTo,
      doFilesUpdateSorting,
      filesSorting: sort,
      t
    } = this.props

    const {
      share,
      rename,
      delete: deleteModal
    } = this.state

    const isCompanion = ipfsProvider === 'window.ipfs'
    const filesExist = files && files.content.length

    return (
      <div data-id='FilesPage'>
        <Helmet>
          <title>{t('title')} - IPFS</title>
        </Helmet>

        { files &&
          <div>
            <div className='flex flex-wrap'>
              <Breadcrumbs className='mb3' path={files.path} onClick={doFilesNavigateTo} />

              { files.type === 'directory' &&
                <FileInput
                  className='mb3 ml-auto'
                  onMakeDir={this.makeDir}
                  onAddFiles={this.add}
                  onAddByPath={this.addByPath}
                  addProgress={writeFilesProgress} />
              }
            </div>

            { files.type === 'directory' ? (
              <FilesList
                maxWidth={`calc(100% - ${navbarWidth}px)`}
                key={window.encodeURIComponent(files.path)}
                root={files.path}
                sort={sort}
                updateSorting={doFilesUpdateSorting}
                files={files.content}
                upperDir={files.upper}
                downloadProgress={this.state.downloadProgress}
                onShare={this.showShareModal}
                onInspect={this.inspect}
                onDownload={this.download}
                onAddFiles={this.add}
                onRename={this.showRenameModal}
                onDelete={this.showDeleteModal}
                onNavigate={doFilesNavigateTo}
                onMove={doFilesMove}
              />
            ) : (
              <FilePreview {...files} gatewayUrl={this.props.gatewayUrl} />
            )}
          </div>
        }

        { isCompanion && <CompanionInfo /> }

        { !filesExist && <WelcomeInfo /> }

        <Overlay show={share.isOpen} onLeave={() => this.resetState('share')}>
          <ShareModal
            className='outline-0'
            link={share.link}
            onLeave={() => this.resetState('share')} />
        </Overlay>

        <Overlay show={rename.isOpen} onLeave={() => this.resetState('rename')}>
          <RenameModal
            className='outline-0'
            folder={rename.folder}
            filename={rename.filename}
            onCancel={() => this.resetState('rename')}
            onSubmit={this.rename} />
        </Overlay>

        <Overlay show={deleteModal.isOpen} onLeave={() => this.resetState('delete')}>
          <DeleteModal
            className='outline-0'
            files={deleteModal.files}
            folders={deleteModal.folders}
            onCancel={() => this.resetState('delete')}
            onDelete={this.delete} />
        </Overlay>
      </div>
    )
  }
}

const CompanionInfo = () => (
  <div className='mv4 tc navy f6' >
    <Box style={{ background: 'rgba(105, 196, 205, 0.1)' }}>
      <p className='ma0'>As you are using <strong>IPFS Companion</strong>, the files view is limited to files added while using the extension.</p>
    </Box>
  </div>
)

const WelcomeInfo = () => (
  <div className='flex'>
    <div className='flex-auto pr3 lh-copy mid-gray'>
      <Box>
        <h1 className='mt0 mb4 montserrat fw4 f3 green'>Welcome to the IPFS Web UI!</h1>
        <p className='f6'><a href='#/' className='link aqua'>Check the status</a> and various information about your node, such as the current network traffic, bandwith and the distribution of peers by country.</p>
        <p className='f6'>Easily <a href='#/files' className='link aqua'>manage the files</a> in your IFPS repo. Change their tree, rename them, add files, share or download them.</p>
        <p className='f6'>You can also <a href='#/explore' className='link aqua'>explore the merkle forest</a> of multiple projects. Even better, explore the ones of your own files!</p>
        <p className='f6'>See a live map of where the <a href='#/peers' className='link aqua'>peers</a> you are connected to are. You can even check some more basic information about them.</p>
        <p className='mb4 f6'><a href='#/peers' className='link aqua'>Manage the configuration</a> of your IPFS daemon to better suit your needs.</p>
        <p className='mb0 f6'>If you want to help push the Web UI forward, <a href='https://github.com/ipfs-shipyard/ipfs-webui' className='link aqua'>check out its code</a> or <a href='https://github.com/ipfs-shipyard/ipfs-webui/issues' className='link aqua'>report a bug</a>!</p>
      </Box>
    </div>
    <div className='measure lh-copy dn db-l flex-none mid-gray f6' style={{ maxWidth: '40%' }}>
      <Box>
        <p className='mt0'><strong>IPFS is a protocol</strong> that defines a content-addressed file system, coordinates content delivery and combines ideas from Kademlia, BitTorrent, Git and more.</p>
        <p><strong>IPFS is a filesystem.</strong> It has directories and files and mountable filesystem via FUSE.</p>
        <p><strong>IPFS is a web.</strong> Files are accessible via HTTP at <code className='f6'>https://ipfs.io/&lt;path&gt;</code>. Browsers <a className='link blue' target='_blank' rel='noopener noreferrer' href='https://github.com/ipfs-shipyard/ipfs-companion#release-channel'>can be extended</a> to use the <code className='f6'>ipfs://</code> or <code className='f6'>dweb:/ipfs/</code> schemes directly, and hash-addressed content guarantees authenticity</p>
        <p><strong>IPFS is p2p.</strong> It supports worldwide peer-to-peer file transfers with a completely decentralized architecture and no central point of failure.</p>
        <p><strong>IPFS is a CDN.</strong> Add a file to your local repository, and it's now available to the world with cache-friendly content-hash addressing and bittorrent-like bandwidth distribution.</p>
      </Box>
    </div>
  </div>
)

export default connect(
  'selectIpfsProvider',
  'doUpdateHash',
  'doFilesDelete',
  'doFilesMove',
  'doFilesWrite',
  'doFilesAddPath',
  'doFilesDownloadLink',
  'doFilesShareLink',
  'doFilesMakeDir',
  'doFilesFetch',
  'doFilesNavigateTo',
  'doFilesUpdateSorting',
  'selectFiles',
  'selectGatewayUrl',
  'selectWriteFilesProgress',
  'selectNavbarWidth',
  'selectFilesPathFromHash',
  'selectFilesSorting',
  translate('files')(FilesPage)
)

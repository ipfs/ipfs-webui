/* eslint-disable space-before-function-paren */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { getNavHelper } from 'internal-nav-helper'
import ReactJoyride from 'react-joyride'
import { withTranslation } from 'react-i18next'
import { normalizeFiles } from './lib/files'
// React DnD
import { DropTarget } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
// Lib
import { appTour } from './lib/tours'
import { getJoyrideLocales } from './helpers/i8n'
// Components
import NavBar from './navigation/NavBar'
import ComponentLoader from './loader/ComponentLoader'
import Notify from './components/notify/Notify'
// import Connected from './components/connected/Connected'
// import TourHelper from './components/tour/TourHelper'
import FilesExploreForm from './files/explore-form/FilesExploreForm'
import { join } from 'path'
import { constructFileFromLocalFileData } from 'get-file-object-from-local-path'
const ipfsSyncedPath = '/files/synced_path'
export class App extends Component {
  static propTypes = {
    doTryInitIpfs: PropTypes.func.isRequired,
    doUpdateUrl: PropTypes.func.isRequired,
    doUpdateHash: PropTypes.func.isRequired,
    doFilesWrite: PropTypes.func.isRequired,
    routeInfo: PropTypes.object.isRequired,
    filesPathInfo: PropTypes.object,
    // Injected by DropTarget
    isOver: PropTypes.bool.isRequired
  }

  initIpcRenderer = () => {
    const { doFilesMakeDir, doFilesDelete, doFilesWrite } = this.props
    if (window.ipcRenderer) {
      try {
        //* this is needed to sync with local file path surely.
        doFilesMakeDir(ipfsSyncedPath)
        window.ipcRenderer.invoke('invoke-path-watch')
        console.log('ipcRenderer: ', window.ipcRenderer)
        window.ipcRenderer.receive('synced_local_add_dir', async (...args) => {
          const resSyncedIPFSPath = await window.ipcRenderer.invoke('invoke-sync-path-fetch')
          console.log('resSyncedLocalPath : ', resSyncedIPFSPath)
          const path = args?.[0]
          if (path) {
            const subPath = path.toString().replace(resSyncedIPFSPath, '')
            console.log('sub dir path: ', subPath)
            doFilesMakeDir(join(ipfsSyncedPath, subPath), true)
          }
          console.log('synced_local_add_dir : ', { args })
        })

        window.ipcRenderer.receive('synced_local_add_file', async (...args) => {
          console.log('synced_local_add_file : ', { args })
          const resSyncedIPFSPath = await window.ipcRenderer.invoke('invoke-sync-path-fetch')
          const fileData = constructFileFromLocalFileData(args?.[1])
          const subPath = args?.[0].toString().replace(resSyncedIPFSPath, '')
          const fullPath = join(ipfsSyncedPath, subPath)
          const subs = fullPath.split('/')
          const addedAtPath = subs.slice(0, -1).join('/')
          console.log('constructFileFromLocalFileData : ', { fileData, addedAtPath })
          doFilesWrite(normalizeFiles([fileData]), addedAtPath)
        })
        window.ipcRenderer.receive('synced_local_delete_file', async (...args) => {
          console.log('synced_local_delete_file : ', { args })
          const resSyncedIPFSPath = await window.ipcRenderer.invoke('invoke-sync-path-fetch')
          console.log('resSyncedLocalPath : ', resSyncedIPFSPath)
          const path = args?.[0]
          if (path) {
            const subPath = path.toString().replace(resSyncedIPFSPath, '')
            console.log('sub dir path: ', subPath)
            const fullPath = join(ipfsSyncedPath, subPath)
            doFilesDelete({ files: [{ path: fullPath }] }, true)
          }
        })
        window.ipcRenderer.receive('synced_local_delete_dir', async (...args) => {
          console.log('synced_local_delete_dir : ', { args })
          const resSyncedIPFSPath = await window.ipcRenderer.invoke('invoke-sync-path-fetch')
          const path = args?.[0]
          if (path) {
            const subPath = path.toString().replace(resSyncedIPFSPath, '')
            console.log('sub dir path: ', subPath)
            doFilesDelete?.({ files: [{ path: join(ipfsSyncedPath, subPath) }] }, true)
          }
        })
        window.ipcRenderer.receive('synced_local_change', (...args) => {
          console.log('synced_local_change : ', { args })
        })
      } catch (ex) {
        console.log('exception at doFilsMakeDir at first : ', ex)
      }
    }
  }

  componentDidMount() {
    this.props.doTryInitIpfs()

    this.initIpcRenderer()
    // const { doFilesDelete } = this.props
    // setTimeout(() => {
    //   doFilesDelete?.({ files: [{ path: ipfsSyncedPath + '/autodir3455' }] })
    // }, 3000)
  }

  addFiles = async (filesPromise) => {
    const { doFilesWrite, doUpdateHash, routeInfo, filesPathInfo } = this.props
    const isFilesPage = routeInfo.pattern === '/files*'
    const addAtPath = isFilesPage ? (filesPathInfo?.realPath || routeInfo.params.path) : '/'
    const files = await filesPromise

    doFilesWrite(normalizeFiles(files), addAtPath)
    // Change to the files pages if the user is not there
    if (!isFilesPage) {
      doUpdateHash('/files')
    }
  }

  handleJoyrideCb = (data) => {
    if (data.action === 'close') {
      this.props.doDisableTooltip()
    }
  }

  render() {
    const { t, route: Page, ipfsReady, doFilesNavigateTo, doExploreUserProvidedPath, routeInfo: { url }, connectDropTarget, canDrop, isOver, showTooltip } = this.props
    return connectDropTarget(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div id='bg-anchor' className='sans-serif h-100 relative' onClick={getNavHelper(this.props.doUpdateUrl)}>
        {/* Tinted overlay that appears when dragging and dropping an item */}
        {canDrop && isOver && <div className='h-100 top-0 right-0 fixed appOverlay' style={{ background: 'rgba(99, 202, 210, 0.2)' }} />}
        <div className='flex flex-column-reverse justify-end' style={{ minHeight: 'calc(100vh - 6px)' }}>
          <div id='main-page' style={{ height: '0', overflow: 'auto', padding: '10px', marginRight: '3px', marginTop: '1px' }} className='flex-auto'>
            <main style={{ height: 'calc(100% - 28px' }} className='pv3 pa3'>
              {(ipfsReady || url === '/welcome' || url.startsWith('/settings'))
                ? <Page />
                : <ComponentLoader />
              }
            </main>
          </div>
          <div className='flex items-center' style={{ marginRight: '2px', marginLeft: '3px', marginTop: '2px' }}>
            <div className='joyride-app-explore flex-auto' style={{ width: 560 }}>
              <FilesExploreForm onBrowse={doFilesNavigateTo} onInspect={doExploreUserProvidedPath} />
            </div>
            {/* <div className='flex items-center justify-end'>
              <Connected className='joyride-app-status' />
            </div> */}
          </div>
          <div className='navbar-container'>
            <NavBar />
          </div>
        </div>

        <ReactJoyride
          run={showTooltip}
          steps={appTour.getSteps({ t })}
          styles={appTour.styles}
          callback={this.handleJoyrideCb}
          scrollToFirstStep
          disableOverlay
          locale={getJoyrideLocales(t)}
        />

        <Notify />
      </div>
    )
  }
}

const dropTarget = {
  drop: (props, monitor, App) => {
    if (monitor.didDrop()) {
      return
    }

    const { filesPromise } = monitor.getItem()
    App.addFiles(filesPromise)
  },
  canDrop: (props) => props.filesPathInfo ? props.filesPathInfo.isMfs : true
}

const dropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
})

export const AppWithDropTarget = DropTarget(NativeTypes.FILE, dropTarget, dropCollect)(App)

export default connect(
  'selectRoute',
  'selectRouteInfo',
  'selectIpfsReady',
  'selectShowTooltip',
  'doFilesNavigateTo',
  'doExploreUserProvidedPath',
  'doUpdateUrl',
  'doUpdateHash',
  'doTryInitIpfs',
  'doFilesWrite',
  'doFilesMakeDir',
  'doFilesDelete',
  'doDisableTooltip',
  'selectFilesPathInfo',
  withTranslation('app')(AppWithDropTarget)
)

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import navHelper from 'internal-nav-helper'
import { IpldExploreForm } from 'ipld-explorer-components'
// React DnD
import { DragDropContext, DropTarget } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import DnDBackend from './lib/dnd-backend'
// Components
import NavBar from './navigation/NavBar'
import ComponentLoader from './loader/ComponentLoader'
import Notify from './components/notify/Notify'
import Connected from './components/connected/Connected'

export class App extends Component {
  static propTypes = {
    doInitIpfs: PropTypes.func.isRequired,
    doUpdateUrl: PropTypes.func.isRequired,
    doUpdateHash: PropTypes.func.isRequired,
    doFilesWrite: PropTypes.func.isRequired,
    route: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element
    ]).isRequired,
    routeInfo: PropTypes.object.isRequired,
    navbarIsOpen: PropTypes.bool.isRequired
  }

  componentWillMount () {
    this.props.doInitIpfs()
  }

  addFiles = (files) => {
    const { doFilesWrite, doUpdateHash, routeInfo } = this.props

    // Add the dropped files to the root
    doFilesWrite('/', files)

    // Change to the files pages if the user is not there
    if (!routeInfo.url.startsWith('/files')) {
      doUpdateHash('/files')
    }
  }

  render () {
    const { route: Page, ipfsReady, routeInfo: { url }, navbarIsOpen, connectDropTarget } = this.props

    return connectDropTarget(
      <div className='sans-serif' onClick={navHelper(this.props.doUpdateUrl)}>
        <div className='flex-l' style={{ minHeight: '100vh' }}>
          <div className={`flex-none-l bg-navy ${navbarIsOpen ? 'w5-l' : 'w4-l'}`}>
            <NavBar />
          </div>
          <div className='flex-auto-l'>
            <div className='flex items-center ph3 ph4-l' style={{ height: 75, background: '#F0F6FA', paddingTop: '20px', paddingBottom: '15px' }}>
              <div style={{ width: 560 }}>
                <IpldExploreForm />
              </div>
              <div className='dn db-ns flex-auto tr'>
                <Connected />
              </div>
            </div>
            <main className='bg-white pv3 pa3-ns pa4-l'>
              { (ipfsReady || url === '/welcome')
                ? <Page />
                : <ComponentLoader pastDelay />
              }
            </main>
          </div>
        </div>
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

    const item = monitor.getItem()

    App.addFiles(item)
  }
}

const dropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
})

export const AppWithDropTarget = DropTarget(NativeTypes.FILE, dropTarget, dropCollect)(App)

export default connect(
  'selectRoute',
  'selectNavbarIsOpen',
  'selectRouteInfo',
  'doUpdateUrl',
  'doUpdateHash',
  'doInitIpfs',
  'doFilesWrite',
  'selectIpfsReady',
  DragDropContext(DnDBackend)(AppWithDropTarget)
)

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import NavBar from './navigation/NavBar'
import navHelper from 'internal-nav-helper'
import { IpldExploreForm } from 'ipld-explorer-components'
import AsyncRequestLoader from './loader/AsyncRequestLoader'
import { DragDropContext } from 'react-dnd'
import DnDBackend from './lib/dnd-backend'
import ComponentLoader from './loader/ComponentLoader'
import Notify from './components/notify/Notify'

export class App extends Component {
  static propTypes = {
    doInitIpfs: PropTypes.func.isRequired,
    doUpdateUrl: PropTypes.func.isRequired,
    route: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element
    ]).isRequired,
    routeInfo: PropTypes.object.isRequired
  }

  componentWillMount () {
    this.props.doInitIpfs()
  }

  render () {
    const { route: Page, ipfsReady, routeInfo: { url } } = this.props

    return (
      <div className='sans-serif' onClick={navHelper(this.props.doUpdateUrl)}>
        <div className='flex' style={{ minHeight: '100vh' }}>
          <div className='flex-none bg-navy'>
            <NavBar />
          </div>
          <div className='flex-auto'>
            <div className='flex items-center' style={{ background: '#F0F6FA', padding: '20px 40px 15px' }}>
              <div className='' style={{ width: 560, maxWidth: '80%' }}>
                <IpldExploreForm />
              </div>
              <div className='flex-auto tr yellow'>
                <svg className='fill-current-color' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM6.5 9L10 5.5 13.5 9H11v4H9V9H6.5zm11 6L14 18.5 10.5 15H13v-4h2v4h2.5z "></path>
                </svg>
              </div>
            </div>
            <main className='bg-white' style={{ padding: '40px' }}>
              { (ipfsReady || url === '/welcome')
                ? <Page />
                : <ComponentLoader pastDelay />
              }
            </main>
          </div>
        </div>
        <div className='absolute top-0 left-0 pa2'>
          <AsyncRequestLoader />
        </div>
        <Notify />
      </div>
    )
  }
}

export default connect(
  'selectRoute',
  'selectRouteInfo',
  'doUpdateUrl',
  'doInitIpfs',
  'selectIpfsReady',
  DragDropContext(DnDBackend)(App)
)

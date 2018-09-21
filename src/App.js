import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import NavBar from './navigation/NavBar'
import navHelper from 'internal-nav-helper'
import { IpldExploreForm } from 'ipld-explorer-components'
import { DragDropContext } from 'react-dnd'
import DnDBackend from './lib/dnd-backend'
import ComponentLoader from './loader/ComponentLoader'
import Notify from './components/notify/Notify'
import Connected from './components/connected/Connected'

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
              <div className='flex-auto tr'>
                <Connected />
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

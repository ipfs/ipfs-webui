import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import NavBar from './navigation/NavBar'
import navHelper from 'internal-nav-helper'
import IpldExploreForm from './explore/src/components/IpldExploreForm'
import AsyncRequestLoader from './loader/AsyncRequestLoader'
import { DragDropContext } from 'react-dnd'
import DnDBackend from './lib/dnd-backend'
import ComponentLoader from './loader/ComponentLoader'

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
        <div className='flex' style={{minHeight: '100vh'}}>
          <div className='flex-none bg-navy'>
            <NavBar />
          </div>
          <div className='flex-auto'>
            <div style={{background: '#F0F6FA', padding: '20px 40px 15px'}}>
              <IpldExploreForm />
            </div>
            <main className='bg-white' style={{padding: '40px'}}>
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

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import NavBar from './navigation/NavBar'
import navHelper from 'internal-nav-helper'
import IpldExploreForm from './ipld/IpldExploreForm'
import AsyncRequestLoader from './loader/AsyncRequestLoader'

export class App extends Component {
  static propTypes = {
    doInitIpfs: PropTypes.func.isRequired,
    doUpdateUrl: PropTypes.func.isRequired,
    route: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element
    ]).isRequired
  }

  componentWillMount () {
    this.props.doInitIpfs()
  }

  render () {
    const Page = this.props.route
    return (
      <div className='sans-serif' onClick={navHelper(this.props.doUpdateUrl)}>
        <div className='dt dt--fixed' style={{minHeight: '100vh'}}>
          <div className='dtc v-top' style={{width: 240, background: '#0E3A52'}}>
            <NavBar />
          </div>
          <div className='dtc v-top'>
            <div style={{background: '#F0F6FA'}}>
              <IpldExploreForm />
            </div>
            <main className='pa3'>
              <Page />
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

export default connect('selectRoute', 'doUpdateUrl', 'doInitIpfs', App)

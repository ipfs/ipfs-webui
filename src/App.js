import React, { Component } from 'react'
import { connect } from 'redux-bundler-react'
import NavBar from './navigation/NavBar'
import navHelper from 'internal-nav-helper'

class App extends Component {
  componentWillMount () {
    this.props.doInitIpfs()
  }

  render () {
    const Page = this.props.route
    return (
      <div onClick={navHelper(this.props.doUpdateUrl)}>
        <div className='sans-serif flex'>
          <div className='w-25'>
            <NavBar />
          </div>
          <div className='flex-auto pa3'>
            <Page />
          </div>
        </div>
      </div>
    )
  }
}

export default connect('selectRoute', 'doUpdateUrl', 'doInitIpfs', App)

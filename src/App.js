import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import NavBar from './navigation/NavBar'
import navHelper from 'internal-nav-helper'
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
      <div onClick={navHelper(this.props.doUpdateUrl)}>
        <div className='sans-serif flex'>
          <div style={{width: 240}}>
            <NavBar />
          </div>
          <div className='flex-auto pa3'>
            <Page />
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

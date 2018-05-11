import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import NavBar from './navigation/NavBar'
import navHelper from 'internal-nav-helper'

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

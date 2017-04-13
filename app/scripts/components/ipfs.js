import React from 'react'
import {toastr} from 'react-redux-toastr'
import createReactClass from 'create-react-class'

const host = (process.env.NODE_ENV !== 'production') ? 'localhost' : window.location.hostname
const port = (process.env.NODE_ENV !== 'production') ? '5001' : (window.location.port || 80)
const ipfs = require('ipfs-api')(host, port)

let version = ''
let gateway = '//127.0.0.1:8080'

export const withIpfs = (Component) => {
  return createReactClass({
    displayName: `withIpfs(${Component.displayName || Component.name || 'Component'})`,

    getInitialState () {
      return {version, gateway}
    },

    componentDidMount () {
      ipfs.version((err, res) => {
        if (err) {
          console.error(err)
          return toastr.error('Failed to determine local IPFS version. Is the IPFS daemon running?')
        }
        version = res.Version
        this.setState({version: res.Version})
      })
      ipfs.config.get('Addresses.Gateway', (err, res) => {
        if (err) {
          console.error(err)
          return toastr.error('Failed to get configured IPFS gateway. Is the IPFS daemon running?')
        }
        if (res == null) {
          console.error(new Error('No Gateway found'))
          return toastr.error('Missing IPFS gateway configuration')
        }

        const split = res.split('/')
        const port = split[4]
        gateway = '//' + window.location.hostname + ':' + port
        this.setState({gateway})
      })
    },

    render () {
      return <Component ipfs={ipfs} host={host} gateway={this.state.gateway} {...this.props} />
    }
  })
}

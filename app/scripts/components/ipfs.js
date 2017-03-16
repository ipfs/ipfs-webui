import React from 'react'

const host = (process.env.NODE_ENV !== 'production') ? 'localhost' : window.location.hostname
const port = (process.env.NODE_ENV !== 'production') ? '5001' : (window.location.port || 80)
const ipfs = require('ipfs-api')(host, port)

let version = ''
let gateway = '//127.0.0.1:8080'

export const withIpfs = (Component) => {
  return React.createClass({
    displayName: `withIpfs(${Component.displayName || Component.name || 'Component'})`,

    getInitialState () {
      return {version, gateway}
    },

    componentDidMount () {
      ipfs.version((err, res) => {
        if (err) return console.error(err)
        version = res.Version
        this.setState({version: res.Version})
      })
      ipfs.config.get('Addresses.Gateway', (err, res) => {
        if (err) {
          return console.error(err)
        }
        if (res == null) {
          return console.error(new Error('No Gateway found'))
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

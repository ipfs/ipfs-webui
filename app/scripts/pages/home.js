import React from 'react'
import Peer from '../views/peer'
// import {lookupPretty as getLocation} from 'ipfs-geoip'
import i18n from '../utils/i18n.js'

var Home = React.createClass({
  displayName: 'Home',
  getInitialState: function () {
    var t = this
    t.props.ipfs.id(function (err, peer) {
      if (err || !peer) return console.error(err)
      t.setState({
        node: {
          peer: peer,
          location: {}
        }
      })

      // getLocation(t.props.ipfs, peer.Addresses, function (err, location) {
      //   if (err || !location) return console.error(err)
      //   t.setState({
      //     node: {
      //       peer: peer,
      //       location: location
      //     }
      //   })
      // })
    })

    // Fix: The request always fails, not sure why (was broken before already)
    // t.props.ipfs.config.get('Gateway.Enabled', function (err, enabled) {
    //   if (err) return console.error(err)
    //   t.setState({ GatewayEnabled: enabled.Value })
    // })

    return {
      node: {
        peer: {
          ID: '',
          PublicKey: '',
          Addresses: [],
          AgentVersion: '',
          ProtocolVersion: ''
        },
        location: { formatted: '' }
      },
      GatewayEnabled: false,
      GatewayUrl: 'http://localhost:8080/'
    }
  },

  onGatewayChange: function (e) {
    var t = this
    var enabled = !t.state.GatewayEnabled
    var api = enabled ? t.props.ipfs.gateway.enable : t.props.ipfs.gateway.disable
    api(function (err) {
      if (err) return console.error(err)
      t.setState({ GatewayEnabled: enabled })
    })
  },

  render: function () {
    var gatewayEnabled = this.state.GatewayEnabled
    var gatewayLink
    if (gatewayEnabled) {
      gatewayLink = <a href={this.state.GatewayUrl}>{i18n.t('Go to gateway')}</a>
    }

    return (
      <div className='row'>
        <div className='col-sm-10 col-sm-offset-1'>

          <h3>{i18n.t('Node Info')}</h3>
          <Peer {...this.state.node} />

          <div className='well hidden'>
            <h4>{i18n.t('HTTP Gateway')}</h4>
            <div className='checkbox'>
              <label>
                <input type='checkbox' className='gateway-toggle' checked={gatewayEnabled} onChange={this.onGatewayChange}/>
                <strong>{i18n.t('Enabled')}</strong>
              </label>
            </div>
            {gatewayLink}
          </div>

        </div>
      </div>
    )
  }
})

module.exports = Home

import React from 'react'
import Peer from '../views/peer'
import {lookupPretty as getLocation} from 'ipfs-geoip'
import i18n from '../utils/i18n.js'
import {Row, Col, Well} from 'react-bootstrap'

export default React.createClass({
  displayName: 'Home',
  getInitialState: function () {
    var t = this
    t.props.ipfs.id(function (err, peer) {
      if (err || !peer) return console.error(err)
      if (!t.isMounted()) return
      t.setState({
        node: {
          peer: peer,
          location: {}
        }
      })

      getLocation(t.props.ipfs, peer.Addresses, function (err, location) {
        if (err || !location) return console.error(err)
        if (!t.isMounted()) return
        t.setState({
          node: {
            peer: peer,
            location: location
          }
        })
      })
    })

    t.props.ipfs.config.get('Gateway', function (err, {Value}) {
      if (err) return console.error(err)
      t.setState({
        GatewayEnabled: !!Value
      })
    })

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
      <Row>
        <Col sm={10} smOffset={1}>

          <h3>{i18n.t('Node Info')}</h3>
          <Peer {...this.state.node} />

          <Well>
            <h4>{i18n.t('HTTP Gateway')}</h4>
            <div className='checkbox'>
              <label>
                <input type='checkbox' className='gateway-toggle' checked={gatewayEnabled} onChange={this.onGatewayChange}/>
                <strong>{i18n.t('Enabled')}</strong>
              </label>
            </div>
            {gatewayLink}
          </Well>

        </Col>
      </Row>
    )
  }
})

import React, {Component} from 'react'
import Peer from '../views/peer'
import {
  lookupPretty as getLocation
}
from 'ipfs-geoip'
import i18n from '../utils/i18n.js'
import {Row, Col, Well} from 'react-bootstrap'

export
default class Home extends Component {
  state = {
    node: {
      peer: {
        ID: '',
        PublicKey: '',
        Addresses: [],
        AgentVersion: '',
        ProtocolVersion: ''
      },
      location: {
        formatted: ''
      }
    },
    GatewayEnabled: false,
    GatewayUrl: 'http://localhost:8080/'
  };

  static displayName = 'Home';
  static propTypes = {
    ipfs: React.PropTypes.object
  };

  componentDidMount () {
    this.mounted = true

    this.props.ipfs.id((err, peer) => {
      if (err || !peer) return console.error(err)
      if (!this.mounted) return
      this.setState({
        node: {
          peer,
          location: {}
        }
      })
      getLocation(this.props.ipfs, peer.Addresses, (err, location) => {
        if (err || !location) return console.error(err)
        if (!this.mounted) return
        this.setState({
          node: {
            peer,
            location
          }
        })
      })
    })

    this.props.ipfs.config.get('Gateway', (err, {
      Value
    }) => {
      if (err) return console.error(err)
      this.setState({
        GatewayEnabled: !!Value
      })
    })

    return
  }

  componentWillUnmount () {
    this.mounted = false
  }

  onGatewayChange () {
    const GatewayEnabled = !this.state.GatewayEnabled
    const api = GatewayEnabled ? this.props.ipfs.gateway.enable : this.props.ipfs.gateway.disable
    api(err => {
      if (err) return console.error(err)
      this.setState({
        GatewayEnabled
      })
    })
  }

  render () {
    const gatewayEnabled = this.state.GatewayEnabled
    const gatewayLink = gatewayEnabled ? <a href={this.state.GatewayUrl}>{i18n.t('Go to gateway')}</a> : null
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
}

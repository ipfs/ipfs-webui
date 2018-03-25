import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Peer from '../views/peer'
import {lookupPretty as getLocation} from 'ipfs-geoip'
import i18n from '../utils/i18n.js'
import {Row, Col} from 'react-bootstrap'

class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      node: {
        peer: {
          id: '',
          publicKey: '',
          addresses: [],
          agentVersion: '',
          protocolVersion: ''
        },
        location: {
          formatted: ''
        }
      }
    }
  }

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
      getLocation(this.props.ipfs, peer.addresses, (err, location) => {
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
  }

  componentWillUnmount () {
    this.mounted = false
  }

  render () {
    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <h3>{i18n.t('Node Info')}</h3>
          <Peer {...this.state.node} />
        </Col>
      </Row>
    )
  }
}

export default Home

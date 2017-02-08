import React from 'react'
import ConnectionList from '../views/connectionlist'
import Globe from '../views/globe'
import {
  lookupPretty as getLocation
}
from 'ipfs-geoip'
import i18n from '../utils/i18n.js'
import {
  Row, Col
}
from 'react-bootstrap'

export
default class Connections extends React.Component {
  state = {
    peers: [],
    locations: {},
    nonce: 0
  };

  static displayName = 'Connections';
  static propTypes = {
    peers: React.PropTypes.array,
    ipfs: React.PropTypes.object
  };

  componentDidMount () {
    this.mounted = true
    this.pollInterval = setInterval(() => this.getPeers(), 1000)
    this.getPeers()
  }

  componentWillUnmount () {
    this.mounted = false
    clearInterval(this.pollInterval)
  }

  getPeers () {
    this.props.ipfs.swarm.peers((err, peers) => {
      if (err) return console.error(err)
        // If we've unmounted, abort
      if (!this.mounted) return

      peers = peers.sort((a, b) => {
        return a.peer.toB58String() > b.peer.toB58String() ? 1 : -1
      })

      peers.forEach((peer, i) => {
        peer.ipfs = this.props.ipfs
        peer.location = {
          formatted: ''
        }

        let id = peer.peer.toB58String()
        let location = this.state.locations[id]
        if (!location) {
          this.state.locations[id] = {}
          const addr = peer.addr.toString()
          getLocation(this.props.ipfs, [addr], (err, res) => {
            if (err) return console.error(err)
            // If we've unmounted, abort
            if (!this.mounted) return

            res = res || {}
            peer.location = res
            let locations = this.state.locations
            locations[id] = res
            peers[i] = peer
            this.setState({
              peers,
              locations,
              nonce: this.state.nonce++
            })
          })
        }
      })
    })
  }

  render () {
    return (
      <Row>
        <Col sm={6} className='globe-column'>
          <Globe peers={this.state.peers} />
        </Col>
        <Col sm={6}>
          <h4>{i18n.t('Connected to X peer', { postProcess: 'sprintf', sprintf: [this.state.peers.length], count: this.state.peers.length })}</h4>
          <div>
            <ConnectionList peers={this.state.peers} />
          </div>
        </Col>
      </Row>
    )
  }
}

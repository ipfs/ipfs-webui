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
    this.props.ipfs.swarm.peers((err, res) => {
      if (err) return console.error(err)
        // If we've unmounted, abort
      if (!this.mounted) return

      let peers = res.Strings.map((peer) => {
        let slashIndex = peer.lastIndexOf('/')
        return {
          Address: peer.substr(0, slashIndex),
          ID: peer.substr(slashIndex + 1)
        }
      })

      peers = peers.sort((a, b) => {
        return a.ID > b.ID ? 1 : -1
      })
      peers.forEach((peer, i) => {
        peer.ipfs = this.props.ipfs
        peer.location = {
          formatted: ''
        }

        let location = this.state.locations[peer.ID]
        if (!location) {
          this.state.locations[peer.ID] = {}
          this.props.ipfs.id(peer.ID, (err, id) => {
            if (err) return console.error(err)

            getLocation(this.props.ipfs, id.Addresses, (err, res) => {
              if (err) return console.error(err)
                // If we've unmounted, abort
              if (!this.mounted) return

              res = res || {}
              peer.location = res
              let locations = this.state.locations
              locations[peer.ID] = res
              peers[i] = peer
              this.setState({
                peers,
                locations,
                nonce: this.state.nonce++
              })
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

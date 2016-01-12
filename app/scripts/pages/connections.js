import React from 'react'
import ConnectionList from '../views/connectionlist'
import Globe from '../views/globe'
import {lookupPretty as getLocation} from 'ipfs-geoip'
import i18n from '../utils/i18n.js'
import {Row, Col} from 'react-bootstrap'

export default React.createClass({
  displayName: 'Connections',
  propTypes: {
    peers: React.PropTypes.array
  },
  getInitialState: function () {
    return {
      peers: [],
      locations: {},
      nonce: 0
    }
  },

  componentDidMount: function () {
    var t = this

    var getPeers = function () {
      t.props.ipfs.swarm.peers(function (err, res) {
        if (err) return console.error(err)
        // If we've unmounted, abort
        if (!t.isMounted()) return

        var peers = res.Strings.map(function (peer) {
          var slashIndex = peer.lastIndexOf('/')
          return {
            Address: peer.substr(0, slashIndex),
            ID: peer.substr(slashIndex + 1)
          }
        })

        peers = peers.sort(function (a, b) {
          return a.ID > b.ID ? 1 : -1
        })
        peers.forEach(function (peer, i) {
          peer.ipfs = t.props.ipfs
          peer.location = { formatted: '' }

          var location = t.state.locations[peer.ID]
          if (!location) {
            t.state.locations[peer.ID] = {}
            t.props.ipfs.id(peer.ID, function (err, id) {
              if (err) return console.error(err)

              getLocation(t.props.ipfs, id.Addresses, function (err, res) {
                if (err) return console.error(err)
                // If we've unmounted, abort
                if (!t.isMounted()) return

                res = res || {}
                peer.location = res
                var locations = t.state.locations
                locations[peer.ID] = res
                peers[i] = peer
                t.setState({
                  peers: peers,
                  locations: locations,
                  nonce: t.state.nonce++
                })
              })
            })
          }
        })
      })
    }

    t.pollInterval = setInterval(getPeers, 1000)
    getPeers()
  },

  componentWillUnmount: function () {
    clearInterval(this.pollInterval)
  },

  render: function () {
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
})

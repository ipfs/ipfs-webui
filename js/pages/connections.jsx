'use strict'
var React = require('react/addons')
var ConnectionList = require('../views/connectionlist.jsx')
var Globe = require('../views/globe.jsx')
var getLocation = require('../getlocation.js')
var Connections = React.createClass({
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
        peers.map(function (peer) {
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
                t.state.locations[peer.ID] = res
                t.setState({
                  peers: peers,
                  locations: t.state.locations,
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
      <div className='row'>
        <div className='col-sm-6 globe-column'>
          <Globe peers={this.state.peers} />
        </div>
        <div className='col-sm-6'>
          <h4>Connected to {this.state.peers.length} peer{this.state.peers.length !== 1 ? 's' : ''}</h4>
          <div>
            <ConnectionList peers={this.state.peers} />
          </div>
        </div>
      </div>
    )
  }
})

module.exports = Connections

'use strict'
var React = require('react/addons')
var ConnectionList = require('./js/connectionlist.jsx')
var Globe = require('./js/globe.jsx')
var getLocation = require('../../js/utils/getlocation.js')
var ipfsapp = require('ipfs-web-app')

var Connections = React.createClass({
  displayName: 'Connections',
  propTypes: {
    ipfs: React.PropTypes.object
  },
  getInitialState: function () {
    return {
      peers: [],
      locations: {},
      nonce: 0
    }
  },

  componentDidMount: function () {
    var self = this

    var getPeers = function () {
      self.props.ipfs.swarm.peers(function (err, res) {
        if (err) return console.error(err)
        // If we've unmounted, abort
        if (!self.isMounted()) return

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
          peer.ipfs = self.props.ipfs
          peer.location = { formatted: '' }

          var location = self.state.locations[peer.ID]
          if (!location) {
            self.state.locations[peer.ID] = {}
            self.props.ipfs.id(peer.ID, function (err, id) {
              if (err) return console.error(err)

              getLocation(self.props.ipfs, id.Addresses, function (err, res) {
                if (err) return console.error(err)
                // If we've unmounted, abort
                if (!self.isMounted()) return

                res = res || {}
                peer.location = res
                self.state.locations[peer.ID] = res
                self.setState({
                  peers: peers,
                  locations: self.state.locations,
                  nonce: self.state.nonce++
                })
              })
            })
          }
        })
      })
    }

    self.pollInterval = setInterval(getPeers, 1000)
    getPeers()
  },

  componentWillUnmount: function () {
    clearInterval(this.pollInterval)
  },

  render: function () {
    return (
      <div className='row'>
        <div className='col-sm-6'>
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

ipfsapp.define({
  init: function (ipfs) {
    React.render(<Connections ipfs={ipfs} />,
                 document.getElementById('connections'))
  }
})

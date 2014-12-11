var React = require('react')
var Nav = require('../views/nav.jsx')
var ConnectionList = require('../views/connectionlist.jsx')
var SwarmVis = require('../views/swarmvis.jsx')

function getLocation(multiaddr, cb) {
  var address = multiaddr.split('/')[2]

  // TODO: pick a random host from a list
  $.get('http://104.131.90.88:8080/json/' + address, function(res) {
    var location = res.country_name
    if(res.region_code) location = res.region_code + ', ' + location
    if(res.city) location = res.city + ', ' + location

    res.formatted = location
    cb(null, res)
  })
}

module.exports = React.createClass({
  getInitialState: function() {
    var t = this

    var getPeers = function() {
      t.props.ipfs.swarm.peers(function(err, res) {
        if(err) return console.error(err);

        var peers = res.Peers.sort(function(a, b) {
          return a.ID > b.ID ? 1 : -1
        })
        peers.map(function(peer) {
          peer.ipfs = t.props.ipfs

          var location = t.state.locations[peer.ID]
          if(!location) {
            getLocation(peer.Address, function(err, res) {
              if(err) return console.error(err)

              peer.location = res.formatted
              t.state.locations[peer.ID] = res
              t.setState({
                peers: this.state.peers,
                locations: this.state.locations
              })
            })
          } else {
            peer.location = location.formatted
          }
        })

        t.setState({ peers: peers })
      })
    }

    getPeers()
    t.props.pollInterval = setInterval(getPeers, 1000)

    return {
      peers: [],
      locations: {}
    }
  },

  componentWillUnmount: function() {
    clearInterval(this.props.pollInterval)
  },

  render: function() {
    return (
  <div className="row">
    <div className="col-sm-10 col-sm-offset-1">

      <h4>Connected to {this.state.peers.length} peer{this.state.peers.length !== 1 ? 's' : ''}</h4>
      <div className="panel panel-default">
        {ConnectionList({
          peers: this.state.peers
        })}
      </div>

    </div>
  </div>
    )
  }
})

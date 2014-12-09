var React = require('react')
var Nav = require('../views/nav.jsx')
var ConnectionList = require('../views/connectionlist.jsx')
var SwarmVis = require('../views/swarmvis.jsx')

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
        })

        t.setState({ peers: peers })
      })
    }

    getPeers()
    t.props.pollInterval = setInterval(getPeers, 1000)

    return { peers: [] }
  },

  componentWillUnmount: function() {
    clearInterval(this.props.pollInterval)
  },

  render: function() {
    return (
  <div className="row">
    <div className="col-sm-10 col-sm-offset-1">

      <Nav activeKey={2} />

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

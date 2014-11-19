var React = require('react')
var Nav = require('../views/nav.jsx')
var PeerList = require('../views/peerlist.jsx')
var SwarmVis = require('../views/swarmvis.jsx')

module.exports = React.createClass({
  getInitialState: function() {
    var t = this

    t.props.ipfs.swarm.peers(function(err, peers) {
      if(!err) t.setState({ peers: peers })
    });

    t.props.pollInterval = setInterval(function() {
      t.props.ipfs.swarm.peers(function(err, peers) {
        peers = peers.sort();
        if(!err) t.setState({ peers: peers })
      });
    }, 1000)

    return { peers: [] }
  },

  componentWillUnmount: function() {
    clearInterval(this.props.pollInterval)
  },

  render: function() {
    return (
  <div className="row">
    <div className="col-sm-8 col-sm-offset-2">

      <Nav activeKey={2} />

      <div className="panel panel-default">
        {PeerList({
          peers: this.state.peers
        })}
      </div>

    </div>
  </div>
    )
  }
})

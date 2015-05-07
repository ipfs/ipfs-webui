var React = require('react')
var DHTGraph = require('../views/dhtgraph.jsx')

var base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
var base58Index = {}
for (var i = 0; i < base58Chars.length; i++) {
  base58Index[base58Chars[i]] = i / 58
}

function idToAngle (id) {
  var sub = id.substr(2, 4)
  var angle = 0
  for (var i = 0; i < sub.length; i++) {
    angle += base58Index[sub[i]] * (1 / Math.pow(58, i))
  }
  return angle * Math.PI * 2
}

var Routing = React.createClass({
  displayName: 'Routing',
  propTypes: {
    ipfs: React.PropTypes.object
  },
  getInitialState: function () {
    var t = this

    t.props.ipfs.id(function (err, id) {
      if (err) return console.error(err)

      t.props.ipfs.swarm.peers(function (err, res) {
        if (err) return console.error(err)

        var peers = res.Peers || []
        peers.push(id)
        peers = peers.map(function (peer) {
          return {
            pos: idToAngle(peer.ID),
            id: peer.ID
          }
        })

        console.log(peers)
        t.setState({ peers: peers })
      })
    })

    return {
      peers: []
    }
  },

  render: function () {
    return (
      <div className='row'>
        <div className='col-sm-10 col-sm-offset-1'>
          <DHTGraph peers={this.state.peers}/>
        </div>
      </div>
    )
  }
})

module.exports = Routing

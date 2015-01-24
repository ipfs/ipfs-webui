var React = require('react')
var Nav = require('../views/nav.jsx')
var ConnectionList = require('../views/connectionlist.jsx')
var SwarmVis = require('../views/swarmvis.jsx')

function getLocation(multiaddrs, cb) {
  var address = multiaddrs[0].split('/')[2]

  // TODO: pick a random host from a list
  $.get('http://freegeoip.net/json/' + address, function(res) {
    var location = res.country_name
    if(!location) {
      if(multiaddrs.length > 1)
        return getLocation(multiaddrs.slice(1), cb);
      return cb(null, res);
    }
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

        var peers = res.Strings.map(function(peer) {
          var slashIndex = peer.lastIndexOf('/');
          return {
            Address: peer.substr(0, slashIndex),
            ID: peer.substr(slashIndex+1)
          }
        });

        peers = peers.sort(function(a, b) {
          return a.ID > b.ID ? 1 : -1
        })
        peers.map(function(peer) {
          peer.ipfs = t.props.ipfs
          peer.location = { formatted: '' }

          var location = t.state.locations[peer.ID]
          if(!location) {
            t.state.locations[peer.ID] = {}
            t.props.ipfs.id(peer.ID, function(err, id) {
              if(err) return console.error(err)

              getLocation(id.Addresses, function(err, res) {
                if(err) return console.error(err)

                peer.location = res
                t.state.locations[peer.ID] = res
                t.setState({
                  peers: peers,
                  locations: t.state.locations,
                  nonce: t.state.nonce++
                })
              })
            });
          }
        })
      })
    }

    getPeers()
    t.props.pollInterval = setInterval(getPeers, 1000)

    return {
      peers: [],
      locations: {},
      nonce: 0
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

      <Globe peers={this.state.peers} />

    </div>
  </div>
    )
  }
})

var Globe = React.createClass({
  getInitialState: function() {
    return { globe: null }
  },

  componentDidMount: function() {
    console.log('mount')
    var globe = new DAT.Globe(this.getDOMNode(), {
      imgDir: './static/img/'
    })
    globe.animate()
    this.setState({ globe: globe })
  },

  addPoints: function() {
    console.log(this.props.peers)
    var data = []
    this.props.peers.forEach(function(peer) {
      if(peer.location && peer.location.latitude && peer.location.longitude)
        data.push(peer.location.latitude, peer.location.longitude, 0.25)
    })

    if(!this.state.globe) return
    console.log('adding new data to globe:', data)
    this.state.globe.addData(data, { format: 'magnitude' })
    this.state.globe.createPoints()
  },

  render: function() {
    this.addPoints()
    return <div></div>
  }
})

var React = require('react')
var Nav = require('../views/nav.jsx')
var ConnectionList = require('../views/connectionlist.jsx')
var SwarmVis = require('../views/swarmvis.jsx')
var getLocation = require('../getlocation.js')

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
    <div className="col-sm-6">
      <Globe peers={this.state.peers} />
    </div>
    <div className="col-sm-6">
      <h4>Connected to {this.state.peers.length} peer{this.state.peers.length !== 1 ? 's' : ''}</h4>
      <div>
        {ConnectionList({
          peers: this.state.peers
        })}
      </div>
    </div>
  </div>
    )
  }
})

var pathSplit = window.location.pathname.split('/')
var texturePath = '/'+pathSplit[1]+'/'+pathSplit[2]+'/static/img/'

var Globe = React.createClass({
  getInitialState: function() {
    return { globe: null }
  },

  componentDidMount: function() {
    console.log('mount')
    var globe = new DAT.Globe(this.getDOMNode(), {
      imgDir: texturePath
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
    return <div className="globe-container"></div>
  }
})

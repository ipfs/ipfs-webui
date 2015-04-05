'use strict';
var React = require('react/addons')
var PureRenderMixin = React.addons.PureRenderMixin
var LocalStorageMixin = require('react-localstorage')
var Nav = require('../views/nav.jsx')
var ConnectionList = require('../views/connectionlist.jsx')
var SwarmVis = require('../views/swarmvis.jsx')
var getLocation = require('../getlocation.js')
var LocalStorage = require('../utils/localStorage')
var debug = require('debug')('ipfs:pages:connections')
var _ = require('lodash')

var Connections = React.createClass({
  getInitialState: function() {
    return {
      peers: [],
      locations: {},
      nonce: 0
    };
  },

  componentDidMount: function() {
    var t = this;

    var getPeers = function() {
      t.props.ipfs.swarm.peers(function(err, res) {
        if(err) return console.error(err);

        var peers = res.Strings.map(function(peer) {
          var slashIndex = peer.lastIndexOf('/');
          return {
            Address: peer.substr(0, slashIndex),
            ID: peer.substr(slashIndex+1)
          };
        });

        peers = peers.sort(function(a, b) {
          return a.ID > b.ID ? 1 : -1;
        });
        peers.map(function(peer) {
          peer.ipfs = t.props.ipfs;
          peer.location = { formatted: '' };

          var location = t.state.locations[peer.ID];
          if(!location) {
            t.state.locations[peer.ID] = {};
            t.props.ipfs.id(peer.ID, function(err, id) {
              if(err) return console.error(err);

              getLocation(id.Addresses, function(err, res) {
                if(err) return console.error(err);

                res = res || {};
                peer.location = res;
                t.state.locations[peer.ID] = res;
                t.setState({
                  peers: peers,
                  locations: t.state.locations,
                  nonce: t.state.nonce++
                });
              });
            });
          }
        });
      });
    };

    t.pollInterval = setInterval(getPeers, 1000);
    getPeers();
  },

  componentWillUnmount: function() {
    clearInterval(this.pollInterval);
  },

  render: function() {
    return (
      <div className="row">
        <div className="col-sm-6 globe-column">
          <Globe peers={this.state.peers} />
        </div>
        <div className="col-sm-6">
          <h4>Connected to {this.state.peers.length} peer{this.state.peers.length !== 1 ? 's' : ''}</h4>
          <div>
            <ConnectionList peers={this.state.peers} />
          </div>
        </div>
      </div>
    );
  }
});

var lsKey = 'globeTheme';
var Globe = React.createClass({

  mixins: [PureRenderMixin, LocalStorageMixin],

  getInitialState: function() {
    return {
      theme: 'light'
    };
  },

  componentDidMount: function() {
    this.createGlobe();
  },

  componentWillUnmount: function() {
    this.globe && this.globe.dispose();
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.theme !== this.state.theme) {
      debug('disposing globe');
      this.globe && this.globe.dispose();
      this.createGlobe();
    }

    this.addPoints(this.state.globe);
  },

  addPoints: function() {
    var data = this.parsePeers();
    if (!this.globe || !data.length) return;
    // TODO find difference between old points and new points
    // and only add the new ones. THREE might be doing this internally.
    debug('adding %d points, %j', data.length, data);
    this.globe.addData(data, { format: 'magnitude' });
    this.globe.createPoints();
  },

  createGlobe: function() {
    var slash = window.location.pathname.slice(-1) === '/' ? '' : '/';
    var texturePath = window.location.pathname + slash + 'static/img/';
    if (this.state.theme === 'dark') texturePath += 'dark-';

    debug('mounting globe');
    this.globe = new window.DAT.Globe(this.refs.globe.getDOMNode(), {
      imgDir: texturePath
    });
    this.globe.animate();
  },

  parsePeers: function(peers) {
    var data = {};
    _.forEach(this.props.peers, function(peer, i) {
      if (!(peer.location && peer.location.latitude && peer.location.longitude)) return;
      var key = peer.location.latitude + '|' + peer.location.longitude;
      if (!data[key]) data[key] = 0;
      data[key] = [peer.location.latitude, peer.location.longitude, Math.min(10, data[key] + 0.1)];
    });

    return _.flatten(_.values(data));
  },

  toggleTheme: function() {
    var theme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.setState({theme: theme});
  },

  render: function() {
    return (
      <div className="globe-container">
        <div ref="globe" style={{width:'100%', 'height': '600px'}}></div>
        <div className="theme-toggle" onClick={this.toggleTheme}>
          <i className="fa fa-exchange" />
        </div>
      </div>
    );
  }
});

module.exports = Connections;

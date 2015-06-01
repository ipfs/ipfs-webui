var React = require('react/addons')
var DATGlobe = require('../include/globe.js')
var LocalStorageMixin = require('react-localstorage')
var debug = require('debug')('ipfs:pages:connections')
var _ = require('lodash')
// Displays webgl warning message if not present
require('../include/Detector.js')

var Globe = React.createClass({
  displayName: 'Globe',
  propTypes: {
    peers: React.PropTypes.array
  },
  mixins: [LocalStorageMixin],

  getInitialState: function () {
    return {
      theme: 'light'
    }
  },

  componentDidMount: function () {
    this.createGlobe()
  },

  componentWillUnmount: function () {
    this.globe && this.globe.dispose()
  },

  componentDidUpdate: function (prevProps, prevState) {
    if (prevState.theme !== this.state.theme) {
      debug('disposing globe')
      this.globe && this.globe.dispose()
      this.createGlobe()
    }

    this.addPoints()
  },

  addPoints: function () {
    var data = this.parsePeers()
    if (!this.globe || !data.length) return
    // TODO find difference between old points and new points
    // and only add the new ones. THREE might be doing this internally.
    debug('adding %d points, %j', data.length, data)
    this.globe.addData(data, { format: 'magnitude' })
    this.globe.createPoints()
  },

  createGlobe: function () {
    var slash = window.location.pathname.slice(-1) === '/' ? '' : '/'
    var texturePath = window.location.pathname + slash + 'static/img/'
    if (this.state.theme === 'dark') texturePath += 'dark-'

    debug('mounting globe')
    console.log(DATGlobe)
    this.globe = new DATGlobe(this.refs.globe.getDOMNode(), {
      imgDir: texturePath
    })
    this.globe.animate()
  },

  parsePeers: function (peers) {
    var data = {}
    _.forEach(this.props.peers, function (peer, i) {
      if (!(peer.location && peer.location.latitude && peer.location.longitude)) return
      var key = peer.location.latitude + '|' + peer.location.longitude
      if (!data[key]) data[key] = 0
      data[key] = [peer.location.latitude, peer.location.longitude, Math.min(10, data[key] + 0.1)]
    })

    return _.flatten(_.values(data))
  },

  toggleTheme: function () {
    var theme = this.state.theme === 'dark' ? 'light' : 'dark'
    this.setState({theme: theme})
  },

  render: function () {
    return (
      <div className='globe-container'>
        <div ref='globe' style={{width: '100%', height: '600px'}}></div>
        <div className='theme-toggle' onClick={this.toggleTheme}>
          <i className='fa fa-exchange' />
        </div>
      </div>
    )
  }
})

module.exports = Globe

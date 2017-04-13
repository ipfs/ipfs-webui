import React, {Component} from 'react'
import PropTypes from 'prop-types'
import DATGlobe from '../include/globe.js'
import debug from 'debug'
import { forEach, flatten, values } from 'lodash-es'
// Displays webgl warning message if not present
require('../include/Detector.js')

const log = debug('pages:connections')

export
default class Globe extends Component {
  state = {
    theme: 'light'
  };
  static displayName = 'Globe';
  static propTypes = {
    peers: PropTypes.array
  };

  componentDidMount () {
    this._createGlobe()
  }

  componentWillUnmount () {
    this.globe && this.globe.dispose()
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.theme !== this.state.theme) {
      log('disposing globe')
      this._globe && this._globe.dispose()
      this._createGlobe()
    }
    this._addPoints()
  }

  _addPoints () {
    const data = this._parsePeers()
    if (!this.globe || !data.length) return
    // TODO find difference between old points and new points
    // and only add the new ones. THREE might be doing this internally.
    log('adding %d points, %j', data.length, data)
    this.globe.addData(data, {
      format: 'magnitude'
    })
    this.globe.createPoints()
  }

  _createGlobe () {
    const slash = window.location.pathname.slice(-1) === '/' ? '' : '/'
    const imgDir = window.location.pathname + slash + 'img/' + ((this.state.theme === 'dark') ? 'dark-' : '')
    log('mounting globe')
    this.globe = new DATGlobe(this.refs.globe, {
      imgDir
    })
    this.globe.animate()
  }

  _parsePeers (peers) {
    let data = {}
    forEach(this.props.peers, (peer, i) => {
      if (!(peer.location && peer.location.latitude && peer.location.longitude)) return
      let key = peer.location.latitude + '|' + peer.location.longitude
      if (!data[key]) data[key] = 0
      data[key] = [peer.location.latitude, peer.location.longitude, Math.min(10, data[key] + 0.1)]
    })

    return flatten(values(data))
  }

  render () {
    return (
      <div className='globe-container'>
        <div ref='globe' style={{width: '100%', height: '600px'}} />
        <div className='theme-toggle' onClick={() => this.setState({theme: (this.state.theme === 'dark' ? 'light' : 'dark')})} >
          <i className='fa fa-exchange' />
        </div>
      </div>
    )
  }
}

import React, {Component, PropTypes} from 'react'
import {Row, Col} from 'react-bootstrap'
import map from 'map-async'
import debug from 'debug'

import ConnectionList from '../views/connectionlist'
import i18n from '../utils/i18n.js'

const log = debug('page:connections')
log.error = debug('page:connections:error')

// Cache for all locations
const details = new Map()

function splitId (id) {
  const index = id.lastIndexOf('/')
  return [
    id.substring(0, index).replace(/\/ipfs$/, ''),
    id.substring(index + 1)
  ]
}

function getDetails (ipfs, id, done) {
  if (details.has(id)) return done(null, details.get(id))

  ipfs.id(id, (err, peer) => {
    if (err) return done(err)

    const res = {
      AgentVersion: peer.AgentVersion,
      ProtocolVersion: peer.ProtocolVersion
    }

    details.set(id, res)
    done(null, res)
  })
}

function getPeers (ipfs, done) {
  ipfs.swarm.peers((err, res) => {
    if (err) return done(err)

    map(
      res.Strings,
      (peer, cb) => {
        const [Address, ID] = splitId(peer)
        const res = {
          Address,
          ID,
          location: '',
          AgentVersion: '',
          ProtocolVersion: ''
        }

        getDetails(ipfs, ID, (err, details) => {
          if (err) log.error(err)

          res.AgentVersion = details.AgentVersion
          res.ProtocolVersion = details.ProtocolVersion

          cb(null, res)
        })
      },
      (err, res) => {
        if (err) return done(err)
        done(null, res.sort((a, b) => a.ID > b.ID ? 1 : -1))
      }
    )
  })
}

export
default class Connections extends Component {
  static displayName = 'Connections';
  static propTypes = {
    ipfs: PropTypes.object.isRequired
  };

  state = {
    peers: []
  };

  componentDidMount () {
    this.mounted = true
    const fetch = () => {
      getPeers(this.props.ipfs, (err, peers) => {
        if (err) return log.error(err)
        if (!this.mounted) return

        this.setState({peers})
      })
    }

    this.pollInterval = setInterval(fetch, 1000)
    fetch()
  }

  componentWillUnmount () {
    this.mounted = false
    clearInterval(this.pollInterval)
  }

  render () {
    return (
      <Row>
        <Col sm={12}>
          <h4>
            {i18n.t('Connected to X peer', {
              postProcess: 'sprintf',
              sprintf: [this.state.peers.length],
              count: this.state.peers.length
            })}&nbsp;
            <a href='https://ipfs.io/' target='_blank' className='globe-link'>
              {i18n.t('Click to view an interactive globe of your connections')}
            </a>
          </h4>
          <div>
            <ConnectionList
                ipfs={this.props.ipfs}
                peers={this.state.peers}
            />
          </div>
        </Col>
      </Row>
    )
  }
}

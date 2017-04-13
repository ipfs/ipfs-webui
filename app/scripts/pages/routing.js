import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col
}
from 'react-bootstrap'
import debug from 'debug'
import DHTGraph from '../views/dhtgraph'
import {idToAngle} from '../utils/common'
import {withIpfs} from '../components/ipfs'

const log = debug('pages:routing')

class Routing extends Component {
  state = {
    peers: []
  };

  static displayName = 'Routing';
  static propTypes = {
    ipfs: PropTypes.object
  };

  componentDidMount () {
    this.props.ipfs.id((err, id) => {
      if (err) return console.error(err)
      this.props.ipfs.swarm.peers((err, res) => {
        if (err) return console.error(err)

        let peers = res.Peers || []
        peers.push(id)
        peers = peers.map((peer) => {
          return {
            pos: idToAngle(peer.ID),
            id: peer.ID
          }
        })

        log('peers', peers)
        this.setState({
          peers
        })
      })
    })
  }

  render () {
    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <DHTGraph peers={this.state.peers} />
        </Col>
      </Row>
    )
  }
}

export default withIpfs(Routing)

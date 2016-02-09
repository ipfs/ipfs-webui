import React, {Component} from 'react'
import {
  Row, Col
}
from 'react-bootstrap'
import debug from 'debug'
import DHTGraph from '../views/dhtgraph'
import {idToAngle} from '../utils/common'

const log = debug('pages:routing')

export
default class Routing extends Component {
  state = {
    peers: []
  };

  static displayName = 'Routing';
  static propTypes = {
    ipfs: React.PropTypes.object
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
          <DHTGraph peers={this.state.peers}/>
        </Col>
      </Row>
    )
  }
}

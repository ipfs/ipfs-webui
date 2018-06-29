import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'react-bootstrap'
import debug from 'debug'
import DHTGraph from '../components/dhtgraph'
import {idToAngle} from '../utils/common'
import {withIpfs} from '../components/ipfs'

const log = debug('pages:routing')

class Routing extends Component {
  constructor (props) {
    super(props)
    this.state = {
      peers: []
    }
  }

  componentDidMount () {
    this.props.ipfs.id((err, id) => {
      if (err) {
        return console.error(err)
      }
      this.props.ipfs.swarm.peers((err, res) => {
        if (err) {
          return console.error(err)
        }

        let peers = res.Peers || []
        peers.push(id)
        peers = peers.map((peer) => {
          return { pos: idToAngle(peer.ID), id: peer.ID }
        })

        log('peers', peers)
        this.setState({ peers: peers })
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

Routing.displaName = 'Routing'

Routing.propTypes = {
  ipfs: PropTypes.object
}

export default withIpfs(Routing)

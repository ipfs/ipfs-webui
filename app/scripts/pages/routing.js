import React from 'react'
import {Row, Col} from 'react-bootstrap'
import debug from 'debug'

import DHTGraph from '../views/dhtgraph'

const log = debug('pages:routing')

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

export default React.createClass({
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

        log('peers', peers)
        t.setState({ peers: peers })
      })
    })

    return {
      peers: []
    }
  },

  render: function () {
    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <DHTGraph peers={this.state.peers}/>
        </Col>
      </Row>
    )
  }
})
